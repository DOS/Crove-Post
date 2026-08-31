import 'reflect-metadata';
import { Module, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createHmac, randomBytes, randomUUID } from 'crypto';
import {
  BootstrapController,
  BootstrapGuard,
} from '../apps/backend/src/api/routes/bootstrap.controller';
import { BootstrapService } from '../apps/backend/src/ecosystem/bootstrap.service';
import { BootstrapRepository } from '../libraries/nestjs-libraries/src/database/prisma/provision/bootstrap.repository';
import { PrismaService } from '../libraries/nestjs-libraries/src/database/prisma/prisma.service';
import { ioRedis } from '../libraries/nestjs-libraries/src/redis/redis.service';
import { OAuthService } from '../libraries/nestjs-libraries/src/database/prisma/oauth/oauth.service';
import { ProvisionController } from '../apps/backend/src/api/routes/provision.controller';
import { OrganizationService } from '../libraries/nestjs-libraries/src/database/prisma/organizations/organization.service';
import { UsersService } from '../libraries/nestjs-libraries/src/database/prisma/users/users.service';
import { AuthService } from '../apps/backend/src/services/auth/auth.service';

jest.mock(
  '../libraries/nestjs-libraries/src/database/prisma/organizations/organization.service',
  () => ({ OrganizationService: class OrganizationService {} })
);
jest.mock(
  '../libraries/nestjs-libraries/src/database/prisma/users/users.service',
  () => ({ UsersService: class UsersService {} })
);
jest.mock('../apps/backend/src/services/auth/auth.service', () => ({
  AuthService: class AuthService {},
}));

jest.mock(
  '../libraries/nestjs-libraries/src/database/prisma/oauth/oauth.service',
  () => ({ OAuthService: class OAuthService {} })
);

const secret = 'bootstrap-test-secret-never-return';
const oauth = {
  validateAuthorizationRequest: jest.fn(async () => ({ dynamic: false })),
};
@Module({
  controllers: [BootstrapController, ProvisionController],
  providers: [
    BootstrapService,
    BootstrapGuard,
    BootstrapRepository,
    PrismaService,
    { provide: OAuthService, useValue: oauth },
    { provide: OrganizationService, useValue: {} },
    { provide: UsersService, useValue: {} },
    {
      provide: AuthService,
      useValue: { jwt: async () => 'session-test-never-return-in-json' },
    },
  ],
})
class TestModule {}

