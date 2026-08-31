import 'reflect-metadata';
import { createHash, createHmac, randomBytes, randomUUID } from 'crypto';
import { NestFactory } from '@nestjs/core';
import {
  INestApplication,
  Module,
  MiddlewareConsumer,
  NestModule,
} from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { UsersController } from '../src/api/routes/users.controller';
import { OAuthAuthorizedController } from '../src/api/routes/oauth.controller';
import { AuthMiddleware } from '../src/services/auth/auth.middleware';
import { OAuthService } from '@gitroom/nestjs-libraries/database/prisma/oauth/oauth.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { StripeService } from '@gitroom/nestjs-libraries/services/stripe.service';
import { AuthService } from '../src/services/auth/auth.service';
import { TrackService } from '@gitroom/nestjs-libraries/track/track.service';
import { HttpExceptionFilter } from '@gitroom/nestjs-libraries/services/exception.filter';
import {
  FirstPartyBootstrapController,
  FirstPartyBootstrapGuard,
} from '../src/api/routes/first-party-bootstrap.controller';
import {
  BOOTSTRAP_PATH,
  FirstPartyBootstrapService,
  NONCE_TTL_SECONDS,
} from '../src/ecosystem/first-party-bootstrap.service';
import { PrismaService } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { ioRedis } from '@gitroom/nestjs-libraries/redis/redis.service';

// Keep unrelated billing, integrations, and telemetry out of this HTTP harness.
// Auth middleware/controllers and security state are real; projection reads use PostgreSQL.
jest.mock(
  '@gitroom/nestjs-libraries/database/prisma/oauth/oauth.service',
  () => ({ OAuthService: class {} })
);
jest.mock(
  '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service',
  () => ({ OrganizationService: class {} })
);
jest.mock(
  '@gitroom/nestjs-libraries/database/prisma/users/users.service',
  () => ({ UsersService: class {} })
);
jest.mock(
  '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service',
  () => ({ SubscriptionService: class {} })
);
jest.mock('@gitroom/nestjs-libraries/services/stripe.service', () => ({
  StripeService: class {},
}));
jest.mock('../src/services/auth/auth.service', () => ({
  AuthService: class {},
}));
jest.mock('@gitroom/nestjs-libraries/track/track.service', () => ({
  TrackService: class {},
}));
jest.mock('@gitroom/nestjs-libraries/sentry/initialize.sentry', () => ({
  setSentryUserContext: jest.fn(),
}));

// These tests intentionally use real, disposable PostgreSQL and Redis instances.
// Refuse non-loopback databases, including any developer or deployed environment.
for (const name of ['DATABASE_URL', 'REDIS_URL']) {
  const url = new URL(process.env[name] || 'http://missing');
  if (!['127.0.0.1', 'localhost'].includes(url.hostname))
    throw new Error(`Local ${name} is required`);
}
const secret = 'bootstrap-test-only-secret';
const clientId = 'pca_bootstrap_test';
const origin = 'https://beta-post.crove.com';
const issuedCodes: { userId: string; organizationId: string }[] = [];

@Module({
  controllers: [
    FirstPartyBootstrapController,
    UsersController,
    OAuthAuthorizedController,
  ],
  providers: [
    FirstPartyBootstrapService,
    FirstPartyBootstrapGuard,
    PrismaService,
    AuthMiddleware,
    { provide: SubscriptionService, useValue: {} },
    { provide: StripeService, useValue: {} },
    { provide: AuthService, useValue: {} },
    { provide: TrackService, useValue: {} },
    {
      provide: UsersService,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => ({
        getUserById: (id: string) => prisma.user.findUnique({ where: { id } }),
      }),
    },
    {
      provide: OrganizationService,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => ({
        getOrgsByUserId: (userId: string) =>
          prisma.organization.findMany({
            where: { users: { some: { userId } }, deletedAt: null },
            include: { users: { where: { userId } } },
          }),
        updateApiKey: async () => undefined,
      }),
    },
    {
      provide: OAuthService,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => ({
        validateAuthorizationRequest: (clientId: string) =>
          prisma.oAuthApp.findFirst({ where: { clientId } }),
        createAuthorizationCode: async (
          _appId: string,
          userId: string,
          organizationId: string
        ) => {
          issuedCodes.push({ userId, organizationId });
          return 'test-authorization-code';
        },
      }),
    },
  ],
})
class TestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(UsersController, OAuthAuthorizedController);
  }
}

