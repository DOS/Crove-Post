import {
  authorizationActionResult,
  CONSENT_SESSION_ERROR,
} from '../apps/frontend/src/app/(app)/oauth/authorize/authorization-action-result';
import { shouldPreserveOAuthConsentUnauthorized } from '../apps/frontend/src/components/layout/oauth-consent-unauthorized';

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
      shouldPreserveOAuthConsentUnauthorized('/oauth/authorize', 401, false)
    ).toBe(true);
    expect(
      shouldPreserveOAuthConsentUnauthorized(
        '/oauth/authorize?state=test',
        401,
        false
      )
    ).toBe(true);
    expect(
      shouldPreserveOAuthConsentUnauthorized('/user/profile', 401, false)
    ).toBe(false);
    expect(
      shouldPreserveOAuthConsentUnauthorized('/oauth/authorize', 401, true)
    ).toBe(false);
  });
});