describe('First-party bootstrap over HTTP with real PostgreSQL and Redis', () => {
  let app: any, service: BootstrapService, prisma: PrismaService, base: string;
  const body = () => ({
    user: {
      id: randomUUID(),
      email: `${randomUUID()}@example.test`,
      name: 'JOY',
    },
    organization: {
      id: randomUUID(),
      name: 'Bootstrap test',
      slug: 'bootstrap-test',
      role: 'OWNER',
    },
    oauth: {
      client_id: 'pca_test',
      state: 'state=bound&access_token=pos_never-in-launch',
    },
  });
  const signed = (
    payload: any,
    offset = 0,
    nonce = randomBytes(16).toString('hex')
  ) => {
    const raw = JSON.stringify(payload),
      timestamp = new Date(Date.now() + offset).toISOString();
    const signature = createHmac('sha256', secret)
      .update(
        `${timestamp}.${nonce}.POST./api/internal/first-party/bootstrap.${raw}`
      )
      .digest('hex');
    return {
      method: 'POST',
      body: raw,
      headers: {
        'content-type': 'application/json',
        'x-dos-timestamp': timestamp,
        'x-dos-nonce': nonce,
        'x-dos-signature': `sha256=${signature}`,
      },
    };
  };
  const send = (init: any) =>
    fetch(`${base}/internal/first-party/bootstrap`, init);
  beforeAll(async () => {
    if (
      !process.env.DATABASE_URL?.includes('127.0.0.1:15491') ||
      process.env.REDIS_URL !== 'redis://127.0.0.1:16391'
    )
      throw new Error('Use isolated local test services');
    process.env.CROVE_POST_BOOTSTRAP_SIGNING_SECRET = secret;
    process.env.FRONTEND_URL = 'https://beta-post.crove.com';
    app = await NestFactory.create(TestModule, {
      logger: false,
      rawBody: true,
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.listen(0, '127.0.0.1');
    base = await app.getUrl();
    service = app.get(BootstrapService);
    prisma = app.get(PrismaService);
  });
  afterAll(async () => {
    await app?.close();
    await ioRedis.quit();
  });
  afterEach(() => {
    process.env.CROVE_POST_BOOTSTRAP_SIGNING_SECRET = secret;
    process.env.FRONTEND_URL = 'https://beta-post.crove.com';
    delete process.env.ENABLE_ECOSYSTEM_SYNC;
    delete process.env.CROVE_POST_CLIENT_SECRET;
  });

  it('returns only a safe launch URL and binds single-use ticket to canonical identity, org, client, state', async () => {
    const payload = body();
    const response = await send(signed(payload));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const data = await response.json();
    expect(Object.keys(data)).toEqual(['launch_url']);
    const url = new URL(data.launch_url);
    expect(url.origin).toBe('https://beta-post.crove.com');
    expect(url.pathname).toBe('/oauth/authorize');
    expect([...url.searchParams.keys()]).toEqual(['ticket']);
    expect(data.launch_url).not.toMatch(
      /pos_|pcs_|access_token|state=|bootstrap-test-secret/
    );
    const ticket = url.searchParams.get('ticket')!;
    expect(ticket).toMatch(/^fpt_[a-f0-9]{64}$/);
    const exchange = await service.consume(ticket);
    expect(exchange.user.id).toBe(payload.user.id);
    expect(exchange.orgId).toBe(payload.organization.id);
    const redirect = new URL(exchange.redirectTo, url.origin);
    expect(redirect.searchParams.get('state')).toBe(payload.oauth.state);
    expect(redirect.searchParams.get('client_id')).toBe(
      payload.oauth.client_id
    );
    await expect(service.consume(ticket)).rejects.toThrow(
      'Invalid or expired ticket'
    );
  });
  it.each(['x-dos-timestamp', 'x-dos-nonce', 'x-dos-signature'])(
    'rejects missing %s before body validation',
    async (header) => {
      const request = signed({});
      delete request.headers[header];
      expect((await send(request)).status).toBe(401);
    }
  );
  it('rejects invalid signature and raw-body tampering', async () => {
    const request = signed(body());
    request.body += ' ';
    expect((await send(request)).status).toBe(401);
    request.headers['x-dos-signature'] = 'sha256=' + '0'.repeat(64);
    expect((await send(request)).status).toBe(401);
  });
  it.each([-301000, 301000])('rejects timestamp skew %s', async (offset) => {
    expect((await send(signed(body(), offset))).status).toBe(401);
  });
  it('rejects malformed signature, nonce and timestamp', async () => {
    for (const [key, value] of [
      ['x-dos-timestamp', '2026'],
      ['x-dos-nonce', 'bad'],
      ['x-dos-signature', 'sha256=aa'],
    ]) {
      const request = signed(body());
      request.headers[key] = value;
      expect((await send(request)).status).toBe(401);
    }
  });
  it('fails closed for absent secret, disabled integration and absent Redis', async () => {
    delete process.env.CROVE_POST_BOOTSTRAP_SIGNING_SECRET;
    expect((await send(signed(body()))).status).toBe(401);
    process.env.CROVE_POST_BOOTSTRAP_SIGNING_SECRET = secret;
    process.env.ENABLE_ECOSYSTEM_SYNC = 'false';
    expect((await send(signed(body()))).status).toBe(401);
    delete process.env.ENABLE_ECOSYSTEM_SYNC;
    const redis = process.env.REDIS_URL;
    delete process.env.REDIS_URL;
    try {
      expect((await send(signed(body()))).status).toBe(401);
    } finally {
      process.env.REDIS_URL = redis;
    }
  });
  it('uses only the documented client secret fallback', async () => {
    delete process.env.CROVE_POST_BOOTSTRAP_SIGNING_SECRET;
    process.env.CROVE_POST_CLIENT_SECRET = secret;
    expect((await send(signed(body()))).status).toBe(200);
  });
  it('rejects replay atomically under concurrency and retains future nonce for the entire skew window', async () => {
    const request = signed(body(), 299000);
    const results = await Promise.all(
      Array.from({ length: 8 }, () => send(request))
    );
    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
    expect(results.filter((r) => r.status === 401)).toHaveLength(7);
    expect(
      await ioRedis.ttl(`first-party:nonce:${request.headers['x-dos-nonce']}`)
    ).toBeGreaterThan(590);
  });
  it('upserts user, org and membership idempotently, including concurrent first requests and role changes', async () => {
    const payload = body();
    const results = await Promise.all(
      Array.from({ length: 4 }, () => send(signed(payload)))
    );
    expect(results.map((r) => r.status)).toEqual([200, 200, 200, 200]);
    payload.user.name = 'Renamed';
    payload.organization.name = 'Updated';
    payload.organization.role = 'MEMBER';
    expect((await send(signed(payload))).status).toBe(200);
    expect(await prisma.user.count({ where: { id: payload.user.id } })).toBe(1);
    expect(
      await prisma.organization.count({
        where: { id: payload.organization.id },
      })
    ).toBe(1);
    expect(
      await prisma.userOrganization.count({
        where: {
          userId: payload.user.id,
          organizationId: payload.organization.id,
        },
      })
    ).toBe(1);
    expect(
      (await prisma.user.findUnique({ where: { id: payload.user.id } }))?.name
    ).toBe('Renamed');
    expect(
      (
        await prisma.userOrganization.findFirst({
          where: { userId: payload.user.id },
        })
      )?.role
    ).toBe('USER');
  });
  it('refuses to take over an existing email belonging to another identity', async () => {
    const first = body();
    expect((await send(signed(first))).status).toBe(200);
    const second = body();
    second.user.email = first.user.email;
    expect((await send(signed(second))).status).toBe(409);
    expect(
      await prisma.organization.count({ where: { id: second.organization.id } })
    ).toBe(0);
  });
  it('allows only one concurrent ticket consumer and enforces Redis expiry', async () => {
    const data = await (await send(signed(body()))).json();
    const ticket = new URL(data.launch_url).searchParams.get('ticket')!;
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () => service.consume(ticket))
    );
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const next = await (await send(signed(body()))).json();
    const nextTicket = new URL(next.launch_url).searchParams.get('ticket')!;
    const { createHash } = await import('crypto');
    const key = `first-party:ticket:${createHash('sha256')
      .update(nextTicket)
      .digest('hex')}`;
    expect(await ioRedis.ttl(key)).toBeLessThanOrEqual(60);
    expect(await ioRedis.ttl(key)).toBeGreaterThan(55);
    await ioRedis.pexpire(key, 1);
    await new Promise((resolve) => setTimeout(resolve, 10));
    await expect(service.consume(nextTicket)).rejects.toThrow(
      'Invalid or expired ticket'
    );
  });
  it.each([
    'http://beta-post.crove.com',
    'https://beta-post.crove.com.evil.test',
    'https://evil.test',
    'https://user@beta-post.crove.com',
    'https://beta-post.crove.com:444',
    'https://beta-post.crove.com/path',
  ])('rejects unsafe launch origin %s', async (origin) => {
    process.env.FRONTEND_URL = origin;
    expect((await send(signed(body()))).status).toBe(503);
  });
  it('rejects malformed payload after authentication', async () => {
    expect(
      (await send(signed({ user: {}, oauth: {}, organization: {} }))).status
    ).toBe(400);
  });

  it('consumes over HTTP with secure cookies and no JWT or caller redirect override', async () => {
    const payload = body();
    const launch = await (await send(signed(payload))).json();
    const ticket = new URL(launch.launch_url).searchParams.get('ticket');
    const request = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ticket, redirect_to: 'https://evil.test' }),
    };
    const response = await fetch(`${base}/v1/ticket/consume`, request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Object.keys(data).sort()).toEqual(['redirect_to', 'success']);
    expect(JSON.stringify(data)).not.toContain(
      'session-test-never-return-in-json'
    );
    expect(
      new URL(data.redirect_to, 'https://beta-post.crove.com').searchParams.get(
        'state'
      )
    ).toBe(payload.oauth.state);
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(response.headers.get('set-cookie')).toContain('Secure');
    // Match login/logout cookie scope so a pre-existing session is overwritten.
    expect(response.headers.get('set-cookie')).toContain('Domain=.crove.com');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect((await fetch(`${base}/v1/ticket/consume`, request)).status).toBe(
      400
    );
  });

  it('preserves legacy provisioning authentication and invalid legacy ticket responses', async () => {
    expect(
      (
        await fetch(`${base}/v1/provision`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            userId: randomUUID(),
            email: 'legacy@example.test',
          }),
        })
      ).status
    ).toBe(401);
    expect(
      (
        await fetch(`${base}/v1/ticket/consume`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ticket: 'not-a-legacy-jwt' }),
        })
      ).status
    ).toBe(400);
  });
});