describe('First-party M2M bootstrap (real HTTP, PostgreSQL and Redis)', () => {
  let app: INestApplication;
  let base: string;
  let prisma: PrismaService;
  let service: FirstPartyBootstrapService;
  let oauthAppId: string;
  let otherAppId: string;
  const userIds: string[] = [];
  const orgIds: string[] = [];

  function payload() {
    const userId = randomUUID();
    const orgId = randomUUID();
    userIds.push(userId);
    orgIds.push(orgId);
    return {
      user: { id: userId, email: `${userId}@example.test`, name: 'Test User' },
      organization: {
        id: orgId,
        name: 'Test Organization',
        slug: 'test',
        role: 'OWNER',
      },
      oauth: { client_id: clientId, state: `state-${randomUUID()}` },
    };
  }

  function signed(
    raw: string,
    timestamp = new Date().toISOString(),
    nonce = randomBytes(16).toString('hex'),
    path = BOOTSTRAP_PATH
  ) {
    return {
      'Content-Type': 'application/json',
      'X-DOS-Timestamp': timestamp,
      'X-DOS-Nonce': nonce,
      'X-DOS-Signature':
        'sha256=' +
        createHmac('sha256', secret)
          .update(`${timestamp}.${nonce}.POST.${path}.${raw}`)
          .digest('hex'),
    };
  }
  const post = (body: string, headers: Record<string, string> = signed(body)) =>
    fetch(`${base}/internal/first-party/bootstrap`, {
      method: 'POST',
      headers,
      body,
    });
  async function launch(body = payload()) {
    const response = await post(JSON.stringify(body));
    expect(response.status).toBe(200);
    const data = await response.json();
    return { body, url: new URL(data.launch_url) };
  }
  const ticketKey = (url: URL) =>
    'first-party:ticket:' +
    createHash('sha256').update(url.searchParams.get('ticket')!).digest('hex');
  const consume = (url: URL, suffix = '') =>
    fetch(`${base}/internal/first-party/launch${url.search}${suffix}`, {
      redirect: 'manual',
    });

  beforeAll(async () => {
    process.env.CROVE_POST_BOOTSTRAP_SIGNING_SECRET = secret;
    process.env.CROVE_POST_CLIENT_ID = clientId;
    process.env.JWT_SECRET = 'test-session-secret';
    process.env.FRONTEND_URL = origin;
    app = await NestFactory.create(TestModule, {
      rawBody: true,
      logger: false,
    });
    app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(0, '127.0.0.1');
    base = await app.getUrl();
    prisma = app.get(PrismaService);
    service = app.get(FirstPartyBootstrapService);
    oauthAppId = (
      await prisma.oAuthApp.create({
        data: {
          name: 'Bootstrap tests',
          clientId,
          clientSecret: 'test-only',
          redirectUrl: 'https://example.test/callback',
          dynamic: false,
        },
      })
    ).id;
    otherAppId = (
      await prisma.oAuthApp.create({
        data: {
          name: 'Other client',
          clientId: clientId + '-other',
          redirectUrl: 'https://example.test/other',
          dynamic: false,
        },
      })
    ).id;
  });
  afterAll(async () => {
    await prisma.userOrganization.deleteMany({
      where: { organizationId: { in: orgIds } },
    });
    await prisma.organization.deleteMany({ where: { id: { in: orgIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.oAuthApp.delete({ where: { id: oauthAppId } });
    await prisma.oAuthApp.delete({ where: { id: otherAppId } });
    await app.close();
    await ioRedis.quit();
  });

  it('accepts the canonical signature over the exact raw bytes and returns only a safe launch_url', async () => {
    const body = payload();
    const raw = JSON.stringify(body, null, 2);
    const response = await post(raw);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const data = await response.json();
    expect(Object.keys(data)).toEqual(['launch_url']);
    const url = new URL(data.launch_url);
    expect(url.origin).toBe(origin);
    expect(url.pathname).toBe('/api/internal/first-party/launch');
    expect([...url.searchParams.keys()]).toEqual(['ticket']);
    expect(url.searchParams.get('ticket')).toMatch(/^[a-f0-9]{64}$/);
    expect(data.launch_url).not.toMatch(
      /pos_|access_token|refresh_token|client_secret|eyJ/
    );
    expect(data.launch_url).not.toContain(body.user.id);
    expect(data.launch_url).not.toContain(body.oauth.state);
    expect(await ioRedis.ttl(ticketKey(url))).toBeGreaterThan(0);
    expect(await ioRedis.ttl(ticketKey(url))).toBeLessThanOrEqual(60);
  });

  it.each([
    'missing',
    'invalid',
    'wrong-path',
    'changed-body',
    'array-header',
    'bad-nonce',
    'bad-time',
  ])('rejects %s authentication', async (kind) => {
    const raw = JSON.stringify(payload());
    const headers = signed(raw);
    if (kind === 'missing') delete headers['X-DOS-Signature'];
    if (kind === 'invalid')
      headers['X-DOS-Signature'] = 'sha256=' + '0'.repeat(64);
    if (kind === 'wrong-path')
      Object.assign(
        headers,
        signed(raw, undefined, undefined, '/internal/first-party/bootstrap')
      );
    if (kind === 'array-header')
      headers['X-DOS-Timestamp'] += ', ' + headers['X-DOS-Timestamp'];
    if (kind === 'bad-nonce') headers['X-DOS-Nonce'] = 'bad';
    if (kind === 'bad-time')
      headers['X-DOS-Timestamp'] = '2026-02-30T00:00:00.000Z';
    const response = await post(
      kind === 'changed-body' ? raw + ' ' : raw,
      headers
    );
    expect(response.status).toBe(401);
  });

  it.each([-301_000, 301_000])(
    'rejects timestamps outside five minutes (%i ms)',
    async (offset) => {
      const raw = JSON.stringify(payload());
      expect(
        (
          await post(
            raw,
            signed(raw, new Date(Date.now() + offset).toISOString())
          )
        ).status
      ).toBe(401);
    }
  );

  it('fails closed without a signing secret, JWT secret, or real Redis configuration', async () => {
    const raw = JSON.stringify(payload());
    const previousClientSecret = process.env.CROVE_POST_CLIENT_SECRET;
    delete process.env.CROVE_POST_BOOTSTRAP_SIGNING_SECRET;
    delete process.env.CROVE_POST_CLIENT_SECRET;
    try {
      expect((await post(raw)).status).toBe(401);
    } finally {
      process.env.CROVE_POST_BOOTSTRAP_SIGNING_SECRET = secret;
      if (previousClientSecret)
        process.env.CROVE_POST_CLIENT_SECRET = previousClientSecret;
    }
    for (const name of ['JWT_SECRET', 'REDIS_URL']) {
      const previous = process.env[name];
      delete process.env[name];
      try {
        expect((await post(raw)).status).toBe(503);
      } finally {
        process.env[name] = previous;
      }
    }
  });

  it('allows only one of concurrent nonce replays and retains future nonces for the entire skew window', async () => {
    const raw = JSON.stringify(payload());
    const headers = signed(raw, new Date(Date.now() + 299_000).toISOString());
    const responses = await Promise.all(
      Array.from({ length: 8 }, () => post(raw, headers))
    );
    expect(responses.filter((r) => r.status === 200)).toHaveLength(1);
    expect(responses.filter((r) => r.status === 401)).toHaveLength(7);
    const ttl = await ioRedis.ttl(
      `first-party:nonce:${headers['X-DOS-Nonce']}`
    );
    expect(ttl).toBeGreaterThan(590);
    expect(ttl).toBeLessThanOrEqual(NONCE_TTL_SECONDS);
  });

  it('upserts canonical projections idempotently and updates names, email, and membership role', async () => {
    const { body } = await launch();
    body.user.email = `updated-${body.user.id}@example.test`;
    body.user.name = 'Updated User';
    body.organization.name = 'Updated Organization';
    body.organization.role = 'MEMBER';
    await launch(body);
    expect(
      await prisma.user.count({ where: { providerId: body.user.id } })
    ).toBe(1);
    expect(
      await prisma.organization.count({ where: { id: body.organization.id } })
    ).toBe(1);
    expect(
      await prisma.userOrganization.count({ where: { userId: body.user.id } })
    ).toBe(1);
    expect(
      await prisma.user.findUnique({ where: { id: body.user.id } })
    ).toMatchObject({
      name: body.user.name,
      email: body.user.email,
      isSuperAdmin: false,
    });
    expect(
      await prisma.organization.findUnique({
        where: { id: body.organization.id },
      })
    ).toMatchObject({ name: body.organization.name });
    expect(
      await prisma.userOrganization.findFirst({
        where: { userId: body.user.id },
      })
    ).toMatchObject({ role: 'USER' });
  });

  it('preserves an existing DOS-linked local user and rejects email-only account linking', async () => {
    const body = payload();
    const localId = randomUUID();
    userIds.push(localId);
    await prisma.user.create({
      data: {
        id: localId,
        email: body.user.email,
        providerName: 'GENERIC',
        providerId: body.user.id,
        timezone: 0,
      },
    });
    const { url } = await launch(body);
    expect(
      (await service.consume(url.searchParams.get('ticket'))).user.id
    ).toBe(localId);
    const imposter = payload();
    imposter.user.email = body.user.email;
    expect((await post(JSON.stringify(imposter))).status).toBe(409);
    expect(
      await prisma.organization.count({
        where: { id: imposter.organization.id },
      })
    ).toBe(0);
  });

  it.each([
    'http://beta-post.crove.com',
    'https://beta-post.crove.com.evil.test',
    'https://beta-post.crove.com:444',
    'https://user@beta-post.crove.com',
    'https://beta-post.crove.com/path',
  ])('rejects unsafe configured origins: %s', async (value) => {
    process.env.FRONTEND_URL = value;
    try {
      expect((await post(JSON.stringify(payload()))).status).toBe(503);
    } finally {
      process.env.FRONTEND_URL = origin;
    }
  });

  it('rejects unknown clients and invalid payloads without provisioning', async () => {
    const body = payload();
    body.oauth.client_id = 'untrusted-client';
    expect((await post(JSON.stringify(body))).status).toBe(400);
    expect(await prisma.user.count({ where: { id: body.user.id } })).toBe(0);
    expect(
      (
        await post(
          JSON.stringify({
            ...body,
            organization: { ...body.organization, role: 'ROOT' },
          })
        )
      ).status
    ).toBe(400);
  });

  it('establishes host-only HTTP-only cookies, uses the bound client/state and never exposes the session token', async () => {
    const { url, body } = await launch();
    const response = await consume(
      url,
      '&client_id=evil&state=evil&redirect_to=https://evil.test'
    );
    expect(response.status).toBe(303);
    const redirect = new URL(response.headers.get('location')!);
    expect(redirect.origin).toBe(origin);
    expect(redirect.pathname).toBe('/oauth/authorize');
    expect(redirect.searchParams.get('state')).toBe(body.oauth.state);
    expect(redirect.searchParams.get('client_id')).toBe(clientId);
    const cookies = response.headers.getSetCookie();
    expect(cookies).toHaveLength(2);
    for (const cookie of cookies) {
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('Secure');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).not.toContain('Domain=');
    }
    const token = cookies
      .find((c) => c.startsWith('__Host-crove-auth='))!
      .split(';')[0]
      .slice('__Host-crove-auth='.length);
    expect(verify(token, process.env.JWT_SECRET!)).toMatchObject({
      id: body.user.id,
    });
    expect(await response.text()).not.toContain(token);
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect((await consume(url)).status).toBe(401);
  });

  it('allows exactly one concurrent ticket consumption', async () => {
    const { url } = await launch();
    const responses = await Promise.all(
      Array.from({ length: 16 }, () => consume(url))
    );
    expect(responses.filter((r) => r.status === 303)).toHaveLength(1);
    expect(responses.filter((r) => r.status === 401)).toHaveLength(15);
  });

  it('rejects expired tickets and disabled memberships', async () => {
    const { url, body } = await launch();
    await ioRedis.pexpire(ticketKey(url), 1);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect((await consume(url)).status).toBe(401);
    const second = await launch(body);
    await prisma.userOrganization.updateMany({
      where: { userId: body.user.id },
      data: { disabled: true },
    });
    expect((await consume(second.url)).status).toBe(401);
  });

  const cookieHeader = (response: globalThis.Response) =>
    response.headers
      .getSetCookie()
      .map((c) => c.split(';')[0])
      .join('; ');
  const approve = (cookie: string, state: string, requestedClient = clientId) =>
    fetch(`${base}/oauth/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({
        client_id: requestedClient,
        state,
        action: 'approve',
      }),
    });

  it('keeps the consent tuple bound across concurrent tabs and consumes approval once', async () => {
    const first = await launch();
    await consume(first.url);
    const secondBody = payload();
    secondBody.user = first.body.user;
    const second = await launch(secondBody);
    const cookie = cookieHeader(await consume(second.url));
    const count = issuedCodes.length;
    expect((await approve(cookie, first.body.oauth.state)).status).toBe(401);
    expect(issuedCodes).toHaveLength(count);
    const responses = await Promise.all(
      Array.from({ length: 8 }, () => approve(cookie, second.body.oauth.state))
    );
    expect(responses.filter((r) => r.ok)).toHaveLength(1);
    expect(responses.filter((r) => r.status === 401)).toHaveLength(7);
    expect(issuedCodes.at(-1)).toEqual({
      userId: first.body.user.id,
      organizationId: secondBody.organization.id,
    });
    expect(issuedCodes).toHaveLength(count + 1);
  });

  it('rejects tampered or expired consent state and a changed user', async () => {
    const first = await launch();
    const firstCookie = cookieHeader(await consume(first.url));
    const other = await launch();
    const otherCookie = cookieHeader(await consume(other.url));
    expect((await approve(otherCookie, first.body.oauth.state)).status).toBe(
      401
    );
    expect((await approve(firstCookie, 'changed-state')).status).toBe(401);
    const key =
      'first-party:consent:' +
      createHash('sha256').update(first.body.oauth.state).digest('hex');
    await ioRedis.del(key);
    expect((await approve(firstCookie, first.body.oauth.state)).status).toBe(
      401
    );
  });

  it('changes organization using the host cookie without modifying parent-domain cookies', async () => {
    const first = await launch();
    const firstCookie = cookieHeader(await consume(first.url));
    const other = payload();
    other.user = first.body.user;
    await launch(other);
    const response = await fetch(`${base}/user/change-org`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: firstCookie },
      body: JSON.stringify({ id: other.organization.id }),
    });
    expect(response.ok).toBe(true);
    const setCookies = response.headers.getSetCookie();
    expect(setCookies).toHaveLength(1);
    expect(setCookies[0]).toContain(
      `__Host-crove-org=${other.organization.id}`
    );
    expect(setCookies[0]).not.toContain('Domain=');
    const cookie = firstCookie.replace(
      `__Host-crove-org=${first.body.organization.id}`,
      `__Host-crove-org=${other.organization.id}`
    );
    expect((await approve(cookie, first.body.oauth.state)).status).toBe(401);
  });

  it('actual logout clears first-party and legacy cookies so no older session is restored', async () => {
    const { url } = await launch();
    const cookie = cookieHeader(await consume(url));
    const response = await fetch(`${base}/user/logout`, {
      method: 'POST',
      headers: {
        Cookie: `auth=stale-parent-cookie; showorg=stale-parent-org; ${cookie}`,
      },
    });
    expect(response.ok).toBe(true);
    const setCookies = response.headers.getSetCookie();
    expect(setCookies).toHaveLength(5);
    for (const name of ['__Host-crove-auth', '__Host-crove-org']) {
      expect(setCookies.find((c) => c.startsWith(name + '='))).toContain(
        'Expires=Thu, 01 Jan 1970'
      );
    }
    for (const name of ['auth', 'showorg', 'impersonate']) {
      expect(setCookies.find((c) => c.startsWith(name + '='))).toContain(
        'Max-Age=-1'
      );
    }
    expect((await fetch(`${base}/user/organizations`)).status).toBe(401);
  });

  it('preserves traditional OAuth approval without bootstrap flow state', async () => {
    const { body } = await launch();
    const legacyJwt = sign({ id: body.user.id }, process.env.JWT_SECRET!);
    expect(
      (
        await approve(
          `auth=${legacyJwt}; showorg=${body.organization.id}`,
          'legacy-state'
        )
      ).ok
    ).toBe(true);
    expect(issuedCodes.at(-1)).toEqual({
      userId: body.user.id,
      organizationId: body.organization.id,
    });
  });

  it('allows unrelated OAuth clients but rejects changing a bound bootstrap client', async () => {
    const { body, url } = await launch();
    const cookie = cookieHeader(await consume(url));
    const count = issuedCodes.length;
    expect(
      (await approve(cookie, body.oauth.state, clientId + '-other')).status
    ).toBe(401);
    expect(issuedCodes).toHaveLength(count);
    expect((await approve(cookie, body.oauth.state)).ok).toBe(true);
    expect(
      (await approve(cookie, 'unrelated-flow-state', clientId + '-other')).ok
    ).toBe(true);
    expect(issuedCodes).toHaveLength(count + 2);
  });
});
