import { test, expect } from '@playwright/test';

// Reddit OAuth broker integration E2E (docs/platform/REDDIT-OAUTH-BROKER.md
// on DOS-Me). The e2e workspace has no channel entitlement (Crove is
// billing-gated by design), so the full connect flow needs a paid org plus a
// real Reddit authorization - run that part as a manual click-through. This
// spec covers what needs no entitlement:
//  1. The dos.me broker accepts the beta product label + a 128-bit product
//     state and hands off to Reddit's authorize page with the DOS app
//     credentials and its own callback redirect_uri (real broker contract).
//  2. The frontend callback page survives the broker's denial shape
//     (?error=...&state=...) end to end and renders the error screen.

test.describe('reddit broker contract', () => {
  test('broker authorize hands off to Reddit with the DOS app', async ({
    request,
  }) => {
    // 32 alphanumeric chars = ~190 bits, above the broker's 128-bit floor.
    const state = 'A'.repeat(16) + 'a'.repeat(16);
    const resp = await request.get(
      `https://api.dos.me/oauth/reddit/authorize?product=crove-post-beta&state=${state}`,
      { maxRedirects: 0 }
    );
    expect(resp.status()).toBe(302);
    const location = resp.headers()['location']!;
    expect(location).toContain('https://www.reddit.com/api/v1/authorize');
    const params = new URL(location).searchParams;
    expect(params.get('client_id')?.length).toBeGreaterThan(5);
    expect(params.get('response_type')).toBe('code');
    expect(params.get('redirect_uri')).toBe(
      'https://api.dos.me/oauth/reddit/callback'
    );
    expect(params.get('duration')).toBe('permanent');
    expect(params.get('scope')?.split(' ').sort()).toEqual([
      'flair',
      'identity',
      'read',
      'submit',
    ]);
    expect(params.get('state')).not.toBe(state);

    // An unknown product must be rejected, not redirected anywhere.
    const bad = await request.get(
      `https://api.dos.me/oauth/reddit/authorize?product=not-a-product&state=${state}`,
      { maxRedirects: 0 }
    );
    expect(bad.status()).toBe(400);

    // A short state (the old 6-char makeId) must be rejected.
    const short = await request.get(
      `https://api.dos.me/oauth/reddit/authorize?product=crove-post-beta&state=Ab3xY9`,
      { maxRedirects: 0 }
    );
    expect(short.status()).toBe(400);
  });

  test('denial callback renders the error screen', async ({ page }) => {
    await page.goto(
      '/integrations/social/reddit?state=brokerDenialProbe0001&error=access_denied'
    );
    await expect(
      page.getByText('Could not add provider').first()
    ).toBeVisible({ timeout: 30_000 });
  });
});
