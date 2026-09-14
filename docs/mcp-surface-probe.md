# 7. MCP Surface Probe

Continuous verification of the deployed MCP surface for **Production**
(`post.crove.com/api`) and **Beta** (`beta-post.crove.com/api`), implemented in
[`scripts/probe-mcp.mjs`](../scripts/probe-mcp.mjs) and scheduled by
[`.github/workflows/mcp-surface-probe.yml`](../.github/workflows/mcp-surface-probe.yml).

## Why it exists

On 2026-09-08 a database outage on Beta was swallowed by the public API and
returned an **empty 401**, which the DOSClaw agent misread as an OAuth failure.
The surface was down, but nothing failed loudly anywhere.

This probe turns that class of incident into an alarm. It runs from GitHub
Actions because runners have public internet access — a dev machine in this
environment cannot resolve the deployed domains at all, so CI is the only place
the deployed endpoints can be checked from.

## What it checks

All requests are **read-only** (discovery, `initialize`, `tools/list`), so it is
safe on a 30-minute schedule against production.

| Check | Asserts |
| :--- | :--- |
| RFC 9728 discovery | `/.well-known/oauth-protected-resource/mcp-oauth-dynamic` returns 200 with the correct `resource` and at least one `authorization_servers` entry |
| No credential | `/mcp-oauth-dynamic` returns 401 with a real `WWW-Authenticate` header carrying `resource_metadata=`, and a body naming `error: "unauthorized"` |
| Unknown bearer token | 401 with `error: "invalid_token"` — the surface fails closed, never falls through to serving |
| No credential on `/mcp` | 401 `Missing Authorization header` |
| Bogus API key on `/mcp/:id` | **400** `Invalid API Key` — distinct from 401, proving the key-in-URL mount is wired to the org lookup rather than the OAuth middleware |
| Authenticated path (only when `MCP_PROBE_TOKEN` is set) | `initialize` returns 200 with a `serverInfo.name` that is branded and **never** `"Postiz MCP"`; `tools/list` returns a non-empty tool set; `GET /public/v1/is-connected` answers 200 |

The last three authenticated checks are what upgrade this from "the surface
fails closed" to "a real agent can actually work".

## What it deliberately does NOT do

- It is **not** a push/PR gate. A transient production blip must not fail
  unrelated work, so the workflow triggers only on `workflow_dispatch` and
  `schedule` (`13,43 * * * *`).
- It never prints or logs the credential.

## Enabling the authenticated checks

Add a repository secret `MCP_PROBE_TOKEN` holding a `pos_` token (or an
organization API key) for the deployment being probed. The workflow already
passes it through; without the secret the probe still verifies every endpoint
fails closed, and the log says so explicitly.

The token must be one that resolves to an organization — the probe exercises
the same `resolveAuth` path DOSClaw, Claude and Cursor use.

## Interpreting a failure

- `PROBE FAILED: RFC 9728 discovery is served` — the backend is down, nginx is
  misrouted, or the MCP middleware never registered. Agents cannot even start
  OAuth discovery.
- `PROBE FAILED: 401 carries an RFC 9728 WWW-Authenticate header` — requests are
  reaching something other than the MCP middleware. This is the swallowed-error
  shape from the 2026-09-08 incident: a generic 401 with no discovery pointer,
  which clients misread as an OAuth misconfiguration.
- `PROBE FAILED: server announces a branded name` with
  `serverInfo.name="Postiz MCP"` — the deployed image predates the connector
  renaming, or an upstream sync reverted it.
- `PROBE FAILED: public API is-connected answers 200` — the public API is
  degrading (likely database connectivity), which is exactly what DOSClaw hit.

## First verified run

2026-09-14 — production **9/9**, beta **9/9** (credential absent, so the
authenticated block was skipped and reported as such).
