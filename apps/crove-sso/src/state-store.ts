import { DurableObject } from 'cloudflare:workers';

import type { Env } from './env';

interface StoredEntry<T> {
  value: T;
}

export class OAuthStateStore extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS oauth_entries (
          id TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          expires_at INTEGER NOT NULL
        )
      `);
    });
  }

  async fetch(request: Request): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (request.method === 'POST' && path === '/put') {
      const entry = await request.json<{
        key: string;
        value: unknown;
        expiresAt: number;
      }>();
      this.ctx.storage.sql.exec(
        'INSERT OR REPLACE INTO oauth_entries (id, value, expires_at) VALUES (?, ?, ?)',
        entry.key,
        JSON.stringify({ value: entry.value }),
        entry.expiresAt,
      );
      return new Response(null, { status: 204 });
    }

    if (request.method === 'POST' && path === '/take') {
      const { key } = await request.json<{ key: string }>();
      const rows = [
        ...this.ctx.storage.sql.exec<{ value: string }>(
          'DELETE FROM oauth_entries WHERE id = ? AND expires_at > ? RETURNING value',
          key,
          Date.now(),
        ),
      ];
      this.ctx.storage.sql.exec('DELETE FROM oauth_entries WHERE id = ? AND expires_at <= ?', key, Date.now());
      if (rows.length !== 1) return new Response(null, { status: 404 });
      return Response.json(JSON.parse(rows[0].value) as StoredEntry<unknown>);
    }

    return new Response(null, { status: 404 });
  }
}

function store(env: Env): DurableObjectStub {
  return env.OAUTH_STATE.get(env.OAUTH_STATE.idFromName('oauth-state'));
}

export async function putState<T>(
  env: Env,
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  const response = await store(env).fetch('https://state.internal/put', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value, expiresAt: Date.now() + ttlSeconds * 1000 }),
  });
  if (!response.ok) throw new Error('state_store_unavailable');
}

export async function takeState<T>(env: Env, key: string): Promise<T | null> {
  const response = await store(env).fetch('https://state.internal/take', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('state_store_unavailable');
  const entry = await response.json<StoredEntry<T>>();
  return entry.value;
}
