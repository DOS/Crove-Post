export function shouldPreserveOAuthConsentUnauthorized(
  url: string,
  status: number,
  hasLogoutHeader: boolean
) {
  return (
    !hasLogoutHeader &&
    status === 401 &&
    url.split('?', 1)[0] === '/oauth/authorize'
  );
}
