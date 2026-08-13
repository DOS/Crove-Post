import { describe, expect, it } from 'vitest';

import type { Env } from '../src/env';
import {
  createPkce,
  oauthError,
  parseAuthorizeRequest,
  parseTokenRequest,
} from '../src/oauth';

const env = {
  DOWNSTREAM_CLIENT_ID: 'crove-postiz',
  DOWNSTREAM_CLIENT_SECRET: 'bridge-secret-value',
  DOWNSTREAM_REDIRECT_URI: 'https://crove.com/settings',
  ALLOWED_SCOPE: 'openid profile email',
} as Env;

function authorizeUrl(overrides: Record<string, string> = {}) {
  const params = new URLSearchParams({
    client_id: env.DOWNSTREAM_CLIENT_ID,
    redirect_uri: env.DOWNSTREAM_REDIRECT_URI,
    response_type: 'code',
    scope: env.ALLOWED_SCOPE,
    state: 'downstream-state',
    ...overrides,
  });
  return new Request(`https://sso.crove.com/authorize?${params}`);
}

describe('parseAuthorizeRequest', () => {
  it('accepts the exact Postiz authorization request', () => {
    expect(parseAuthorizeRequest(authorizeUrl(), env)).toEqual({
      redirectUri: env.DOWNSTREAM_REDIRECT_URI,
      scope: env.ALLOWED_SCOPE,
      state: 'downstream-state',
    });
  });

  it.each([
    ['unknown client', { client_id: 'unknown' }, 'invalid_client'],
    ['wrong redirect', { redirect_uri: 'https://evil.example/callback' }, 'invalid_request'],
    ['wrong response type', { response_type: 'token' }, 'unsupported_response_type'],
    ['extra scope', { scope: 'openid profile email admin' }, 'invalid_scope'],
  ])('rejects %s', (_name, overrides, code) => {
    expect(() => parseAuthorizeRequest(authorizeUrl(overrides), env)).toThrow(code);
  });
});

describe('createPkce', () => {
  it('returns a valid S256 verifier and challenge', async () => {
    const { verifier, challenge } = await createPkce();
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    const expected = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

    expect(verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(challenge).toBe(expected);
  });
});

function tokenRequest(overrides: Record<string, string> = {}, contentType = 'application/x-www-form-urlencoded') {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: env.DOWNSTREAM_CLIENT_ID,
    client_secret: env.DOWNSTREAM_CLIENT_SECRET,
    redirect_uri: env.DOWNSTREAM_REDIRECT_URI,
    code: 'single-use-code',
    ...overrides,
  });
  return new Request('https://sso.crove.com/token', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  });
}

describe('parseTokenRequest', () => {
  it('accepts the exact Postiz token request', async () => {
    await expect(parseTokenRequest(tokenRequest(), env)).resolves.toEqual({ code: 'single-use-code' });
  });

  it.each([
    ['wrong grant type', { grant_type: 'refresh_token' }, 'unsupported_grant_type'],
    ['unknown client', { client_id: 'unknown' }, 'invalid_client'],
    ['invalid client secret', { client_secret: 'wrong-secret' }, 'invalid_client'],
    ['wrong redirect', { redirect_uri: 'https://evil.example/callback' }, 'invalid_grant'],
    ['missing code', { code: '' }, 'invalid_grant'],
  ])('rejects %s', async (_name, overrides, code) => {
    await expect(parseTokenRequest(tokenRequest(overrides), env)).rejects.toThrow(code);
  });

  it('rejects a non-form request', async () => {
    await expect(parseTokenRequest(tokenRequest({}, 'application/json'), env)).rejects.toThrow(
      'invalid_request',
    );
  });
});

describe('oauthError', () => {
  it('returns a safe no-store OAuth response', async () => {
    const response = oauthError('invalid_grant', 'Authorization code is invalid', 400);
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('pragma')).toBe('no-cache');
    await expect(response.json()).resolves.toEqual({
      error: 'invalid_grant',
      error_description: 'Authorization code is invalid',
    });
  });
});
