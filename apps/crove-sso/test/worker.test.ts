import { env, exports } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Env } from '../src/env';

const workerEnv = env as unknown as Env;
const worker = exports as unknown as {
  default: { fetch(request: Request): Promise<Response> };
};

afterEach(() => {
  vi.restoreAllMocks();
});

function authorizeUrl(overrides: Record<string, string> = {}) {
  const params = new URLSearchParams({
    client_id: workerEnv.DOWNSTREAM_CLIENT_ID,
    redirect_uri: workerEnv.DOWNSTREAM_REDIRECT_URI,
    response_type: 'code',
    scope: workerEnv.ALLOWED_SCOPE,
    state: 'postiz-state',
    ...overrides,
  });
  return new Request(`https://sso.crove.com/authorize?${params}`, { redirect: 'manual' });
}

async function issueBridgeCode(): Promise<string> {
  const authorization = await worker.default.fetch(authorizeUrl());
  const upstreamState = new URL(authorization.headers.get('location')!).searchParams.get('state')!;
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
    Response.json({
      access_token: 'upstream-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'upstream-refresh-token',
    }),
  );
  const callback = await worker.default.fetch(
    new Request(`https://sso.crove.com/callback?code=supabase-code&state=${upstreamState}`, {
      redirect: 'manual',
    }),
  );
  vi.restoreAllMocks();
  return new URL(callback.headers.get('location')!).searchParams.get('code')!;
}

function tokenRequest(code: string, overrides: Record<string, string> = {}): Request {
  return new Request('https://sso.crove.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: workerEnv.DOWNSTREAM_CLIENT_ID,
      client_secret: workerEnv.DOWNSTREAM_CLIENT_SECRET,
      redirect_uri: workerEnv.DOWNSTREAM_REDIRECT_URI,
      code,
      ...overrides,
    }),
  });
}

