import {
  BadRequestException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { BootstrapDto } from '@gitroom/nestjs-libraries/dtos/provision/bootstrap.dto';
import { BootstrapRepository } from '@gitroom/nestjs-libraries/database/prisma/provision/bootstrap.repository';
import { OAuthService } from '@gitroom/nestjs-libraries/database/prisma/oauth/oauth.service';
import { ioRedis } from '@gitroom/nestjs-libraries/redis/redis.service';

const PATH = '/api/internal/first-party/bootstrap';
const ticketKey = (ticket: string) =>
  `first-party:ticket:${createHash('sha256').update(ticket).digest('hex')}`;
const consentKey = (id: string) => `first-party:consent:${id}`;

type ConsentBinding = {
  consentId: string;
  subject: string;
  userId: string;
  orgId: string;
  clientId: string;
  state: string;
  appId: string;
  redirectUri: string;
  codeChallenge: null;
  codeChallengeMethod: null;
};

@Injectable()
export class BootstrapService {
  constructor(
    private readonly repository: BootstrapRepository,
    private readonly oauth: OAuthService
  ) {}

  async authenticate(
    headers: Record<string, string | string[] | undefined>,
    rawBody?: Buffer
  ) {
    const secret =
      process.env.CROVE_POST_BOOTSTRAP_SIGNING_SECRET?.trim() ||
      process.env.CROVE_POST_CLIENT_SECRET?.trim();
    const timestamp = headers['x-dos-timestamp'];
    const nonce = headers['x-dos-nonce'];
    const signature = headers['x-dos-signature'];
    if (
      process.env.ENABLE_ECOSYSTEM_SYNC === 'false' ||
      !secret ||
      !process.env.REDIS_URL ||
      !Buffer.isBuffer(rawBody) ||
      typeof timestamp !== 'string' ||
      typeof nonce !== 'string' ||
      typeof signature !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(timestamp) ||
      !Number.isFinite(Date.parse(timestamp)) ||
      Math.abs(Date.now() - Date.parse(timestamp)) > 300_000 ||
      !/^[a-f0-9]{32}$/.test(nonce) ||
      !/^sha256=[a-f0-9]{64}$/.test(signature)
    ) {
      throw new UnauthorizedException();
    }
    const expected = createHmac('sha256', secret)
      .update(`${timestamp}.${nonce}.POST.${PATH}.`)
      .update(rawBody)
      .digest();
    if (!timingSafeEqual(expected, Buffer.from(signature.slice(7), 'hex')))
      throw new UnauthorizedException();
    try {
      // A future timestamp remains valid for up to ten minutes from first use.
      const accepted = await ioRedis.set(
        `first-party:nonce:${nonce}`,
        '1',
        'EX',
        601,
        'NX'
      );
      if (accepted !== 'OK') throw new UnauthorizedException();
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new ServiceUnavailableException(
        'Bootstrap temporarily unavailable'
      );
    }
  }

  private origin() {
    try {
      const url = new URL(process.env.FRONTEND_URL || '');
      if (
        url.protocol !== 'https:' ||
        !['beta-post.crove.com', 'post.crove.com'].includes(url.host) ||
        url.username ||
        url.password ||
        url.pathname !== '/' ||
        url.search ||
        url.hash
      )
        throw new Error();
      return url.origin;
    } catch {
      throw new ServiceUnavailableException(
        'Bootstrap origin is not configured'
      );
    }
  }

  async bootstrap(body: BootstrapDto) {
    const origin = this.origin();
    try {
      if (
        !process.env.CROVE_POST_CLIENT_ID?.trim() ||
        !process.env.JWT_SECRET?.trim()
      )
        throw new ServiceUnavailableException('Bootstrap is not configured');
      if (body.oauth.client_id !== process.env.CROVE_POST_CLIENT_ID.trim())
        throw new BadRequestException('Unsupported bootstrap client');
      const app = await this.oauth.validateAuthorizationRequest(
        body.oauth.client_id,
        {}
      );
      if (app.dynamic || !app.id || !app.redirectUrl)
        throw new BadRequestException('Unsupported bootstrap client');
      const projection = await this.repository.project(body);
      const ticket = `fpt_${randomBytes(32).toString('hex')}`;
      const stored = await ioRedis.set(
        ticketKey(ticket),
        JSON.stringify({
          ...projection,
          subject: body.user.id,
          clientId: body.oauth.client_id,
          state: body.oauth.state,
          appId: app.id,
          redirectUri: app.redirectUrl,
        }),
        'EX',
        60,
        'NX'
      );
      if (stored !== 'OK') throw new Error();
      const launch = new URL('/oauth/authorize', origin);
      launch.searchParams.set('ticket', ticket);
      return { launch_url: launch.toString() };
    } catch (error) {
      // Database/Redis errors can contain identity data or credentials. Never log/rethrow them.
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      )
        throw error;
      throw new ServiceUnavailableException(
        'Bootstrap temporarily unavailable'
      );
    }
  }

  async consume(ticket: string) {
    if (
      process.env.ENABLE_ECOSYSTEM_SYNC === 'false' ||
      !process.env.REDIS_URL ||
      !/^fpt_[a-f0-9]{64}$/.test(ticket)
    ) {
      throw new BadRequestException('Invalid or expired ticket');
    }
    try {
      const stored = await ioRedis.eval(
        `local value = redis.call('GET', KEYS[1]); if value then redis.call('DEL', KEYS[1]); end; return value`,
        1,
        ticketKey(ticket)
      );
      if (typeof stored !== 'string')
        throw new BadRequestException('Invalid or expired ticket');
      const payload = JSON.parse(stored);
      const user = await this.repository.activeUser(
        payload.userId,
        payload.orgId
      );
      if (!user || user.providerId !== payload.subject)
        throw new BadRequestException('Invalid or expired ticket');
      const app = await this.oauth.validateAuthorizationRequest(
        payload.clientId,
        {}
      );
      if (
        app.dynamic ||
        app.id !== payload.appId ||
        app.redirectUrl !== payload.redirectUri ||
        payload.clientId !== process.env.CROVE_POST_CLIENT_ID?.trim() ||
        !process.env.JWT_SECRET?.trim()
      )
        throw new BadRequestException('Invalid or expired ticket');
      // A distinct launch ID prevents tab A from using tab B's current session,
      // even when both launches target the same user and organization.
      const consentId = randomBytes(32).toString('hex');
      const binding: ConsentBinding = {
        consentId,
        subject: payload.subject,
        userId: payload.userId,
        orgId: payload.orgId,
        clientId: payload.clientId,
        state: payload.state,
        appId: payload.appId,
        redirectUri: payload.redirectUri,
        codeChallenge: null,
        codeChallengeMethod: null,
      };
      const bound = await this.redis(() =>
        ioRedis.set(
          consentKey(consentId),
          JSON.stringify(binding),
          'EX',
          300,
          'NX'
        )
      );
      if (bound !== 'OK')
        throw new BadRequestException('Invalid consent session');
      const query = new URLSearchParams({
        client_id: payload.clientId,
        state: payload.state,
        response_type: 'code',
      });
      return {
        user,
        orgId: payload.orgId,
        consentId,
        redirectTo: `/oauth/authorize?${query}`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new ServiceUnavailableException(
        'Ticket exchange temporarily unavailable'
      );
    }
  }

  private async redis<T>(operation: () => Promise<T>): Promise<T> {
    if (!process.env.REDIS_URL || ioRedis.status !== 'ready')
      throw new ServiceUnavailableException('Consent temporarily unavailable');
    let timer: ReturnType<typeof setTimeout>;
    try {
      return await Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Redis timeout')), 3000);
        }),
      ]);
    } catch {
      throw new ServiceUnavailableException('Consent temporarily unavailable');
    } finally {
      clearTimeout(timer);
    }
  }

  async consumeConsent(input: {
    consentId?: string;
    userId: string;
    orgId: string;
    clientId: string;
    state?: string;
    appId: string;
    registeredRedirectUri: string;
    redirectUri?: string;
    codeChallenge?: string;
    codeChallengeMethod?: string;
  }): Promise<void> {
    const invalid = () =>
      new UnauthorizedException(
        'Consent session changed or expired; reconnect to continue'
      );
    if (
      !input.consentId ||
      !/^[a-f0-9]{64}$/.test(input.consentId) ||
      !input.state ||
      input.clientId !== process.env.CROVE_POST_CLIENT_ID?.trim() ||
      input.codeChallenge !== undefined ||
      input.codeChallengeMethod !== undefined ||
      (input.redirectUri !== undefined &&
        input.redirectUri !== input.registeredRedirectUri)
    )
      throw invalid();
    let user;
    try {
      // Recheck the authoritative identity and active membership at approval.
      user = await this.repository.activeUser(input.userId, input.orgId);
    } catch {
      throw new ServiceUnavailableException('Consent temporarily unavailable');
    }
    if (!user || user.providerName !== 'GENERIC' || !user.providerId)
      throw invalid();
    const expected: ConsentBinding = {
      consentId: input.consentId,
      subject: user.providerId,
      userId: user.id,
      orgId: input.orgId,
      clientId: input.clientId,
      state: input.state,
      appId: input.appId,
      redirectUri: input.registeredRedirectUri,
      codeChallenge: null,
      codeChallengeMethod: null,
    };
    const consumed = await this.redis(() =>
      ioRedis.eval(
        "local v = redis.call('GET', KEYS[1]); if v == ARGV[1] then redis.call('DEL', KEYS[1]); return 1; end; return 0",
        1,
        consentKey(input.consentId),
        JSON.stringify(expected)
      )
    );
    if (consumed !== 1) throw invalid();
  }
}
