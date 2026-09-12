export interface BrandConfig {
  name: string;
  shortName: string;
  /**
   * Machine identifier for this deployment's MCP server, used as the key in
   * generated client config (`claude mcp add <name>`, `{ mcpServers: { <name>: … } }`).
   * Always a lowercase hyphenated slug so it stays safe as a shell argument,
   * JSON key, YAML key and TOML table name.
   */
  mcpConnectorName: string;
  description: string;
  companyName: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  iconUrl?: string;
  faviconUrl?: string;
  emailLogoUrl?: string;
  primaryColor?: string;
  websiteUrl: string;
  supportUrl: string;
  docsUrl: string;
  sourceUrl: string;
  termsUrl: string;
  privacyUrl: string;
  supportEmail: string;
  defaultEmailDomain: string;
  extensionStoreUrl?: string;
  tutorialUrl?: string;
  affiliateUrl?: string;
  claudeDirectoryUrl?: string;
}

export interface PublicBrandConfig extends BrandConfig {
  isCustomBrand: boolean;
}

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  name: 'Postiz',
  shortName: 'Postiz',
  mcpConnectorName: 'postiz',
  description: 'The open-source social media management platform',
  companyName: 'Postiz',
  logoUrl: '',
  logoDarkUrl: '',
  iconUrl: '',
  faviconUrl: '/favicon.ico',
  emailLogoUrl: '',
  primaryColor: '#612BD3',
  websiteUrl: 'https://postiz.com',
  supportUrl: 'https://discord.gg/postiz',
  docsUrl: 'https://docs.postiz.com',
  sourceUrl: 'https://github.com/gitroomhq/postiz-app',
  termsUrl: '/terms',
  privacyUrl: '/privacy',
  supportEmail: 'support@postiz.com',
  defaultEmailDomain: 'postiz.com',
  extensionStoreUrl: '',
  tutorialUrl: '',
  affiliateUrl: '',
  // Deliberately empty rather than the upstream listing: a fork that forgets
  // to set this must hide the button, not install a competitor's connector.
  claudeDirectoryUrl: '',
};

const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

export function sanitizeUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  const lower = trimmed.toLowerCase();
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (lower.startsWith(protocol)) return undefined;
  }

  // Reject protocol-relative URLs (e.g. //evil.com)
  if (trimmed.startsWith('//')) return undefined;

  // Relative path
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return undefined;
    }
    // Reject URLs with embedded credentials (e.g. https://user:pass@evil.com)
    if (parsed.username || parsed.password) {
      return undefined;
    }
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export function sanitizeHexColor(color?: string | null): string | undefined {
  if (!color || typeof color !== 'string') return undefined;
  const trimmed = color.trim();
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(trimmed)) {
    return trimmed;
  }
  return undefined;
}

/**
 * Reduce a display name to a machine-safe identifier: lowercase, hyphenated,
 * no leading/trailing hyphen. "Crove (Beta)" -> "crove-beta".
 * Returns '' when nothing alphanumeric survives, so callers can fall back.
 */
