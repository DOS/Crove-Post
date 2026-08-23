import { env } from 'cloudflare:workers';
import { evictDurableObject } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

import type { Env } from '../src/env';
import { putState, takeState } from '../src/state-store';

const workerEnv = env as unknown as Env;

describe('OAuthStateStore', () => {
  it('returns a stored value exactly once', async () => {
    const key = crypto.randomUUID();
    await putState(workerEnv, key, { state: 'stored' }, 60);

    await expect(takeState<{ state: string }>(workerEnv, key)).resolves.toEqual({ state: 'stored' });
    await expect(takeState(workerEnv, key)).resolves.toBeNull();
  });

  it('does not return an expired value', async () => {
    const key = crypto.randomUUID();
    await putState(workerEnv, key, { state: 'expired' }, 0);

    await expect(takeState(workerEnv, key)).resolves.toBeNull();
  });

  it('allows exactly one concurrent consumer', async () => {
    const key = crypto.randomUUID();
    await putState(workerEnv, key, { state: 'race' }, 60);

    const values = await Promise.all([
      takeState<{ state: string }>(workerEnv, key),
      takeState<{ state: string }>(workerEnv, key),
    ]);

    expect(values.filter((value) => value !== null)).toHaveLength(1);
    expect(values.find((value) => value !== null)).toEqual({ state: 'race' });
  });

  it('preserves state across Durable Object eviction', async () => {
    const key = crypto.randomUUID();
    await putState(workerEnv, key, { state: 'persisted' }, 60);
    const id = workerEnv.OAUTH_STATE.idFromName('oauth-state');
    await evictDurableObject(workerEnv.OAUTH_STATE.get(id));

    await expect(takeState<{ state: string }>(workerEnv, key)).resolves.toEqual({
      state: 'persisted',
    });
  });
});
