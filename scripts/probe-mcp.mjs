#!/usr/bin/env node
/**
 * Probe the MCP surface of a deployed Crove Post instance.
 *
 * Usage: node scripts/probe-mcp.mjs <baseUrl> <label>
 * Env:   MCP_PROBE_TOKEN — optional pos_ / API-key credential. When absent the
 *        authenticated checks are skipped and only the fail-closed behaviour is
 *        asserted; when present the token is also exercised.
 *
 * Why this exists: the 2026-09-08 audit found the public API swallowing a
 * database exception and returning an empty 401, which DOSClaw misread as an
 * OAuth error. Every rejection asserted here is therefore checked for a
 * well-formed, intentional shape — not merely for a non-200 status.
 *
 * All requests are read-only (protocol discovery, initialize, tools/list), so
 * the probe is safe to run against production on a schedule.
 */

const [, , rawBase, label = 'target'] = process.argv;
const base = (rawBase || '').replace(/\/+$/, '');

if (!base) {
  console.error('usage: node scripts/probe-mcp.mjs <baseUrl> [label]');
  process.exit(2);
}

const token = (process.env.MCP_PROBE_TOKEN || '').trim();

const INITIALIZE = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'crove-mcp-probe', version: '1.0.0' },
  },
};

const results = [];
let failed = false;

function check(name, pass, detail = '') {
  results.push({ name, pass, detail });
  if (!pass) failed = true;
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function req(method, url, { headers = {}, body } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json, text/event-stream',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // Not all responses are JSON (e.g. the plain 401 on /mcp).
  }
  return { status: res.status, headers: res.headers, json, text };
}

const jsonRpc = async (url, headers, payload) =>
  req('POST', url, { headers, body: payload });

async function main() {
  const dynamic = `${base}/mcp-oauth-dynamic`;
  const wellKnown = `${base}/.well-known/oauth-protected-resource/mcp-oauth-dynamic`;

  console.log(`\n=== MCP probe: ${label} (${base}) ===`);
  console.log(`  credential: ${token ? 'present (authenticated checks enabled)' : 'absent (fail-closed checks only)'}\n`);

  // 1. RFC 9728 discovery — this is what an agent consults before it can even
  //    attempt OAuth. A 404 or 500 here breaks every remote MCP client.
  const discovery = await req('GET', wellKnown);
  check(
    'RFC 9728 discovery is served (200 + metadata)',
    discovery.status === 200 && !!discovery.json?.resource,
    discovery.status === 200
      ? `resource=${discovery.json?.resource}`
      : `status=${discovery.status} body=${discovery.text.slice(0, 120)}`
  );
  check(
    'discovery names this path as the protected resource',
    String(discovery.json?.resource || '').endsWith('/mcp-oauth-dynamic'),
    String(discovery.json?.resource || '')
  );
  check(
    'discovery advertises at least one authorization server',
    Array.isArray(discovery.json?.authorization_servers) &&
      discovery.json.authorization_servers.length > 0,
    JSON.stringify(discovery.json?.authorization_servers || []).slice(0, 160)
  );

  // 2. Unauthenticated initialize must be refused with a real RFC 9728
  //    WWW-Authenticate header. An empty body or a generic 401 means the
  //    request never reached the MCP middleware (the swallowed-error shape
  //    the audit found).
  const anon = await jsonRpc(dynamic, {}, INITIALIZE);
  check(
    'no credential -> 401 on /mcp-oauth-dynamic',
    anon.status === 401,
    `status=${anon.status}`
  );
  const wwwAuth = anon.headers.get('www-authenticate') || '';
  check(
    '401 carries an RFC 9728 WWW-Authenticate header',
    /resource_metadata=/i.test(wwwAuth),
    wwwAuth.slice(0, 200)
  );
  check(
    '401 body names the error explicitly',
    anon.json?.error === 'unauthorized',
    JSON.stringify(anon.json || anon.text.slice(0, 120))
  );

  // 3. A wrong token must fail closed — never fall through to serving.
  const bad = await jsonRpc(dynamic, { Authorization: 'Bearer not-a-real-token' }, INITIALIZE);
  check(
    'unknown bearer token -> 401 invalid_token',
    bad.status === 401 && bad.json?.error === 'invalid_token',
    `status=${bad.status} body=${JSON.stringify(bad.json || bad.text.slice(0, 120))}`
  );

  // 4. The legacy /mcp mount rejects cleanly too.
  const bare = await jsonRpc(`${base}/mcp`, {}, INITIALIZE);
  check(
    'no credential -> 401 on /mcp',
    bare.status === 401,
    `status=${bare.status} body=${String(bare.text).slice(0, 120)}`
  );

  // 5. /mcp/:id with a bogus key -> 400 'Invalid API Key' (distinct from 401:
  //    proves the key-in-URL mount is wired to the org lookup, not to the
  //    OAuth middleware).
  const bogusKey = await jsonRpc(`${base}/mcp/not-a-real-key`, {}, INITIALIZE);
  check(
    'bogus API key in path -> 400 on /mcp/:id',
    bogusKey.status === 400,
    `status=${bogusKey.status} body=${String(bogusKey.text).slice(0, 120)}`
  );

  // 6. Authenticated path — only when a credential is configured.
  if (token) {
    const authed = await jsonRpc(
      dynamic,
      { Authorization: `Bearer ${token}` },
      INITIALIZE
    );
    check(
      'valid credential -> 200 initialize',
      authed.status === 200,
      `status=${authed.status} body=${authed.text.slice(0, 120)}`
    );
    const serverName = authed.json?.result?.serverInfo?.name || '';
    check(
      'server announces a branded name',
      // branding-guard-allow: negative assertion — this literal is the thing the probe tests AGAINST (the deployed server must never announce the upstream name), not a leak.
      /\bMCP$/.test(serverName) && serverName !== 'Postiz MCP',
      `serverInfo.name="${serverName}"`
    );

    const listed = await jsonRpc(
      dynamic,
      { Authorization: `Bearer ${token}` },
      { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }
    );
    const toolNames = (listed.json?.result?.tools || []).map((t) => t.name);
    check(
      'tools/list returns the tool set',
      listed.status === 200 && toolNames.length > 0,
      `status=${listed.status} tools=${toolNames.length}`
    );

    // The exact route DOSClaw hit during the 2026-09-08 incident, where a
    // database outage was swallowed into an empty 401.
    const connected = await req('GET', `${base}/public/v1/is-connected`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    check(
      'public API is-connected answers 200',
      connected.status === 200 && connected.json?.connected === true,
      `status=${connected.status} body=${JSON.stringify(connected.json || connected.text.slice(0, 120))}`
    );
  } else {
    console.log('\n  (skipping authenticated checks: MCP_PROBE_TOKEN is not set)');
    console.log('  add it as a repository secret to assert the full agent path');
  }

  console.log(`\n=== ${label}: ${results.filter((r) => r.pass).length}/${results.length} checks passed ===`);

  const firstFailure = results.find((r) => !r.pass);
  if (firstFailure) {
    console.error(`\nPROBE FAILED: ${firstFailure.name}${firstFailure.detail ? ` — ${firstFailure.detail}` : ''}`);
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(`PROBE ERROR for ${label}: ${e && e.message ? e.message : e}`);
  process.exit(1);
});
