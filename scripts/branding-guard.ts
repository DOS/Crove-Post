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
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';

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
  // Fail closed: a deployment that never sets BRAND_CLAUDE_DIRECTORY_URL must
  // hide the button, not fall back to the upstream listing.
  assert(!defaults.claudeDirectoryUrl, 'Default claudeDirectoryUrl must be empty so the Add-to-Claude button fails closed');
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
    BRAND_CLAUDE_DIRECTORY_URL: 'https://claude.ai/directory/crove',
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
  assert(
    custom.claudeDirectoryUrl === 'https://claude.ai/directory/crove',
    'claudeDirectoryUrl parsed from BRAND_CLAUDE_DIRECTORY_URL'
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

// 6. Repository scanner — catches actual branding leaks in tracked files.
// The contract tests above only exercise the branding engine in memory;
// they can never see a leaked image reference or a wrong FRONTEND_URL.
// STRICT hits fail the run. INHERITED hits are upstream files that arrive
// on every sync — reported loudly but tolerated until deliberately
// deleted/rewritten (ratchet by moving a file from INHERITED to strict
// once its cleanup lands).
{
  console.log('\n=== Repository Branding Scan ===\n');

  const SKIP_DIRS = new Set([
    'node_modules', '.git', '.next', 'dist', 'build', 'reports',
    'coverage', '.artifacts', '.codex-artifacts', '.vercel',
    '.playwright-mcp', 'dynamicconfig', 'var',
    // local tooling/worktree copies of the repo — not source of truth
    '.codex', '.claude', '.cursor', '.qwen', 'tests',
  ]);
  // Upstream attribution files: legal/inherited content where the
  // upstream name is expected to appear.
  const INHERITED = [
    'LICENSE', 'ICLA.md', 'CCLA.md', 'README.md', 'SECURITY.md',
    'docs/', '.github/workflows/sync-upstream.yml',
    '.github/workflows/staging-conflicts.yml',
    'scripts/branding-guard.ts', // this file asserts the defaults
    'libraries/helpers/src/utils/brand.config.ts', // DEFAULT_BRAND_CONFIG
    // 17 locale files carry the upstream support link, arrive on every sync
    'libraries/react-shared-libraries/src/translation/locales/',
    'chatgpt-app-submission.json', // upstream submission, pending rewrite
    'sonar-project.properties', // upstream tenant key, pending deletion
    'Jenkins/', 'railway.toml', '.devcontainer/', // dead upstream infra
    '.github/workflows/issue-label-triggers.yml', // upstream automation
    'libraries/nestjs-libraries/src/sentry/initialize.sentry.ts',
    'CHANGELOG.md', 'ROADMAP.md',
  ];
  // Crove-owned files where a leak is always a bug.
  const STRICT_EXTRA = [
    'docker-compose.yaml',
    '.github/workflows/build-extension.yaml',
    '.github/workflows/publish-extension.yml',
    'apps/extension/manifest.json',
  ];
  // Directories we own and actively edit — leaks here are strict.
  const STRICT_PREFIXES = [
    'apps/backend/src/', 'apps/frontend/src/', 'apps/crove-sso/',
    'apps/sdk/',
    'libraries/nestjs-libraries/src/', 'libraries/helpers/src/',
    'libraries/react-shared-libraries/src/',
    'scripts/',
  ];
  // Two families of leak, deliberately separate:
  //   ATTRIBUTION — AGPL-3.0 obligations (repo, image, author). Must survive
  //                 in LICENSE/README/docs, so those stay in INHERITED.
  //   RUNTIME     — endpoints and install commands a customer actually
  //                 executes. These are never attribution: they send Crove
  //                 traffic or Crove credentials to upstream infrastructure.
  // The RUNTIME family was missing entirely, which is how a rebranded
  // @crove/node SDK shipped with a default _path of https://api.postiz.com.
  const PATTERNS: Array<[RegExp, string]> = [
    // --- attribution ---
    [/platform\.postiz\.com/gi, 'upstream platform domain'],
    [/gitroomhq\/postiz-app/gi, 'upstream container image'],
    [/github\.com\/gitroomhq/gi, 'upstream repository URL'],
    [/\bNevo David\b/g, 'upstream author name'],
    [/\bpostiz-app\b/gi, 'upstream repository name'],
    // --- runtime: upstream endpoints ---
    [/\b(?:api|docs|affiliate|cli-auth)\.postiz\.com\b/gi, 'upstream runtime endpoint'],
    // --- runtime: upstream install/skill instructions ---
    [/gitroomhq\/postiz-agent/gi, 'upstream agent skill package'],
    [/install\s+-g\s+postiz\b/gi, 'upstream CLI install command'],
    // --- runtime: upstream-branded destinations shown to customers ---
    [/claude\.ai\/directory\/postiz/gi, 'upstream Claude directory listing'],
    [/'Postiz MCP'|"Postiz MCP"/g, 'upstream MCP server name'],
  ];
  const TEXT_EXTS = new Set([
    '.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.jsonc', '.yaml',
    '.yml', '.md', '.html', '.scss', '.css', '.sh', '.ps1', '.conf',
    '.toml', '.properties', '', // extensionless (Dockerfile, LICENSE…)
  ]);

  function* walk(dir: string): Generator<string> {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        if (!SKIP_DIRS.has(entry)) yield* walk(full);
      } else {
        yield full;
      }
    }
  }

  const repoRoot = join(__dirname, '..');
  let strictHits = 0;
  let inheritedHits = 0;
  let allowedHits = 0;
  for (const file of walk(repoRoot)) {
    const rel = file.slice(repoRoot.length + 1).replace(/\\/g, '/');
    const ext = extname(file);
    if (!TEXT_EXTS.has(ext)) continue;
    if (INHERITED.some((p) => rel === p || rel.startsWith(p))) continue;
    let content;
    try {
      content = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const strict =
      STRICT_EXTRA.includes(rel) ||
      STRICT_PREFIXES.some((p) => rel.startsWith(p));
    const lines = content.split('\n');
    for (const [pattern, label] of PATTERNS) {
      // Per-match line numbers: the previous version reported one line for
      // every match in the file, so a file with three leaks on three lines
      // showed as "(3×)" against the first line only.
      for (const match of content.matchAll(pattern)) {
        const lineNo = content.slice(0, match.index ?? 0).split('\n').length;
        const matchedLine = lines[lineNo - 1] ?? '';
        const prevLine = lines[lineNo - 2] ?? '';
        // Commented-out examples of BRAND_* attribution are documentation of
        // the AGPL knob, not shipped config — never a strict leak.
        if (/^\s*(#|\/\/|\/\*|\{\/\*)/.test(matchedLine)) continue;
        // Deliberate upstream reference on the matched line or the line above
        // it. Must carry a reason so the exception is reviewable, and is
        // still counted and printed — exceptions stay visible, never silent.
        if (/branding-guard-allow:/.test(`${prevLine}\n${matchedLine}`)) {
          allowedHits += 1;
          console.warn(`[ALLOWED] ${rel}:${lineNo} — ${label}`);
          continue;
        }
        if (strict) {
          strictHits += 1;
          console.error(`[FAIL] ${rel}:${lineNo} — ${label}`);
          failed = true;
        } else {
          inheritedHits += 1;
          console.warn(`[INHERITED] ${rel}:${lineNo} — ${label}`);
        }
      }
    }
  }
  assert(strictHits === 0, `Repo scan: 0 strict branding leaks (found ${strictHits})`);
  console.log(
    `Repo scan: ${inheritedHits} inherited upstream mentions (tolerated, see INHERITED list)`
  );
  console.log(
    `Repo scan: ${allowedHits} deliberate upstream references (see branding-guard-allow comments)`
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
