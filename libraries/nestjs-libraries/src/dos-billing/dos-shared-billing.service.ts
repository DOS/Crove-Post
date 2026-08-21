import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Provider, User } from '@prisma/client';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { isDosSharedBillingEnabled } from './crove-billing-gate';
import { DosMeBillingClient } from './dos-me-billing.client';
import {
  CrovePlanMapping,
  crovePackToDosPlan,
  isDosUserId,
  mapDosPlanToCrove,
} from './dos-plan.map';

@Injectable()
export class DosSharedBillingService {
  private readonly logger = new Logger(DosSharedBillingService.name);

  constructor(
    private readonly client: DosMeBillingClient,
    private readonly subscriptions: SubscriptionService
  ) {}

  enabled() {
    return isDosSharedBillingEnabled();
  }

  dosUserId(user: User): string | null {
    if (user.providerName !== Provider.GENERIC) {
      return null;
    }
    return isDosUserId(user.providerId) ? user.providerId : null;
  }

  async syncOrg(
    user: User,
    organizationId: string
  ): Promise<CrovePlanMapping> {
    const dosUserId = this.dosUserId(user);
    if (!dosUserId) {
      this.logger.warn(
        `DOS shared billing is on but user ${user.id} has no DOS UUID providerId`
      );
      return mapDosPlanToCrove('free');
    }

    const entitlement = await this.client.getEntitlement(dosUserId);
    const mapped = mapDosPlanToCrove(entitlement.plan);
    const cancelAt = entitlement.current_period_end
      ? new Date(entitlement.current_period_end)
      : null;

    if (mapped.tier === 'FREE') {
      await this.subscriptions.clearDosSyncedSubscription(organizationId);
    } else {
      await this.subscriptions.syncFromDosPlan(
        organizationId,
        mapped.tier,
        mapped.channels,
        entitlement.active_subscription_id || `dos-${dosUserId}`,
        cancelAt
      );
    }
    return mapped;
  }

  async checkout(
    user: User,
    pack: string,
    frontendUrl: string
  ) {
    const dosUserId = this.requireDosUserId(user);
    const plan = crovePackToDosPlan(pack);
    try {
      if (plan === 'free') {
        return this.client.cancel(dosUserId);
      }
      const billingUrl = `${frontendUrl.replace(/\/+$/, '')}/billing`;
      return await this.client.checkout({
        userId: dosUserId,
        plan,
        successUrl: `${billingUrl}?success=true&plan=${plan}`,
        cancelUrl: `${billingUrl}?canceled=true`,
      });
    } catch (err) {
      this.rethrowDosMe(err);
    }
  }

  async portal(user: User, frontendUrl: string) {
    try {
      const dosUserId = this.requireDosUserId(user);
      const billingUrl = `${frontendUrl.replace(/\/+$/, '')}/billing`;
      return await this.client.portal(dosUserId, billingUrl);
    } catch (err) {
      this.rethrowDosMe(err);
    }
  }

  async cancel(user: User) {
    try {
      return await this.client.cancel(this.requireDosUserId(user));
    } catch (err) {
      this.rethrowDosMe(err);
    }
  }

  private rethrowDosMe(err: unknown): never {
    const status = (err as { status?: number })?.status;
    const message = err instanceof Error ? err.message : 'DOS billing failed';
    throw new HttpException(message, status && status >= 400 ? status : 502);
  }

  private requireDosUserId(user: User): string {
    const dosUserId = this.dosUserId(user);
    if (!dosUserId) {
      throw new HttpException(
        'Crove account is not linked to a DOS ID',
        400
      );
    }
    return dosUserId;
  }
}
