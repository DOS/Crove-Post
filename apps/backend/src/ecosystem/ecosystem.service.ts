import { Injectable, Logger } from '@nestjs/common';
import {
  getEcosystemConfig,
  isEcosystemSyncEnabled,
} from '@gitroom/helpers/utils/ecosystem.config';

@Injectable()
export class EcosystemService {
  private readonly _logger = new Logger(EcosystemService.name);

  isEnabled(): boolean {
    return isEcosystemSyncEnabled();
  }

  getConfig() {
    return getEcosystemConfig();
  }

  /**
   * Delegates organization creation to the central identity/ecosystem provider (e.g. api.dos.me)
   * if ecosystem sync is enabled and a valid Bearer token is provided.
   * Returns remote organization details or null to fallback to local creation.
   */
  async delegateOrgCreation(
    orgName: string,
    userAuthHeader?: string
  ): Promise<{ id?: string; name?: string } | null> {
    if (!this.isEnabled() || !userAuthHeader || !userAuthHeader.startsWith('Bearer ')) {
      return null;
    }

    const { apiUrl } = this.getConfig();
    try {
      const response = await fetch(`${apiUrl}/organizations`, {
        method: 'POST',
        headers: {
          Authorization: userAuthHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: orgName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.id) {
          return {
            id: data.id,
            name: data.name || orgName,
          };
        }
      }
    } catch (err: any) {
      this._logger.warn(
        `Ecosystem organization delegation failed: ${err?.message || err}. Falling back to local creation.`
      );
    }

    return null;
  }
}
