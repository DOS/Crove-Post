import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: {
        bindings: {
          UPSTREAM_CLIENT_ID: 'supabase-crove-client',
          UPSTREAM_CLIENT_SECRET: 'supabase-crove-secret',
          DOWNSTREAM_CLIENT_ID: 'crove-postiz',
          DOWNSTREAM_CLIENT_SECRET: 'bridge-secret-value',
        },
      },
    }),
  ],
  test: {
    globals: true,
  },
});
