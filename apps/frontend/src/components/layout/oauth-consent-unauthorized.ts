export function shouldPreserveOAuthConsentUnauthorized(
  url: string,
  method: string | undefined,
  status: number
) {
  if (status !== 401 || method?.toUpperCase() !== 'POST') return false;
  try {
    return (
      new URL(url, 'https://oauth.invalid').pathname === '/oauth/authorize'
    );
  } catch {
    return false;
  }
}

export function shouldHandleGlobalLogout(
  url: string,
  method: string | undefined,
  status: number,
  hasLogoutHeader: boolean
) {
  return (
    hasLogoutHeader &&
    !shouldPreserveOAuthConsentUnauthorized(url, method, status)
  );
}
