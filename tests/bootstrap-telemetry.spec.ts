import * as BackendSentry from '@sentry/nestjs';
import * as FrontendSentry from '@sentry/nextjs';
import { initializeSentry } from '../libraries/nestjs-libraries/src/sentry/initialize.sentry';
import { initializeSentryBasic } from '../libraries/react-shared-libraries/src/sentry/initialize.sentry.next.basic';

jest.mock('@sentry/nestjs', () => ({
  init: jest.fn(),
  consoleLoggingIntegration: jest.fn(),
  openAIIntegration: jest.fn(),
}));
jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  consoleLoggingIntegration: jest.fn(),
}));
jest.mock('@sentry/profiling-node', () => ({
  nodeProfilingIntegration: jest.fn(),
}));

describe('First-party telemetry privacy', () => {
  it.each([
    'https://beta-post.crove.com/oauth/authorize?ticket=fpt_synthetic',
    'https://beta-post.crove.com/api/internal/first-party/bootstrap',
    'http://localhost:3000/v1/ticket/consume',
  ])('drops errors and transactions at %s from both runtimes', (url) => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@localhost/1';
    try {
      initializeSentry('backend', true);
      initializeSentryBasic('production', 'https://test@localhost/1', {});
      for (const sdk of [BackendSentry, FrontendSentry]) {
        const options = (sdk.init as jest.Mock).mock.calls.at(-1)[0];
        const event = {
          request: { url, data: { ticket: 'synthetic-ticket' } },
        };
        expect(options.beforeSend(event, {})).toBeNull();
        expect(options.beforeSendTransaction(event, {})).toBeNull();
        const ordinary = {
          request: { url: 'https://beta-post.crove.com/api/health' },
        };
        expect(options.beforeSend(ordinary, {})).toBe(ordinary);
        expect(options.beforeSendTransaction(ordinary, {})).toBe(ordinary);
      }
    } finally {
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    }
  });
});
