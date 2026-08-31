import {
  BadRequestException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { IncomingHttpHeaders } from 'http';
import { z } from 'zod';
import { PrismaService } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { ioRedis } from '@gitroom/nestjs-libraries/redis/redis.service';

export const BOOTSTRAP_PATH = '/api/internal/first-party/bootstrap';
export const TICKET_TTL_SECONDS = 60;
const MAX_SKEW_MS = 300_000;
// A timestamp can be 5 minutes in the future and remain valid for 10 minutes.
export const NONCE_TTL_SECONDS = 601;

const bootstrapSchema = z
  .object({
    user: z
      .object({
        id: z.string().uuid(),
        email: z.string().email().max(320),
        name: z.string().max(200),
      })
      .strict(),
    organization: z
      .object({
        id: z.string().uuid(),
        name: z.string().min(1).max(200),
        slug: z.string().max(200),
        role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'USER', 'SUPERADMIN']),
      })
      .strict(),
    oauth: z
      .object({
        client_id: z.string().min(1).max(200),
        state: z.string().min(1).max(2048),
      })
      .strict(),
  })
  .strict();

type BootstrapPayload = z.infer<typeof bootstrapSchema>;
type LoginTicket = {
  userId: string;
  dosUserId: string;
  organizationId: string;
  clientId: string;
  state: string;
};

@Injectable()
export class FirstPartyBootstrapService {
  constructor(private readonly prisma: PrismaService) {}

  private unavailable(): never {
    throw new ServiceUnavailableException(
      'First-party bootstrap is unavailable'
    );
  }

  private origin(): string {
    // Never derive a redirect from Host, forwarded headers, or request data.
    const configured = process.env.FRONTEND_URL;
    if (
      !['https://beta-post.crove.com', 'https://post.crove.com'].includes(
        configured
      )
    ) {
      this.unavailable();
    }
    return configured;
  }

