import { NextRequest } from 'next/server';
import { proxy } from '../apps/frontend/src/proxy';

jest.mock('../libraries/helpers/src/utils/internal.fetch', () => ({
  internalFetch: jest.fn(),
}));
jest.mock(
  '../libraries/react-shared-libraries/src/translation/i18n.config',
  () => ({ cookieName: 'lang', headerName: 'lang', languages: ['en'] })
);

describe('First-party browser launch', () => {
  const ticket = `fpt_${'a'.repeat(64)}`;
  const originalFetch = global.fetch;
  beforeEach(() => {
    process.env.FRONTEND_URL = 'https://beta-post.crove.com';
    process.env.BACKEND_INTERNAL_URL = 'http://localhost:3000';
    global.fetch = jest.fn(
      async () =>
        new Response(
          JSON.stringify({
            success: true,
            redirect_to:
              '/oauth/authorize?client_id=pca_bound&state=bound-state&response_type=code',
          }),
          {
            status: 200,
            headers: [
              ['content-type', 'application/json'],
              [
                'set-cookie',
                'auth=session-test; Path=/; HttpOnly; Secure; SameSite=Lax',
              ],
              [
                'set-cookie',
                'showorg=org-test; Path=/; HttpOnly; Secure; SameSite=Lax',
              ],
            ],
          }
        )
    );
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });
  it('exchanges before auth redirect and strips ticket and hostile query overrides with secure cookies', async () => {
    const response = await proxy(
      new NextRequest(
        `https://beta-post.crove.com/oauth/authorize?ticket=${ticket}&client_id=evil&state=evil&redirect_to=https://evil.test`
      )
    );
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      'https://beta-post.crove.com/oauth/authorize?client_id=pca_bound&state=bound-state&response_type=code'
    );
    expect(
      response.headers
        .getSetCookie()
        .some((value) => value.startsWith('auth=session-test;'))
    ).toBe(true);
    expect(
      response.headers
        .getSetCookie()
        .some((value) => value.startsWith('showorg=org-test;'))
    ).toBe(true);
    expect(response.headers.get('set-cookie')).toMatch(/HttpOnly/i);
    expect(response.headers.get('set-cookie')).toMatch(/Secure/);
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/v1/ticket/consume',
      expect.objectContaining({
        body: JSON.stringify({ ticket }),
        redirect: 'error',
        cache: 'no-store',
      })
    );
  });
  it('replaces an existing browser session with the ticket-bound session', async () => {
    const response = await proxy(
      new NextRequest(
        `https://beta-post.crove.com/oauth/authorize?ticket=${ticket}`,
        { headers: { cookie: 'auth=old-session; showorg=other-org' } }
      )
    );
    expect(response.status).toBe(303);
    expect(response.headers.get('set-cookie')).toContain('auth=session-test;');
  });
  it('fails closed without echoing ticket on rejected exchange', async () => {
    global.fetch = jest.fn(async () => new Response('{}', { status: 400 }));
    const response = await proxy(
      new NextRequest(
        `https://beta-post.crove.com/oauth/authorize?ticket=${ticket}`
      )
    );
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain(ticket);
    expect(response.headers.get('location')).toBeNull();
  });
  it('rejects malformed tickets without calling backend', async () => {
    const response = await proxy(
      new NextRequest(
        'https://beta-post.crove.com/oauth/authorize?ticket=pos_secret'
      )
    );
    expect(response.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });
  it('rejects backend redirects outside the consent origin/path', async () => {
    global.fetch = jest.fn(
      async () =>
        new Response(JSON.stringify({ redirect_to: 'https://evil.test/' }), {
          status: 200,
        })
    );
    expect(
      (
        await proxy(
          new NextRequest(
            `https://beta-post.crove.com/oauth/authorize?ticket=${ticket}`
          )
        )
      ).status
    ).toBe(400);
  });
});
