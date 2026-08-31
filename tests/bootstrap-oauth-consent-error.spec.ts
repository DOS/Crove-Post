import {
  authorizationActionResult,
  CONSENT_SESSION_ERROR,
} from '../apps/frontend/src/app/(app)/oauth/authorize/authorization-action-result';

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
});
