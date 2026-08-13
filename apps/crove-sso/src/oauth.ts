import type { Env } from './env';

export interface AuthorizeRequest {
  redirectUri: string;
  scope: string;
  state?: string;
}

export interface TokenRequest {
  code: string;
}

export class OAuthRequestError extends Error {
  constructor(
    readonly code: string,
    readonly status = 400,
  ) {
    super(code);
    this.name = 'OAuthRequestError';
  }
}

function base64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function constantTimeEqual(actual: string, expected: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [actualDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(actual)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  const actualBytes = new Uint8Array(actualDigest);
  const expectedBytes = new Uint8Array(expectedDigest);
  let difference = 0;
  for (let index = 0; index < actualBytes.length; index += 1) {
    difference |= actualBytes[index] ^ expectedBytes[index];
  }
  return difference === 0;
}

export function parseAuthorizeRequest(request: Request, env: Env): AuthorizeRequest {
  const params = new URL(request.url).searchParams;
  if (params.get('client_id') !== env.DOWNSTREAM_CLIENT_ID) {
    throw new OAuthRequestError('invalid_client', 401);
  }
  if (params.get('redirect_uri') !== env.DOWNSTREAM_REDIRECT_URI) {
    throw new OAuthRequestError('invalid_request');
  }
  if (params.get('response_type') !== 'code') {
    throw new OAuthRequestError('unsupported_response_type');
  }
  if (params.get('scope') !== env.ALLOWED_SCOPE) {
    throw new OAuthRequestError('invalid_scope');
  }

  return {
    redirectUri: env.DOWNSTREAM_REDIRECT_URI,
    scope: env.ALLOWED_SCOPE,
    state: params.get('state') || undefined,
  };
}

export async function createPkce(): Promise<{ verifier: string; challenge: string }> {
  const entropy = crypto.getRandomValues(new Uint8Array(32));
  const verifier = base64Url(entropy);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: base64Url(new Uint8Array(digest)) };
}

export async function parseTokenRequest(request: Request, env: Env): Promise<TokenRequest> {
  const contentType = request.headers.get('content-type')?.toLowerCase() || '';
  if (!contentType.startsWith('application/x-www-form-urlencoded')) {
    throw new OAuthRequestError('invalid_request');
  }

  const form = await request.formData();
  const params = new URLSearchParams();
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') params.append(key, value);
  }
  if (params.get('grant_type') !== 'authorization_code') {
    throw new OAuthRequestError('unsupported_grant_type');
  }
  const clientIdMatches = params.get('client_id') === env.DOWNSTREAM_CLIENT_ID;
  const secretMatches = await constantTimeEqual(
    params.get('client_secret') || '',
    env.DOWNSTREAM_CLIENT_SECRET,
  );
  if (!clientIdMatches || !secretMatches) {
    throw new OAuthRequestError('invalid_client', 401);
  }
  if (params.get('redirect_uri') !== env.DOWNSTREAM_REDIRECT_URI) {
    throw new OAuthRequestError('invalid_grant');
  }
  const code = params.get('code');
  if (!code) {
    throw new OAuthRequestError('invalid_grant');
  }

  return { code };
}

export function oauthError(error: string, description: string, status = 400): Response {
  return Response.json(
    { error, error_description: description },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
      },
    },
  );
}
