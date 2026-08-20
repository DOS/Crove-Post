/**
 * Branding Guard - CI Validation Script
 * Verifies that the branding engine, sanitization, and fallback mechanisms
 * operate without error and conform to AGPL-3.0 compliance rules.
 */

import {
  getBrandConfig,
  sanitizeUrl,
  sanitizeHexColor,
  applyBrandToString,
  DEFAULT_BRAND_CONFIG,
} from '../libraries/helpers/src/utils/brand.config';

let failed = false;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    failed = true;
  } else {
    console.log(`[PASS] ${message}`);
  }
}

console.log('=== Running Branding Guard Validations ===\n');

// 1. Default fallback test
{
  const defaults = getBrandConfig({});
  assert(defaults.name === 'Postiz', 'Default brand name should be Postiz');
  assert(defaults.isCustomBrand === false, 'Default isCustomBrand should be false');
  assert(defaults.sourceUrl === DEFAULT_BRAND_CONFIG.sourceUrl, 'Default sourceUrl must point to upstream repository');
  assert(defaults.primaryColor === '#612BD3', 'Default primaryColor should be #612BD3');
}

// 2. Custom branding test
{
  const custom = getBrandConfig({
    BRAND_NAME: 'Crove',
    BRAND_SHORT_NAME: 'Crove',
    BRAND_COMPANY_NAME: 'Crove Inc',
    BRAND_PRIMARY_COLOR: '#7c3aed',
    BRAND_LOGO_URL: 'https://crove.app/logo.png',
    BRAND_DEFAULT_EMAIL_DOMAIN: 'crove.app',
    MAIN_URL: 'https://crove.app',
  });

  assert(custom.name === 'Crove', 'Custom brand name matches');
  assert(custom.isCustomBrand === true, 'Custom isCustomBrand should be true');
  assert(custom.primaryColor === '#7c3aed', 'Custom primary color parsed');
  assert(custom.logoUrl === 'https://crove.app/logo.png', 'Custom logo URL parsed');
  assert(custom.defaultEmailDomain === 'crove.app', 'Custom email domain parsed');
  assert(custom.supportEmail === 'support@crove.app', 'Support email auto fallbacks to support@<defaultEmailDomain>');
  assert(
    custom.websiteUrl === 'https://crove.app' || custom.websiteUrl === 'https://crove.app/',
    'websiteUrl auto fallbacks to MAIN_URL when BRAND_WEBSITE_URL omitted'
  );
}

// 3. Security sanitization tests
{
  assert(sanitizeUrl('javascript:alert(1)') === undefined, 'Reject javascript: URLs');
  assert(sanitizeUrl('data:text/html,<script>alert(1)</script>') === undefined, 'Reject data: URLs');
  assert(sanitizeUrl('//evil.com/phishing') === undefined, 'Reject protocol-relative URLs');
  assert(sanitizeUrl('https://user:password@evil.com') === undefined, 'Reject embedded credentials');
  assert(sanitizeUrl('/custom-logo.svg') === '/custom-logo.svg', 'Allow root-relative paths');
  assert(sanitizeUrl('https://cdn.example.com/logo.png') === 'https://cdn.example.com/logo.png', 'Allow valid HTTPS URLs');

  assert(sanitizeHexColor('red') === undefined, 'Reject named CSS color');
  assert(sanitizeHexColor('#XYZ123') === undefined, 'Reject invalid hex color');
  assert(sanitizeHexColor('#ff0055') === '#ff0055', 'Allow 6-digit hex color');
  assert(sanitizeHexColor('#f05') === '#f05', 'Allow 3-digit hex color');
  assert(sanitizeHexColor('#ff0055aa') === '#ff0055aa', 'Allow 8-digit hex color');
}

// 4. Dynamic string replacement test
{
  const template = 'Welcome to Postiz! Postiz is great.';
  const replaced = applyBrandToString(template, 'Crove');
  assert(replaced === 'Welcome to Crove! Crove is great.', 'applyBrandToString replaces brand words correctly');

  const unchanged = applyBrandToString(template, 'Postiz');
  assert(unchanged === template, 'applyBrandToString retains string when brand is Postiz');
}

// 5. AGPL Compliance test (Source code URL must be preserved)
{
  const custom = getBrandConfig({
    BRAND_NAME: 'MyCompany',
  });
  assert(
    !!custom.sourceUrl && custom.sourceUrl.includes('postiz-app'),
    'AGPL requirement: sourceUrl must default to original upstream repository'
  );
}

console.log('\n=== Branding Guard Summary ===');
if (failed) {
  console.error('\nBranding Guard validations FAILED! Check logs above.\n');
  process.exit(1);
} else {
  console.log('\nAll Branding Guard validations PASSED successfully!\n');
  process.exit(0);
}
