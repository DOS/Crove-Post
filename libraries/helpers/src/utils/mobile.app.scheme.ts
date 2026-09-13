/**
 * Extract the URL-scheme prefix ("postiz://") from a full MOBILE_APP_SCHEME
 * callback URL ("postiz://auth/callback").
 *
 * The backend owns MOBILE_APP_SCHEME and consumes it as a complete redirect
 * target in GET /oauth-mobile-callback. The frontend only needs the scheme, to
 * build deep links such as "<scheme>integrations". Deriving it here keeps both
 * halves on one variable instead of the frontend hardcoding a second scheme
 * that silently drifts from the backend's.
 *
 * Returns '' when the variable is unset or malformed, so callers can omit the
 * deep link entirely rather than sending an upstream-branded one. Deployments
 * without a mobile app must leave MOBILE_APP_SCHEME empty.
 */
export function getMobileAppScheme(
  env: Record<string, string | undefined> = process.env
): string {
  const raw = (
    env.MOBILE_APP_SCHEME || env.NEXT_PUBLIC_MOBILE_APP_SCHEME || ''
  ).trim();
  // RFC 3986 scheme: ALPHA *( ALPHA / DIGIT / "+" / "-" / "." ) ":"
  const match = /^([a-zA-Z][a-zA-Z0-9+.-]*:\/\/)/.exec(raw);
  return match ? match[1] : '';
}