  private async redis<T>(operation: () => Promise<T>): Promise<T> {
    if (!process.env.REDIS_URL || ioRedis.status !== 'ready')
      this.unavailable();
    let timer: ReturnType<typeof setTimeout>;
    try {
      return await Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Redis timeout')), 3000);
        }),
      ]);
    } catch {
      this.unavailable();
    } finally {
      clearTimeout(timer);
    }
  }

  async authenticate(
    headers: IncomingHttpHeaders,
    rawBody?: Buffer
  ): Promise<void> {
    const secret =
      process.env.CROVE_POST_BOOTSTRAP_SIGNING_SECRET?.trim() ||
      process.env.CROVE_POST_CLIENT_SECRET?.trim();
    const timestamp = headers['x-dos-timestamp'];
    const nonce = headers['x-dos-nonce'];
    const signature = headers['x-dos-signature'];
    if (
      !secret ||
      !Buffer.isBuffer(rawBody) ||
      typeof timestamp !== 'string' ||
      typeof nonce !== 'string' ||
      typeof signature !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(timestamp) ||
      !/^[a-f0-9]{32}$/.test(nonce) ||
      !/^sha256=[a-f0-9]{64}$/.test(signature)
    ) {
      throw new UnauthorizedException();
    }
    const time = Date.parse(timestamp);
    if (
      !Number.isFinite(time) ||
      new Date(time).toISOString() !== timestamp ||
      Math.abs(Date.now() - time) > MAX_SKEW_MS
    ) {
      throw new UnauthorizedException();
    }
    const expected = createHmac('sha256', secret)
      .update(`${timestamp}.${nonce}.POST.${BOOTSTRAP_PATH}.`, 'utf8')
      .update(rawBody)
      .digest();
    if (!timingSafeEqual(expected, Buffer.from(signature.slice(7), 'hex'))) {
      throw new UnauthorizedException();
    }
    // Never use the application's no-Redis mock for security state.
    const claimed = await this.redis(() =>
      ioRedis.set(
        `first-party:nonce:${nonce}`,
        '1',
        'EX',
        NONCE_TTL_SECONDS,
        'NX'
      )
    );
    if (claimed !== 'OK') throw new UnauthorizedException();
  }

  async bootstrap(body: unknown): Promise<{ launch_url: string }> {
    const parsed = bootstrapSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException('Invalid bootstrap payload');
    const payload = parsed.data;
    const origin = this.origin();
    if (!process.env.REDIS_URL || !process.env.JWT_SECRET?.trim())
      this.unavailable();
    // Only the explicitly configured first-party static client may bootstrap.
    if (
      !process.env.CROVE_POST_CLIENT_ID?.trim() ||
      payload.oauth.client_id !== process.env.CROVE_POST_CLIENT_ID.trim()
    ) {
      throw new BadRequestException('Invalid first-party OAuth client');
    }
    await this.validateClient(payload.oauth.client_id);
    const userId = await this.project(payload);
    const ticket = randomBytes(32).toString('hex');
    const value: LoginTicket = {
      userId,
      dosUserId: payload.user.id,
      organizationId: payload.organization.id,
      clientId: payload.oauth.client_id,
      state: payload.oauth.state,
    };
    const stored = await this.redis(() =>
      ioRedis.set(
        this.ticketKey(ticket),
        JSON.stringify(value),
        'EX',
        TICKET_TTL_SECONDS,
        'NX'
      )
    );
    if (stored !== 'OK') this.unavailable();
    // The URL carries only an opaque, single-use handle, never JWTs or PII.
    const launch = new URL('/api/internal/first-party/launch', origin);
    launch.searchParams.set('ticket', ticket);
    return { launch_url: launch.toString() };
  }

  private async validateClient(clientId: string): Promise<void> {
    let app: { id: string } | null;
    try {
      app = await this.prisma.oAuthApp.findFirst({
        where: { clientId, dynamic: false, deletedAt: null },
        select: { id: true },
      });
    } catch {
      this.unavailable();
    }
    if (!app) throw new BadRequestException('Invalid first-party OAuth client');
  }

  private async project(payload: BootstrapPayload): Promise<string> {
    const { user, organization } = payload;
    const role =
      organization.role === 'OWNER' || organization.role === 'SUPERADMIN'
        ? 'SUPERADMIN'
        : organization.role === 'ADMIN'
        ? 'ADMIN'
        : 'USER';
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            // Preserve legacy DOS-linked users and their FKs. Never link by email.
            const existing = await tx.user.findMany({
              where: {
                OR: [
                  { id: user.id },
                  { providerName: 'GENERIC', providerId: user.id },
                ],
              },
            });
            if (
              existing.length > 1 ||
              existing.some(
                (u) =>
                  u.providerName !== 'GENERIC' ||
                  u.providerId !== user.id ||
                  !u.activated ||
                  u.deletedAt
              )
            ) {
              throw new ConflictException('Identity projection conflict');
            }
            const userId = existing[0]?.id || user.id;
            await tx.user.upsert({
              where: { id: userId },
              create: {
                id: userId,
                email: user.email,
                name: user.name,
                providerName: 'GENERIC',
                providerId: user.id,
                timezone: 0,
              },
              update: { email: user.email, name: user.name },
            });
            const org = await tx.organization.findUnique({
              where: { id: organization.id },
            });
            if (org?.deletedAt)
              throw new ConflictException('Organization projection conflict');
            await tx.organization.upsert({
              where: { id: organization.id },
              create: { id: organization.id, name: organization.name },
              update: { name: organization.name },
            });
            await tx.userOrganization.upsert({
              where: {
                userId_organizationId: {
                  userId,
                  organizationId: organization.id,
                },
              },
              create: { userId, organizationId: organization.id, role },
              update: { role, disabled: false },
            });
            return userId;
          },
          { isolationLevel: 'Serializable' }
        );
      } catch (error) {
        if (error instanceof ConflictException) throw error;
        const code =
          error && typeof error === 'object' && 'code' in error
            ? error.code
            : undefined;
        if (code === 'P2034' && attempt < 2) continue;
        if (code === 'P2002')
          throw new ConflictException('Identity projection conflict');
        // Database errors may contain PII; never forward or log them.
        this.unavailable();
      }
    }
    this.unavailable();
  }

  private ticketKey(ticket: string): string {
    return `first-party:ticket:${createHash('sha256')
      .update(ticket)
      .digest('hex')}`;
  }

  async consume(ticket: unknown) {
    const origin = this.origin();
    if (typeof ticket !== 'string' || !/^[a-f0-9]{64}$/.test(ticket)) {
      throw new UnauthorizedException('Invalid or expired ticket');
    }
    if (!process.env.REDIS_URL || !process.env.JWT_SECRET?.trim())
      this.unavailable();
    const stored = await this.redis(() =>
      ioRedis.eval(
        "local v = redis.call('GET', KEYS[1]); if v then redis.call('DEL', KEYS[1]); end; return v",
        1,
        this.ticketKey(ticket)
      )
    );
    if (typeof stored !== 'string')
      throw new UnauthorizedException('Invalid or expired ticket');
    let value: LoginTicket;
    try {
      value = JSON.parse(stored);
    } catch {
      this.unavailable();
    }
    if (value.clientId !== process.env.CROVE_POST_CLIENT_ID?.trim())
      throw new UnauthorizedException();
    await this.validateClient(value.clientId);
    let membership;
    try {
      membership = await this.prisma.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: value.userId,
            organizationId: value.organizationId,
          },
        },
        include: { user: true, organization: true },
      });
    } catch {
      this.unavailable();
    }
    if (
      !membership ||
      membership.disabled ||
      membership.organization.deletedAt ||
      !membership.user.activated ||
      membership.user.deletedAt ||
      membership.user.providerName !== 'GENERIC' ||
      membership.user.providerId !== value.dosUserId
    ) {
      throw new UnauthorizedException('Invalid or expired ticket');
    }
    // Preserve the tuple through the eventual approval, including multi-tab flows.
    const binding = JSON.stringify({
      userId: value.userId,
      organizationId: value.organizationId,
      clientId: value.clientId,
      state: value.state,
    });
    const storedBinding = await this.redis(() =>
      ioRedis.set(this.consentKey(value.state), binding, 'EX', 300, 'NX')
    );
    if (storedBinding !== 'OK')
      throw new UnauthorizedException('Invalid consent session');
    const redirect = new URL('/oauth/authorize', origin);
    redirect.searchParams.set('client_id', value.clientId);
    redirect.searchParams.set('response_type', 'code');
    redirect.searchParams.set('state', value.state);
    return {
      user: membership.user,
      organizationId: value.organizationId,
      redirect: redirect.toString(),
    };
  }

  private consentKey(state: string): string {
    return `first-party:consent:${createHash('sha256')
      .update(state)
      .digest('hex')}`;
  }

  async consumeConsent(
    userId: string,
    organizationId: string,
    clientId: string,
    state?: string
  ): Promise<void> {
    if (!state || state.length > 2048)
      throw new UnauthorizedException('Invalid consent session');
    const expected = JSON.stringify({
      userId,
      organizationId,
      clientId,
      state,
    });
    const consumed = await this.redis(() =>
      ioRedis.eval(
        "local v = redis.call('GET', KEYS[1]); if v == ARGV[1] then redis.call('DEL', KEYS[1]); return 1; end; return 0",
        1,
        this.consentKey(state),
        expected
      )
    );
    if (consumed !== 1)
      throw new UnauthorizedException(
        'Consent session changed or expired; reconnect to continue'
      );
  }
}
