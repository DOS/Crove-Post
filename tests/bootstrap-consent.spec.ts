import 'reflect-metadata';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createHash, createHmac, randomBytes, randomUUID } from 'crypto';
import cookieParser from 'cookie-parser';
import { sign, verify } from 'jsonwebtoken';
import {
  BootstrapController,
  BootstrapGuard,
} from '../apps/backend/src/api/routes/bootstrap.controller';
import { ProvisionController } from '../apps/backend/src/api/routes/provision.controller';
import { OAuthAuthorizedController } from '../apps/backend/src/api/routes/oauth.controller';
import { BootstrapService } from '../apps/backend/src/ecosystem/bootstrap.service';
import { AuthMiddleware } from '../apps/backend/src/services/auth/auth.middleware';
import { BootstrapRepository } from '../libraries/nestjs-libraries/src/database/prisma/provision/bootstrap.repository';
import {
  PrismaService,
  PrismaRepository,
} from '../libraries/nestjs-libraries/src/database/prisma/prisma.service';
import { OAuthRepository } from '../libraries/nestjs-libraries/src/database/prisma/oauth/oauth.repository';
import { OAuthService } from '../libraries/nestjs-libraries/src/database/prisma/oauth/oauth.service';
import { OrganizationService } from '../libraries/nestjs-libraries/src/database/prisma/organizations/organization.service';
import { UsersService } from '../libraries/nestjs-libraries/src/database/prisma/users/users.service';
import { AuthService } from '../apps/backend/src/services/auth/auth.service';
import { AuthService as AuthChecker } from '../libraries/helpers/src/auth/auth.service';
import { HttpExceptionFilter } from '../libraries/nestjs-libraries/src/services/exception.filter';
import { ioRedis } from '../libraries/nestjs-libraries/src/redis/redis.service';

// Only unrelated organization/user service dependencies are replaced. HTTP auth,
// OAuth code issuance, projection, PostgreSQL and Redis are exercised together.
jest.mock(
  '../libraries/nestjs-libraries/src/database/prisma/organizations/organization.service',
  () => ({ OrganizationService: class {} })
);
jest.mock(
  '../libraries/nestjs-libraries/src/database/prisma/users/users.service',
  () => ({ UsersService: class {} })
);
jest.mock('../apps/backend/src/services/auth/auth.service', () => ({
  AuthService: class {},
}));
jest.mock('../libraries/nestjs-libraries/src/sentry/initialize.sentry', () => ({
  setSentryUserContext: jest.fn(),
}));

const clientId = 'pca_consent_test';
const jwtSecret = 'consent-test-jwt-secret';
const hmacSecret = 'consent-test-hmac-secret';
const callback = 'https://example.test/dos-me/callback';

@Module({
  controllers: [
    BootstrapController,
    ProvisionController,
    OAuthAuthorizedController,
  ],
  providers: [
    BootstrapService,
    BootstrapGuard,
    BootstrapRepository,
    PrismaService,
    PrismaRepository,
    OAuthRepository,
    OAuthService,
    AuthMiddleware,
    {
      provide: AuthService,
      useValue: {
        jwt: async (user: { id: string }) => sign({ id: user.id }, jwtSecret),
      },
    },
    {
      provide: UsersService,
      inject: [PrismaService],
      useFactory: (db: PrismaService) => ({
        getUserById: (id: string) => db.user.findUnique({ where: { id } }),
      }),
    },
    {
      provide: OrganizationService,
      inject: [PrismaService],
      useFactory: (db: PrismaService) => ({
        getOrgsByUserId: (userId: string) =>
          db.organization.findMany({
            where: { deletedAt: null, users: { some: { userId } } },
            include: { users: { where: { userId } } },
          }),
        updateApiKey: async () => undefined,
      }),
    },
  ],
})
class TestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(OAuthAuthorizedController);
  }
}

