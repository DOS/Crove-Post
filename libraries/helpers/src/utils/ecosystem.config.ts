export interface EcosystemConfig {
  enabled: boolean;
  provider: string;
  apiUrl: string;
  webhookSecret?: string;
  provisioningSecret?: string;
}

export function isEcosystemSyncEnabled(): boolean {
  if (process.env.ENABLE_ECOSYSTEM_SYNC === 'true') {
    return true;
  }
  if (process.env.ENABLE_ECOSYSTEM_SYNC === 'false') {
    return false;
  }
  // Auto-detect if ecosystem secrets or generic oauth are explicitly configured
  return !!(
    process.env.DOS_SYNC_WEBHOOK_SECRET ||
    process.env.PROVISIONING_SECRET_KEY ||
    process.env.DOS_PROVISIONING_SECRET
  );
}

export function getEcosystemConfig(): EcosystemConfig {
  const enabled = isEcosystemSyncEnabled();
  return {
    enabled,
    provider: process.env.ECOSYSTEM_PROVIDER || 'dos',
    apiUrl:
      process.env.POSTIZ_OAUTH_URL ||
      process.env.ECOSYSTEM_API_URL ||
      'https://api.dos.me',
    webhookSecret:
      process.env.DOS_SYNC_WEBHOOK_SECRET || process.env.DOS_WEBHOOK_SECRET,
    provisioningSecret:
      process.env.PROVISIONING_SECRET_KEY ||
      process.env.DOS_PROVISIONING_SECRET ||
      process.env.DOS_SYNC_WEBHOOK_SECRET,
  };
}