export function slugifyIdentifier(value?: string | null): string {
  if (!value || typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Join a brand URL base with a path, tolerating a trailing slash on the base
 * and a leading slash on the path. Needed because sanitizeUrl normalises
 * through the URL constructor, so a bare origin such as
 * BRAND_DOCS_URL=https://docs.example.com comes back as
 * "https://docs.example.com/" and naive concatenation yields a double slash.
 */
export function joinBrandUrl(base?: string | null, path?: string | null): string {
  const trimmedBase = (base || '').replace(/\/+$/, '');
  const trimmedPath = (path || '').replace(/^\/+/, '');
  if (!trimmedBase) return trimmedPath ? `/${trimmedPath}` : '';
  return trimmedPath ? `${trimmedBase}/${trimmedPath}` : trimmedBase;
}

export function getBrandConfig(env: Record<string, string | undefined> = process.env): PublicBrandConfig {
  const brandName = (env.BRAND_NAME || env.NEXT_PUBLIC_BRAND_NAME || '').trim() || DEFAULT_BRAND_CONFIG.name;
  const brandShortName = (env.BRAND_SHORT_NAME || env.NEXT_PUBLIC_BRAND_SHORT_NAME || '').trim() || brandName;
  // Explicit override wins; otherwise derive from the short name so a
  // deployment that never sets it still gets a correctly branded connector
  // key ("Crove" -> "crove") instead of the upstream one.
  const mcpConnectorName =
    slugifyIdentifier(env.BRAND_MCP_CONNECTOR_NAME || env.NEXT_PUBLIC_BRAND_MCP_CONNECTOR_NAME) ||
    slugifyIdentifier(brandShortName) ||
    'mcp';
  const brandDescription = (env.BRAND_DESCRIPTION || env.NEXT_PUBLIC_BRAND_DESCRIPTION || '').trim() || DEFAULT_BRAND_CONFIG.description;
  const brandCompanyName = (env.BRAND_COMPANY_NAME || env.NEXT_PUBLIC_BRAND_COMPANY_NAME || '').trim() || brandName;

  const logoUrl = sanitizeUrl(env.BRAND_LOGO_URL || env.NEXT_PUBLIC_BRAND_LOGO_URL);
  const logoDarkUrl = sanitizeUrl(env.BRAND_LOGO_DARK_URL || env.NEXT_PUBLIC_BRAND_LOGO_DARK_URL) || logoUrl;
  const iconUrl = sanitizeUrl(env.BRAND_ICON_URL || env.NEXT_PUBLIC_BRAND_ICON_URL);
  const faviconUrl = sanitizeUrl(env.BRAND_FAVICON_URL || env.NEXT_PUBLIC_BRAND_FAVICON_URL) || DEFAULT_BRAND_CONFIG.faviconUrl;
  const emailLogoUrl = sanitizeUrl(env.BRAND_EMAIL_LOGO_URL || env.NEXT_PUBLIC_BRAND_EMAIL_LOGO_URL) || logoUrl;

  const primaryColor = sanitizeHexColor(env.BRAND_PRIMARY_COLOR || env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR) || DEFAULT_BRAND_CONFIG.primaryColor;

  const websiteUrl = sanitizeUrl(env.BRAND_WEBSITE_URL || env.NEXT_PUBLIC_BRAND_WEBSITE_URL || env.MAIN_URL || env.FRONTEND_URL) || DEFAULT_BRAND_CONFIG.websiteUrl;
  const supportUrl = sanitizeUrl(env.BRAND_SUPPORT_URL || env.NEXT_PUBLIC_BRAND_SUPPORT_URL || env.NEXT_PUBLIC_DISCORD_SUPPORT) || DEFAULT_BRAND_CONFIG.supportUrl;
  const docsUrl = sanitizeUrl(env.BRAND_DOCS_URL || env.NEXT_PUBLIC_BRAND_DOCS_URL) || DEFAULT_BRAND_CONFIG.docsUrl;
  const sourceUrl = sanitizeUrl(env.BRAND_SOURCE_URL || env.NEXT_PUBLIC_BRAND_SOURCE_URL) || DEFAULT_BRAND_CONFIG.sourceUrl;
  const termsUrl = sanitizeUrl(env.BRAND_TERMS_URL || env.NEXT_PUBLIC_BRAND_TERMS_URL) || DEFAULT_BRAND_CONFIG.termsUrl;
  const privacyUrl = sanitizeUrl(env.BRAND_PRIVACY_URL || env.NEXT_PUBLIC_BRAND_PRIVACY_URL) || DEFAULT_BRAND_CONFIG.privacyUrl;

  const defaultEmailDomain = (env.BRAND_DEFAULT_EMAIL_DOMAIN || env.NEXT_PUBLIC_BRAND_DEFAULT_EMAIL_DOMAIN || '').trim() || DEFAULT_BRAND_CONFIG.defaultEmailDomain;
  const supportEmail = (env.BRAND_SUPPORT_EMAIL || env.NEXT_PUBLIC_BRAND_SUPPORT_EMAIL || '').trim() || (defaultEmailDomain ? `support@${defaultEmailDomain}` : DEFAULT_BRAND_CONFIG.supportEmail);

  const extensionStoreUrl = sanitizeUrl(env.BRAND_EXTENSION_STORE_URL || env.NEXT_PUBLIC_BRAND_EXTENSION_STORE_URL);
  const tutorialUrl = sanitizeUrl(env.BRAND_TUTORIAL_URL || env.NEXT_PUBLIC_BRAND_TUTORIAL_URL);
  const affiliateUrl = sanitizeUrl(env.BRAND_AFFILIATE_URL || env.NEXT_PUBLIC_BRAND_AFFILIATE_URL);
  const claudeDirectoryUrl = sanitizeUrl(env.BRAND_CLAUDE_DIRECTORY_URL || env.NEXT_PUBLIC_BRAND_CLAUDE_DIRECTORY_URL);

  const isCustomBrand = brandName.toLowerCase() !== 'postiz' && brandName.toLowerCase() !== 'gitroom';

  return {
    name: brandName,
    shortName: brandShortName,
    mcpConnectorName,
    description: brandDescription,
    companyName: brandCompanyName,
    logoUrl,
    logoDarkUrl,
    iconUrl,
    faviconUrl,
    emailLogoUrl,
    primaryColor,
    websiteUrl,
    supportUrl,
    docsUrl,
    sourceUrl,
    termsUrl,
    privacyUrl,
    supportEmail,
    defaultEmailDomain,
    extensionStoreUrl,
    tutorialUrl,
    affiliateUrl,
    claudeDirectoryUrl,
    isCustomBrand,
  };
}

/**
 * Replace brand names ('Postiz', 'Gitroom') in string templates dynamically.
 */
export function applyBrandToString(text: string, brandName: string): string {
  if (!text || !brandName || brandName === 'Postiz') {
    return text;
  }
  return text
    .replace(/\bPostiz\b/g, brandName)
    .replace(/\bGitroom\b/g, brandName);
}
