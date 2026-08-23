import type { Env } from './env';
import {
  createPkce,
  OAuthRequestError,
  oauthError,
  parseAuthorizeRequest,
  parseTokenRequest,
  randomToken,
} from './oauth';
import { putState, takeState } from './state-store';

const AUTHORIZATION_TTL_SECONDS = 600;
const BRIDGE_CODE_TTL_SECONDS = 60;

export interface AuthorizationTransaction {
  redirectUri: string;
  scope: string;
  downstreamState?: string;
  verifier: string;
}

async function authorize(request: Request, env: Env): Promise<Response> {
  const downstream = parseAuthorizeRequest(request, env);
  const upstreamState = randomToken();
  const pkce = await createPkce();
  await putState<AuthorizationTransaction>(
    env,
    `authorize:${upstreamState}`,
    {
      redirectUri: downstream.redirectUri,
      scope: downstream.scope,
      downstreamState: downstream.state,
      verifier: pkce.verifier,
    },
    AUTHORIZATION_TTL_SECONDS,
  );

  const target = new URL(env.UPSTREAM_AUTHORIZE_URL);
  target.search = new URLSearchParams({
    client_id: env.UPSTREAM_CLIENT_ID,
    redirect_uri: env.UPSTREAM_REDIRECT_URI,
    response_type: 'code',
    scope: downstream.scope,
    state: upstreamState,
    code_challenge: pkce.challenge,
    code_challenge_method: 'S256',
  }).toString();

  return new Response(null, {
    status: 302,
    headers: {
      Location: target.toString(),
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store',
    },
  });
}

async function callback(request: Request, env: Env): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const code = params.get('code');
  const state = params.get('state');
  if (!code || !state) {
    throw new OAuthRequestError('invalid_request');
  }

  const transaction = await takeState<AuthorizationTransaction>(env, `authorize:${state}`);
  if (!transaction) {
    throw new OAuthRequestError('invalid_request');
  }

  const upstreamResponse = await globalThis.fetch(env.UPSTREAM_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.UPSTREAM_CLIENT_ID,
      client_secret: env.UPSTREAM_CLIENT_SECRET,
      code,
      redirect_uri: env.UPSTREAM_REDIRECT_URI,
      code_verifier: transaction.verifier,
    }),
  });
  if (!upstreamResponse.ok) {
    return oauthError('temporarily_unavailable', 'Identity provider unavailable', 502);
  }

  let tokenResponse: Record<string, unknown>;
  try {
    tokenResponse = await upstreamResponse.json<Record<string, unknown>>();
  } catch {
    return oauthError('temporarily_unavailable', 'Identity provider unavailable', 502);
  }
  if (typeof tokenResponse.access_token !== 'string' || tokenResponse.access_token.length === 0) {
    return oauthError('temporarily_unavailable', 'Identity provider unavailable', 502);
  }

  const bridgeCode = randomToken();
  await putState(env, `code:${bridgeCode}`, tokenResponse, BRIDGE_CODE_TTL_SECONDS);

  const target = new URL(transaction.redirectUri);
  target.searchParams.set('code', bridgeCode);
  if (transaction.downstreamState) {
    target.searchParams.set('state', transaction.downstreamState);
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: target.toString(),
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store',
    },
  });
}

async function token(request: Request, env: Env): Promise<Response> {
  const tokenRequest = await parseTokenRequest(request, env);
  const tokenResponse = await takeState<Record<string, unknown>>(env, `code:${tokenRequest.code}`);
  if (!tokenResponse) {
    throw new OAuthRequestError('invalid_grant');
  }

  return Response.json(tokenResponse, {
    headers: {
      'Cache-Control': 'no-store',
      Pragma: 'no-cache',
    },
  });
}

async function userinfo(request: Request, env: Env): Promise<Response> {
  const authorization = request.headers.get('authorization') || '';
  const bearer = /^Bearer ([^\s]+)$/.exec(authorization)?.[1];
  if (!bearer) {
    return oauthError('invalid_token', 'Bearer token required', 401);
  }

  const upstreamResponse = await globalThis.fetch(env.UPSTREAM_USERINFO_URL, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bearer}`,
    },
  });
  if (!upstreamResponse.ok) {
    if (upstreamResponse.status === 401 || upstreamResponse.status === 403) {
      return oauthError('invalid_token', 'Identity token rejected', 401);
    }
    return oauthError('temporarily_unavailable', 'Identity provider unavailable', 502);
  }

  let claims: Record<string, unknown>;
  try {
    claims = await upstreamResponse.json<Record<string, unknown>>();
  } catch {
    return oauthError('temporarily_unavailable', 'Identity provider unavailable', 502);
  }
  if (typeof claims.sub !== 'string' || claims.sub.length === 0) {
    return oauthError('invalid_token', 'Identity token rejected', 401);
  }

  return Response.json(claims, {
    headers: {
      'Cache-Control': 'no-store',
      Pragma: 'no-cache',
    },
  });
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url);
  try {
    if (request.method === 'GET' && pathname === '/health') {
      return Response.json({ status: 'ok', service: 'crove-sso' });
    }
    if (request.method === 'GET' && pathname === '/authorize') {
      return await authorize(request, env);
    }
    if (request.method === 'GET' && pathname === '/callback') {
      return await callback(request, env);
    }
    if (request.method === 'POST' && pathname === '/token') {
      return await token(request, env);
    }
    if (request.method === 'GET' && pathname === '/userinfo') {
      return await userinfo(request, env);
    }
    return new Response('Not found', { status: 404 });
  } catch (error) {
    if (error instanceof OAuthRequestError) {
      return oauthError(error.code, 'OAuth request rejected', error.status);
    }
    return oauthError('server_error', 'OAuth service unavailable', 500);
  }
}

async function fetch(request: Request, env: Env): Promise<Response> {
  const requestId = crypto.randomUUID();
  const endpoint = new URL(request.url).pathname;
  const startedAt = performance.now();
  const response = await handleRequest(request, env);
  const logEntry: Record<string, string | number> = {
    requestId,
    endpoint,
    status: response.status,
    durationMs: Math.round(performance.now() - startedAt),
  };
  if (response.status >= 400) {
    logEntry.errorCode = `http_${response.status}`;
  }
  console.log(JSON.stringify(logEntry));
  return response;
}

export default { fetch };

export { OAuthStateStore } from './state-store';
