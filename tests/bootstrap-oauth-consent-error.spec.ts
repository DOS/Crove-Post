import {
  authorizationActionResult,
  CONSENT_SESSION_ERROR,
} from '../apps/frontend/src/app/(app)/oauth/authorize/authorization-action-result';
import {
  shouldHandleGlobalLogout,
  shouldPreserveOAuthConsentUnauthorized,
} from '../apps/frontend/src/components/layout/oauth-consent-unauthorized';

describe('First-party OAuth consent error UI', () => {
  it('keeps superseded tab A on a visible safe error instead of redirecting', () => {
    expect(
      authorizationActionResult(false, {
        statusCode: 401,
        message: 'Unexpected server detail',
      })
    ).toEqual({ error: CONSENT_SESSION_ERROR, redirect: null });
  });

  it('does not redirect when a stale session has no safe authorization response', () => {
    expect(authorizationActionResult(false, null)).toEqual({
      error: CONSENT_SESSION_ERROR,
      redirect: null,
    });
  });

  it('keeps a failed consent POST on the OAuth page instead of sending it to launches', () => {
    expect(
      shouldPreserveOAuthConsentUnauthorized('/oauth/authorize', 'POST', 401)
    ).toBe(true);
    expect(
      shouldPreserveOAuthConsentUnauthorized(
        'https://beta-post.crove.com/oauth/authorize?state=test',
        'POST',
        401
      )
    ).toBe(true);
    expect(
      shouldPreserveOAuthConsentUnauthorized('/oauth/authorize', 'GET', 401)
    ).toBe(false);
    expect(
      shouldPreserveOAuthConsentUnauthorized('/user/profile', 'POST', 401)
    ).toBe(false);
    expect(
      shouldPreserveOAuthConsentUnauthorized('/oauth/authorize', 'POST', 500)
    ).toBe(false);
    expect(
      shouldHandleGlobalLogout('/oauth/authorize', 'POST', 401, true)
    ).toBe(false);
    expect(shouldHandleGlobalLogout('/oauth/authorize', 'GET', 401, true)).toBe(
      true
    );
    expect(shouldHandleGlobalLogout('/user/profile', 'POST', 401, true)).toBe(
      true
    );
  });
});
