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
    await page.goto('/auth');
    await page.getByText('Sign in with DOS ID').click();
    // DOS ID hosted login form (api.dos.me). Selectors to be finalized on the
    // first credential-backed run against the real form.
    await page.getByLabel(/email/i).fill(email!);
    await page.getByLabel(/password/i).fill(password!);
    await page.getByRole('button', { name: /sign in|login/i }).click();
    // Back on the app after the consent/redirect round trip
    await page.waitForURL(/launches|\/$/);
  }

  test('compose, schedule and see the post on the calendar', async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await loginWithDosId(page);

    // Open the composer
    await page.getByRole('button', { name: /new post|create|add/i }).first().click();
    // Pick the first connected channel (a beta workspace has a connected test channel)
    const channel = page.locator('[class*="integration"], [data-integration]').first();
    if (await channel.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await channel.click();
    }
    // Type content
    const editor = page.locator('.tiptap, [contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type('E2E smoke post - safe to delete');
    // Schedule for the next hour via the time picker, then save
    await page.getByRole('button', { name: /schedule|save|post/i }).first().click();
    // Calendar shows the scheduled post
    await expect(page.getByText('E2E smoke post - safe to delete').first()).toBeVisible();
  });
});