describe('Bootstrap consent binding with real HTTP, OAuth issuance, PostgreSQL and Redis', () => {
  let app: any,
    prisma: PrismaService,
    base: string,
    appId: string,
    otherAppId: string;
  const users: string[] = [],
    orgs: string[] = [];
  const payload = () => {
    const userId = randomUUID(),
      orgId = randomUUID();
    users.push(userId);
    orgs.push(orgId);
    return {
      user: {
        id: userId,
        email: `${userId}@example.test`,
        name: 'Consent test',
      },
      organization: {
        id: orgId,
        name: 'Consent organization',
        slug: 'consent',
        role: 'OWNER',
      },
      oauth: { client_id: clientId, state: randomBytes(24).toString('hex') },
    };
  };
  function signed(body: unknown) {
    const raw = JSON.stringify(body),
      timestamp = new Date().toISOString(),
      nonce = randomBytes(16).toString('hex');
    return {
      method: 'POST',
      body: raw,
      headers: {
        'Content-Type': 'application/json',
        'X-DOS-Timestamp': timestamp,
        'X-DOS-Nonce': nonce,
        'X-DOS-Signature':
          'sha256=' +
          createHmac('sha256', hmacSecret)
            .update(
              `${timestamp}.${nonce}.POST./api/internal/first-party/bootstrap.${raw}`
            )
            .digest('hex'),
      },
    };
  }
  async function ticket(body = payload()) {
    const response = await fetch(
      `${base}/internal/first-party/bootstrap`,
      signed(body)
    );
    expect(response.status).toBe(200);
    const url = new URL((await response.json()).launch_url);
    return { body, ticket: url.searchParams.get('ticket')! };
  }
  async function launch(body = payload()) {
    const issued = await ticket(body);
    const response = await fetch(`${base}/v1/ticket/consume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket: issued.ticket }),
    });
    expect(response.status).toBe(200);
    const cookie = response.headers
      .getSetCookie()
      .map((c) => c.split(';')[0])
      .join('; ');
    const token = cookie
      .split('; ')
      .find((c) => c.startsWith('auth='))!
      .slice(5);
    const claims = verify(token, jwtSecret) as {
      id: string;
      firstPartyConsentId: string;
    };
    expect(claims.firstPartyConsentId).toMatch(/^[a-f0-9]{64}$/);
    return { body, cookie, claims, response };
  }
  function approve(
    cookie: string,
    body: Record<string, unknown>,
    headers: Record<string, string> = {}
  ) {
    return fetch(`${base}/oauth/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
        ...headers,
      },
      body: JSON.stringify({ client_id: clientId, action: 'approve', ...body }),
    });
  }
  const codes = () =>
    prisma.oAuthAuthorization.count({ where: { oauthAppId: appId } });

  beforeAll(async () => {
    if (
      !/127\.0\.0\.1:(15491|15432)\//.test(process.env.DATABASE_URL || '') ||
      !['redis://127.0.0.1:16391', 'redis://127.0.0.1:16379'].includes(
        process.env.REDIS_URL
      )
    )
      throw new Error('Use isolated local test services');
    process.env.FRONTEND_URL = 'https://beta-post.crove.com';
    process.env.CROVE_POST_BOOTSTRAP_SIGNING_SECRET = hmacSecret;
    process.env.CROVE_POST_CLIENT_ID = clientId;
    process.env.JWT_SECRET = jwtSecret;
    delete process.env.ENABLE_ECOSYSTEM_SYNC;
    app = await NestFactory.create(TestModule, {
      rawBody: true,
      logger: false,
    });
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(0, '127.0.0.1');
    base = await app.getUrl();
    prisma = app.get(PrismaService);
    appId = (
      await prisma.oAuthApp.create({
        data: {
          clientId,
          name: 'DOS-Me test',
          redirectUrl: callback,
          clientSecret: 'not-used-by-approval',
        },
      })
    ).id;
    otherAppId = (
      await prisma.oAuthApp.create({
        data: {
          clientId: 'pca_other',
          name: 'Legacy client test',
          redirectUrl: 'https://example.test/other',
        },
      })
    ).id;
  });
  afterAll(async () => {
    await prisma.oAuthAuthorization.deleteMany({
      where: { oauthAppId: { in: [appId, otherAppId] } },
    });
    await prisma.oAuthApp.deleteMany({
      where: { id: { in: [appId, otherAppId] } },
    });
    await prisma.userOrganization.deleteMany({
      where: { organizationId: { in: orgs } },
    });
    await prisma.organization.deleteMany({ where: { id: { in: orgs } } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    await app?.close();
    await ioRedis.quit();
  });

  it('rejects tab A after tab B changes the organization, before any code is issued', async () => {
    const a = await launch();
    const next = payload();
    next.user = a.body.user;
    const b = await launch(next);
    const count = await codes();
    expect(
      (await approve(b.cookie, { state: a.body.oauth.state })).status
    ).toBe(401);
    expect(await codes()).toBe(count);
    expect(
      (await approve(b.cookie, { state: b.body.oauth.state })).status
    ).toBe(201);
    expect(
      await prisma.oAuthAuthorization.findFirst({
        where: { oauthAppId: appId, userId: a.body.user.id },
      })
    ).toMatchObject({ organizationId: b.body.organization.id });
  });

  it('rejects a superseded launch even when both tabs use the same user and organization', async () => {
    const a = await launch();
    const b = await launch({
      ...a.body,
      oauth: { client_id: clientId, state: randomUUID() },
    });
    expect(b.claims.firstPartyConsentId).not.toBe(a.claims.firstPartyConsentId);
    const count = await codes();
    expect(
      (await approve(b.cookie, { state: a.body.oauth.state })).status
    ).toBe(401);
    expect(await codes()).toBe(count);
    expect(
      (await approve(b.cookie, { state: b.body.oauth.state })).status
    ).toBe(201);
  });

  it('rejects changed user, subject, organization and disabled membership', async () => {
    const a = await launch(),
      b = await launch();
    const count = await codes();
    expect(
      (await approve(b.cookie, { state: a.body.oauth.state })).status
    ).toBe(401);
    await prisma.user.update({
      where: { id: a.body.user.id },
      data: { providerId: randomUUID() },
    });
    expect(
      (await approve(a.cookie, { state: a.body.oauth.state })).status
    ).toBe(401);
    await prisma.user.update({
      where: { id: a.body.user.id },
      data: { providerId: a.body.user.id },
    });
    await prisma.userOrganization.updateMany({
      where: { userId: a.body.user.id },
      data: { disabled: true },
    });
    expect(
      (await approve(a.cookie, { state: a.body.oauth.state })).status
    ).toBe(401);
    expect(await codes()).toBe(count);
  });

  it.each([
    {},
    { state: '' },
    { state: 'tampered' },
    { client_id: 'pca_other' },
  ])('rejects missing/tampered state or changed client: %j', async (change) => {
    const a = await launch();
    const input =
      'client_id' in change ? { state: a.body.oauth.state, ...change } : change;
    const count = await codes();
    expect((await approve(a.cookie, input)).status).toBe(401);
    expect(await codes()).toBe(count);
  });

  it('does not accept a legacy JWT or forged header as a missing session marker', async () => {
    const a = await launch();
    const legacy = `auth=${sign({ id: a.body.user.id }, jwtSecret)}; showorg=${
      a.body.organization.id
    }`;
    const count = await codes();
    expect(
      (
        await approve(
          legacy,
          { state: a.body.oauth.state },
          { 'first-party-consent-id': a.claims.firstPartyConsentId }
        )
      ).status
    ).toBe(401);
    const token = a.cookie.split('; ')[0].slice(5).split('.');
    const original = JSON.parse(Buffer.from(token[1], 'base64url').toString());
    delete original.firstPartyConsentId;
    token[1] = Buffer.from(JSON.stringify(original)).toString('base64url');
    expect(
      (
        await approve(
          `auth=${token.join('.')}; showorg=${a.body.organization.id}`,
          { state: a.body.oauth.state }
        )
      ).status
    ).toBe(401);
    expect(await codes()).toBe(count);
  });

  it.each([
    { code_challenge: 'injected' },
    { code_challenge_method: 'S256' },
    { code_challenge: '' },
    { redirect_uri: 'https://evil.test/callback' },
  ])('rejects injected PKCE or redirect: %j', async (change) => {
    const a = await launch();
    const count = await codes();
    expect(
      (await approve(a.cookie, { state: a.body.oauth.state, ...change })).status
    ).toBe(401);
    expect(await codes()).toBe(count);
  });

  it('rejects a registered redirect changed after bootstrap or after launch', async () => {
    const issued = await ticket();
    await prisma.oAuthApp.update({
      where: { id: appId },
      data: { redirectUrl: 'https://example.test/changed' },
    });
    try {
      expect(
        (
          await fetch(`${base}/v1/ticket/consume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket: issued.ticket }),
          })
        ).status
      ).toBe(400);
    } finally {
      await prisma.oAuthApp.update({
        where: { id: appId },
        data: { redirectUrl: callback },
      });
    }
    const a = await launch();
    await prisma.oAuthApp.update({
      where: { id: appId },
      data: { redirectUrl: 'https://example.test/changed' },
    });
    try {
      expect(
        (await approve(a.cookie, { state: a.body.oauth.state })).status
      ).toBe(401);
    } finally {
      await prisma.oAuthApp.update({
        where: { id: appId },
        data: { redirectUrl: callback },
      });
    }
  });

  it('rejects an expired binding and never falls back after replay', async () => {
    const a = await launch();
    const key = `first-party:consent:${a.claims.firstPartyConsentId}`;
    expect(await ioRedis.ttl(key)).toBeGreaterThan(290);
    expect(await ioRedis.ttl(key)).toBeLessThanOrEqual(300);
    await ioRedis.pexpire(key, 1);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(
      (await approve(a.cookie, { state: a.body.oauth.state })).status
    ).toBe(401);
    const b = await launch();
    const result = await approve(b.cookie, {
      state: b.body.oauth.state,
      redirect_uri: callback,
    });
    expect(result.status).toBe(201);
    expect(
      (await approve(b.cookie, { state: b.body.oauth.state })).status
    ).toBe(401);
    const normalAuth = result.headers.getSetCookie()[0].split(';')[0];
    expect(
      (
        await approve(`${normalAuth}; showorg=${b.body.organization.id}`, {
          state: b.body.oauth.state,
        })
      ).status
    ).toBe(401);
  });

  it('allows only one of eight simultaneous approvals and stores the intended tenant', async () => {
    const a = await launch();
    const results = await Promise.all(
      Array.from({ length: 8 }, () =>
        approve(a.cookie, { state: a.body.oauth.state })
      )
    );
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(results.filter((r) => r.status === 401)).toHaveLength(7);
    const record = await prisma.oAuthAuthorization.findFirst({
      where: { oauthAppId: appId, userId: a.body.user.id },
    });
    expect(record).toMatchObject({
      organizationId: a.body.organization.id,
      codeChallenge: null,
      codeChallengeMethod: null,
    });
    expect(record.authorizationCode).toBeTruthy();
  });

  it('consumes denial and resumes a normal session while preserving legacy OAuth for other clients', async () => {
    const a = await launch();
    const count = await codes();
    const denied = await approve(a.cookie, {
      state: a.body.oauth.state,
      action: 'deny',
    });
    expect(denied.status).toBe(201);
    expect(
      new URL((await denied.json()).redirect).searchParams.get('error')
    ).toBe('access_denied');
    expect(await codes()).toBe(count);
    const setCookie = denied.headers.getSetCookie()[0];
    expect(setCookie).toContain('Domain=.crove.com');
    const normalAuth = setCookie.split(';')[0];
    expect(verify(normalAuth.slice(5), jwtSecret)).not.toHaveProperty(
      'firstPartyConsentId'
    );
    const normalCookie = `${normalAuth}; showorg=${a.body.organization.id}`;
    expect(
      (
        await approve(normalCookie, {
          state: 'legacy-state',
          client_id: 'pca_other',
        })
      ).status
    ).toBe(201);
    expect(
      (await approve(normalCookie, { state: a.body.oauth.state })).status
    ).toBe(401);
    expect(
      (await approve(a.cookie, { state: a.body.oauth.state })).status
    ).toBe(401);
  });
});
