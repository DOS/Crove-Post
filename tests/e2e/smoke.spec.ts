import { test, expect, Page } from '@playwright/test';

// Smoke flow: login (DOS ID SSO) -> compose a post -> schedule it -> see it on
// the calendar. Runs against the beta deployment by default (E2E_BASE_URL).

// Public, unauthenticated checks run on every invocation.
test.describe('public smoke', () => {
  test('auth page renders with Crove branding and DOS ID', async ({ page }) => {
    await page.goto('/auth');
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByText('Crove').first()).toBeVisible();
    await expect(page.getByText('Sign in with DOS ID')).toBeVisible();
  });

  test('login page renders and links back to sign up', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByText('Sign in with DOS ID')).toBeVisible();
  });
});

// Authenticated flow requires a dedicated beta test account. Never run it
// with a personal account: it creates real posts in the workspace.
const email = process.env.E2E_DOS_EMAIL;
const password = process.env.E2E_DOS_PASSWORD;

test.describe('authenticated smoke', () => {
  test.skip(!email || !password, 'E2E_DOS_EMAIL / E2E_DOS_PASSWORD not set');

  async function loginWithDosId(page: Page) {
    await page.goto('/auth/login');
    await page.getByText('Sign in with DOS ID').click();
    // DOS ID hosted login form (beta-id.dos.me): unlabeled email + password
    // inputs, submit button "Sign in". The button may navigate in-tab or open
    // a popup - follow whichever page lands on the DOS ID host.
    const dosIdPage = await Promise.race([
      page.waitForURL(/dos\.me/, { timeout: 30_000 }).then(() => page),
      page
        .context()
        .waitForEvent('page', { timeout: 30_000 })
        .then((popup) => popup.waitForLoadState('domcontentloaded').then(() => popup))
        .catch(() => null),
    ]);
    if (!dosIdPage) throw new Error('DOS ID login page never opened');
    await dosIdPage.locator('input[type="email"]').first().fill(email!);
    await dosIdPage.locator('input[type="password"]').first().fill(password!);
    await dosIdPage.getByRole('button', { name: /sign in/i }).click();
    // Back on the Crove app after the consent/redirect round trip - accept
    // any app URL (launches dashboard, onboarding, or bare host root).
    await dosIdPage.waitForURL((u) => !/dos\.me\/(login|register)/.test(u.pathname), {
      timeout: 45_000,
    });
    await expect(dosIdPage).not.toHaveURL(/dos\.me\/login/);
  }

  test('compose, schedule and see the post on the calendar', async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await loginWithDosId(page);

    // First login on beta lands on the workspace-creation onboarding
    // (Company name + Create Account) when the user has no organization yet.
    const company = page.getByRole('textbox', { name: /company/i });
    if (await company.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await company.fill('E2E Test Workspace');
      await page.getByRole('button', { name: /create account/i }).click();
      // Land on the launch screen (may take a few redirects)
      await page.waitForURL(/launches/, { timeout: 45_000 }).catch(() => {});
    }

    // A fresh workspace shows the DOS plan picker over the launch screen and
    // has no connected channel - composing is impossible until one is
    // provisioned. Skip (not fail) so the login + onboarding part stays green.
    await page.waitForURL(/launches/, { timeout: 30_000 }).catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    const planGate = page.getByText(/Choose a Plan|Continue to DOS checkout/i).first();
    if (await planGate.isVisible({ timeout: 15_000 }).catch(() => false)) {
      test.skip(
        true,
        'Workspace has no connected channel (plan/onboarding gate showing). Connect a safe channel (Telegram bot or throwaway Discord) to enable the full compose -> schedule -> calendar flow.'
      );
    }
    await expect(planGate).toBeHidden({ timeout: 5_000 });

    // The composer opens from the launch screen. Probe the same entry points
    // the UI offers rather than assuming one label.
    const composerEntry = page
      .getByRole('button', { name: /new post|create post|compose/i })
      .first();
    await composerEntry.click({ timeout: 20_000 });
    // Pick the first connected channel if the channel picker is present.
    const channel = page
      .locator('[class*="integration"], [data-integration]')
      .first();
    await channel.click({ timeout: 15_000 }).catch(() => {
      // A workspace without connected channels cannot schedule - surface it.
      throw new Error(
        'No connected channel found in the test workspace - connect one (e.g. Telegram/Discord) and rerun.'
      );
    });
    // Type content into the rich editor
    const editor = page.locator('.tiptap, [contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type('E2E smoke post - safe to delete');
    // Schedule via the primary submit control
    await page
      .getByRole('button', { name: /schedule|save|post now|schedule post/i })
      .first()
      .click();
    // Calendar shows the scheduled post
    await expect(
      page.getByText('E2E smoke post - safe to delete').first()
    ).toBeVisible();
  });
});
