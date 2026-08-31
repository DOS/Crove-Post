export const CONSENT_SESSION_ERROR =
  'Consent session changed or expired; reconnect to continue';

type AuthorizationActionResponse = {
  redirect?: unknown;
  statusCode?: unknown;
  message?: unknown;
};

type AuthorizationActionResult =
  | { error: string; redirect: null }
  | { error: null; redirect: string };

export function authorizationActionResult(
  responseOk: boolean,
  response: AuthorizationActionResponse | null
): AuthorizationActionResult {
  if (
    !responseOk ||
    (typeof response?.statusCode === 'number' && response.statusCode >= 400)
  ) {
    return { error: CONSENT_SESSION_ERROR, redirect: null };
  }

  if (typeof response?.redirect !== 'string' || !response.redirect) {
    return { error: CONSENT_SESSION_ERROR, redirect: null };
  }

  return { error: null, redirect: response.redirect };
}
