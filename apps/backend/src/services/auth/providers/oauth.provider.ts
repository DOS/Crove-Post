import {
  AuthProvider,
  AuthProviderAbstract,
} from '@gitroom/backend/services/auth/providers.interface';

@AuthProvider({ provider: 'GENERIC' })
export class OauthProvider extends AuthProviderAbstract {
  private getConfig() {
    const {
      POSTIZ_OAUTH_AUTH_URL,
      POSTIZ_OAUTH_CLIENT_ID,
      POSTIZ_OAUTH_CLIENT_SECRET,
      POSTIZ_OAUTH_TOKEN_URL,
      POSTIZ_OAUTH_USERINFO_URL,
      FRONTEND_URL,
    } = process.env;

    if (
      !POSTIZ_OAUTH_USERINFO_URL ||
      !POSTIZ_OAUTH_TOKEN_URL ||
      !POSTIZ_OAUTH_CLIENT_ID ||
      !POSTIZ_OAUTH_CLIENT_SECRET ||
      !POSTIZ_OAUTH_AUTH_URL ||
      !FRONTEND_URL
    ) {
      throw new Error('POSTIZ_OAUTH environment variables are not set');
    }

    return {
      authUrl: POSTIZ_OAUTH_AUTH_URL,
      clientId: POSTIZ_OAUTH_CLIENT_ID,
      clientSecret: POSTIZ_OAUTH_CLIENT_SECRET,
      tokenUrl: POSTIZ_OAUTH_TOKEN_URL,
      userInfoUrl: POSTIZ_OAUTH_USERINFO_URL,
      frontendUrl: FRONTEND_URL,
    };
  }

  generateLink(query?: { state?: string }): string {
    const { authUrl, clientId, frontendUrl } = this.getConfig();
    const params = new URLSearchParams({
      client_id: clientId,
      scope: process.env.POSTIZ_OAUTH_SCOPE || 'openid profile email organizations teams offline_access',
      response_type: 'code',
      state: query?.state || 'login',
      redirect_uri: `${frontendUrl}/auth`,
    });

    return `${authUrl}?${params.toString()}`;
  }

  async getToken(code: string, _redirectUri?: string): Promise<string> {
    const { tokenUrl, clientId, clientSecret, frontendUrl } = this.getConfig();
    const response = await fetch(`${tokenUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${frontendUrl}/auth`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token request failed: ${error}`);
    }

    const { access_token } = await response.json();
    return access_token;
  }

  async getUser(access_token: string): Promise<{
    email: string;
    id: string;
    name?: string;
    picture?: string;
    active_org_id?: string;
    organizations?: Array<{ id: string; name: string; slug?: string; role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'SUPERADMIN' }>;
    teams?: Array<{ id: string; org_id: string; name: string; slug: string; role?: 'LEAD' | 'MEMBER' | string }>;
  }> {
    const { userInfoUrl } = this.getConfig();
    const response = await fetch(`${userInfoUrl}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`User info request failed: ${error}`);
    }

    const payload = await response.json();
    return {
      email: payload.email,
      id: payload.sub || payload.id,
      name: payload.name || payload.full_name || payload.user_metadata?.name || payload.user_metadata?.full_name,
      picture: payload.picture || payload.avatar_url || payload.user_metadata?.picture || payload.user_metadata?.avatar_url,
      active_org_id: payload.active_org_id || payload.user_metadata?.active_org_id,
      organizations: payload.organizations || payload.user_metadata?.organizations || [],
      teams: payload.teams || payload.user_metadata?.teams || [],
    };
  }
}