describe('Crove SSO Worker', () => {
  it('serves a static health response', async () => {
    const response = await worker.default.fetch(new Request('https://sso.crove.com/health'));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok', service: 'crove-sso' });
  });

  it('redirects an exact authorization request to DOS ID with S256 PKCE', async () => {
    const response = await worker.default.fetch(authorizeUrl());
    expect(response.status).toBe(302);
    const location = new URL(response.headers.get('location')!);
    expect(location.origin + location.pathname).toBe(workerEnv.UPSTREAM_AUTHORIZE_URL);
    expect(location.searchParams.get('client_id')).toBe(workerEnv.UPSTREAM_CLIENT_ID);
    expect(location.searchParams.get('redirect_uri')).toBe(workerEnv.UPSTREAM_REDIRECT_URI);
    expect(location.searchParams.get('response_type')).toBe('code');
    expect(location.searchParams.get('scope')).toBe(workerEnv.ALLOWED_SCOPE);
    expect(location.searchParams.get('code_challenge_method')).toBe('S256');
    expect(location.searchParams.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(location.searchParams.get('state')).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(location.searchParams.get('state')).not.toContain('postiz-state');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('rejects an invalid authorization request without redirecting', async () => {
    const response = await worker.default.fetch(
      authorizeUrl({ redirect_uri: 'https://evil.example/callback' }),
    );
    expect(response.status).toBe(400);
    expect(response.headers.get('location')).toBeNull();
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid_request' });
  });

  it('exchanges an upstream callback and preserves downstream state', async () => {
    const authorization = await worker.default.fetch(authorizeUrl());
    const upstreamState = new URL(authorization.headers.get('location')!).searchParams.get('state')!;
    let submittedVerifier = '';
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      expect(request.url).toBe(workerEnv.UPSTREAM_TOKEN_URL);
      const form = await request.formData();
      submittedVerifier = String(form.get('code_verifier'));
      expect(form.get('code')).toBe('supabase-code');
      expect(form.get('client_id')).toBe(workerEnv.UPSTREAM_CLIENT_ID);
      expect(form.get('client_secret')).toBe(workerEnv.UPSTREAM_CLIENT_SECRET);
      expect(form.get('redirect_uri')).toBe(workerEnv.UPSTREAM_REDIRECT_URI);
      return Response.json({
        access_token: 'upstream-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'upstream-refresh-token',
      });
    });

    const callback = await worker.default.fetch(
      new Request(
        `https://sso.crove.com/callback?code=supabase-code&state=${encodeURIComponent(upstreamState)}`,
        { redirect: 'manual' },
      ),
    );

    expect(callback.status).toBe(302);
    expect(submittedVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(callback.headers.get('referrer-policy')).toBe('no-referrer');
    const downstream = new URL(callback.headers.get('location')!);
    expect(downstream.origin + downstream.pathname).toBe(workerEnv.DOWNSTREAM_REDIRECT_URI);
    expect(downstream.searchParams.get('state')).toBe('postiz-state');
    expect(downstream.searchParams.get('code')).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('rejects a replayed upstream callback', async () => {
    const authorization = await worker.default.fetch(authorizeUrl());
    const upstreamState = new URL(authorization.headers.get('location')!).searchParams.get('state')!;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      Response.json({ access_token: 'upstream-access-token', token_type: 'bearer' }),
    );
    const callbackUrl = `https://sso.crove.com/callback?code=supabase-code&state=${upstreamState}`;

    expect((await worker.default.fetch(new Request(callbackUrl, { redirect: 'manual' }))).status).toBe(302);
    const replay = await worker.default.fetch(new Request(callbackUrl, { redirect: 'manual' }));
    expect(replay.status).toBe(400);
    await expect(replay.json()).resolves.toMatchObject({ error: 'invalid_request' });
  });

  it('does not expose an upstream token error body', async () => {
    const authorization = await worker.default.fetch(authorizeUrl());
    const upstreamState = new URL(authorization.headers.get('location')!).searchParams.get('state')!;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      Response.json({ error: 'invalid_client', leaked: 'upstream-secret-body' }, { status: 401 }),
    );

    const response = await worker.default.fetch(
      new Request(`https://sso.crove.com/callback?code=bad&state=${upstreamState}`),
    );
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('upstream-secret-body');
  });

  it('exchanges a bridge code for the upstream token response', async () => {
    const bridgeCode = await issueBridgeCode();
    const response = await worker.default.fetch(tokenRequest(bridgeCode));

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('pragma')).toBe('no-cache');
    await expect(response.json()).resolves.toEqual({
      access_token: 'upstream-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'upstream-refresh-token',
    });
  });

  it('rejects a replayed bridge code', async () => {
    const bridgeCode = await issueBridgeCode();
    expect((await worker.default.fetch(tokenRequest(bridgeCode))).status).toBe(200);

    const replay = await worker.default.fetch(tokenRequest(bridgeCode));
    expect(replay.status).toBe(400);
    await expect(replay.json()).resolves.toMatchObject({ error: 'invalid_grant' });
  });

  it('rejects an invalid downstream secret without consuming the bridge code', async () => {
    const bridgeCode = await issueBridgeCode();
    const invalid = await worker.default.fetch(
      tokenRequest(bridgeCode, { client_secret: 'wrong-secret' }),
    );
    expect(invalid.status).toBe(401);
    await expect(invalid.json()).resolves.toMatchObject({ error: 'invalid_client' });

    expect((await worker.default.fetch(tokenRequest(bridgeCode))).status).toBe(200);
  });

  it('rejects a wrong downstream redirect URI without consuming the bridge code', async () => {
    const bridgeCode = await issueBridgeCode();
    const invalid = await worker.default.fetch(
      tokenRequest(bridgeCode, { redirect_uri: 'https://evil.example/callback' }),
    );
    expect(invalid.status).toBe(400);
    await expect(invalid.json()).resolves.toMatchObject({ error: 'invalid_grant' });

    expect((await worker.default.fetch(tokenRequest(bridgeCode))).status).toBe(200);
  });

  it('proxies userinfo with the bearer token and strips upstream headers', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const upstream = new Request(input, init);
      expect(upstream.url).toBe(workerEnv.UPSTREAM_USERINFO_URL);
      expect(upstream.headers.get('authorization')).toBe('Bearer upstream-access-token');
      return Response.json(
        { sub: 'dos-id-subject', email: 'joy@dos.ai', email_verified: true, name: 'JOY' },
        { headers: { 'Set-Cookie': 'should-not-pass=1', 'X-Upstream': 'private' } },
      );
    });

    const response = await worker.default.fetch(
      new Request('https://sso.crove.com/userinfo', {
        headers: { Authorization: 'Bearer upstream-access-token' },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toBeNull();
    expect(response.headers.get('x-upstream')).toBeNull();
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({
      sub: 'dos-id-subject',
      email: 'joy@dos.ai',
      email_verified: true,
      name: 'JOY',
    });
    const logOutput = log.mock.calls.flat().join(' ');
    expect(logOutput).toContain('"endpoint":"/userinfo"');
    expect(logOutput).not.toContain('upstream-access-token');
    expect(logOutput).not.toContain('joy@dos.ai');
    expect(logOutput).not.toContain('dos-id-subject');
  });

  it('rejects userinfo without an exact bearer token', async () => {
    const response = await worker.default.fetch(new Request('https://sso.crove.com/userinfo'));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid_token' });
  });

  it('does not expose an upstream userinfo error body', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      Response.json({ leaked: 'upstream-private-error' }, { status: 401 }),
    );
    const response = await worker.default.fetch(
      new Request('https://sso.crove.com/userinfo', {
        headers: { Authorization: 'Bearer bad-token' },
      }),
    );
    expect(response.status).toBe(401);
    expect(await response.text()).not.toContain('upstream-private-error');
  });
});
