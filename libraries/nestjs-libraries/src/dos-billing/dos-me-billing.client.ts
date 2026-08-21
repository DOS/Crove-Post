import { Injectable, Logger } from '@nestjs/common';
import type { DosPlan } from './dos-plan.map';

export type DosEntitlement = {
  user_id: string;
  plan: DosPlan;
  active_subscription_source: 'none' | 'stripe' | 'apple' | 'google';
  active_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
};

@Injectable()
export class DosMeBillingClient {
  private readonly logger = new Logger(DosMeBillingClient.name);

  private apiUrl() {
    return (process.env.DOS_ME_API_URL || 'https://api.dos.me').replace(
      /\/+$/,
      ''
    );
  }

  private apiKey() {
    const key = process.env.DOS_ME_INTERNAL_API_KEY || '';
    if (key.length < 32) {
      throw new Error('DOS_ME_INTERNAL_API_KEY is not configured');
    }
    return key;
  }

  async getEntitlement(userId: string): Promise<DosEntitlement> {
    return this.request<DosEntitlement>(`/internal/users/${userId}/plan`, {
      method: 'GET',
    });
  }

  async checkout(input: {
    userId: string;
    plan: Exclude<DosPlan, 'free'>;
    successUrl: string;
    cancelUrl: string;
  }) {
    return this.request<{
      url?: string;
      plan?: string;
      already_subscribed?: boolean;
      portal_url?: string;
      updated?: boolean;
    }>('/internal/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({
        userId: input.userId,
        plan: input.plan,
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
      }),
    });
  }

  async portal(userId: string, returnUrl: string) {
    return this.request<{ url: string }>('/internal/billing/portal', {
      method: 'POST',
      body: JSON.stringify({ userId, returnUrl }),
    });
  }

  async cancel(userId: string) {
    return this.request<{ cancel_at_period_end: boolean; plan: string }>(
      '/internal/billing/cancel',
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }
    );
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const url = `${this.apiUrl()}${path}`;
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey(),
        ...(init.headers || {}),
      },
    });
    const text = await response.text();
    let body: any = {};
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { error: text };
    }
    if (!response.ok) {
      this.logger.warn(
        `DOS-Me ${init.method} ${path} failed: ${response.status} ${text}`
      );
      const err = new Error(
        body?.error?.message || body?.message || `DOS-Me ${response.status}`
      ) as Error & { status?: number; body?: unknown };
      err.status = response.status;
      err.body = body;
      throw err;
    }
    return body as T;
  }
}
