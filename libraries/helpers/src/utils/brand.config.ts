export interface BrandConfig {
  name: string;
  shortName: string;
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
}

export interface PublicBrandConfig extends BrandConfig {
  isCustomBrand: boolean;
}

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  name: 'Postiz',
  shortName: 'Postiz',
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

export function getBrandConfig(env: Record<string, string | undefined> = process.env): PublicBrandConfig {
  const brandName = (env.BRAND_NAME || env.NEXT_PUBLIC_BRAND_NAME || '').trim() || DEFAULT_BRAND_CONFIG.name;
  const brandShortName = (env.BRAND_SHORT_NAME || env.NEXT_PUBLIC_BRAND_SHORT_NAME || '').trim() || brandName;
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

  const isCustomBrand = brandName.toLowerCase() !== 'postiz' && brandName.toLowerCase() !== 'gitroom';

  return {
    name: brandName,
    shortName: brandShortName,
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
