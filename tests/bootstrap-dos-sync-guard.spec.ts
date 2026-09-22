import { mock } from 'jest-mock-extended';
import { Provider, Role } from '@prisma/client';
import { DosSharedBillingService } from '@gitroom/nestjs-libraries/dos-billing/dos-shared-billing.service';
import { DosMeBillingClient } from '@gitroom/nestjs-libraries/dos-billing/dos-me-billing.client';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { OrganizationRepository } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.repository';

// Pure unit suite: the guard under test is the 2026-09-22 incident fix where
// a free-plan MEMBER login wiped the org's paid subscription through
// clearDosSyncedSubscription (deleteMany by organizationId). Only the org
// owner's login may write; members get a read-only view of their own plan.

// Stub the two repository modules with explicit jest.mock factories so the
// suite stays isolated: interaction assertions run against the instances
// injected through the constructor, and the real prisma-backed
// implementations never load in this CJS jest context.
jest.mock(
  '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service',
  () => ({ SubscriptionService: class SubscriptionService {} })
);
jest.mock(
  '@gitroom/nestjs-libraries/database/prisma/organizations/organization.repository',
  () => ({ OrganizationRepository: class OrganizationRepository {} })
);

const ORG_ID = 'org-1';

const freeEntitlement = {
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  plan: 'free',
  active_subscription_source: 'none',
  active_subscription_id: null,
  current_period_start: null,
  current_period_end: null,
};

const plusEntitlement = {
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  plan: 'plus',
  active_subscription_source: 'stripe',
  active_subscription_id: 'sub_test_1',
  current_period_start: '2026-09-01T00:00:00Z',
  current_period_end: '2026-10-01T00:00:00Z',
};

function userFixture() {
  return {
    id: 'user-1',
    providerName: Provider.GENERIC,
    providerId: '550e8400-e29b-41d4-a716-446655440000',
  } as any;
}

function orgsFixture(role: Role) {
  return [
    {
      id: ORG_ID,
      users: [{ disabled: false, role }],
      subscription: null,
    },
  ] as any;
}

function buildService(
  entitlement: typeof freeEntitlement,
  role: Role
): {
  service: DosSharedBillingService;
  subscriptions: ReturnType<typeof mock<SubscriptionService>>;
} {
  const client = mock<DosMeBillingClient>();
  client.getEntitlement.mockResolvedValue(entitlement as any);
  const subscriptions = mock<SubscriptionService>();
  const organizations = mock<OrganizationRepository>();
  (organizations.getOrgsByUserId as any).mockResolvedValue(orgsFixture(role));
  return {
    service: new DosSharedBillingService(client, subscriptions, organizations),
    subscriptions,
  };
}

describe('DosSharedBillingService.syncOrg owner guard', () => {
  it('owner login with a FREE DOS plan clears the synced subscription', async () => {
    const { service, subscriptions } = buildService(freeEntitlement, Role.SUPERADMIN);
    await service.syncOrg(userFixture(), ORG_ID);
    expect(subscriptions.clearDosSyncedSubscription).toHaveBeenCalledWith(ORG_ID);
  });

  it('owner login with a PLUS DOS plan syncs the org subscription', async () => {
    const { service, subscriptions } = buildService(plusEntitlement, Role.SUPERADMIN);
    const mapped = await service.syncOrg(userFixture(), ORG_ID);
    expect(subscriptions.syncFromDosPlan).toHaveBeenCalledWith(
      ORG_ID,
      'STANDARD',
      5,
      'sub_test_1',
      new Date('2026-10-01T00:00:00Z')
    );
    expect(mapped.tier).toBe('STANDARD');
  });

  it('member login with a FREE DOS plan never writes the org subscription', async () => {
    const { service, subscriptions } = buildService(freeEntitlement, Role.ADMIN);
    const mapped = await service.syncOrg(userFixture(), ORG_ID);
    expect(subscriptions.clearDosSyncedSubscription).not.toHaveBeenCalled();
    expect(subscriptions.syncFromDosPlan).not.toHaveBeenCalled();
    expect(mapped.tier).toBe('FREE');
  });

  it('member login with a PLUS DOS plan gets a read-only view, no org write', async () => {
    const { service, subscriptions } = buildService(plusEntitlement, Role.ADMIN);
    const mapped = await service.syncOrg(userFixture(), ORG_ID);
    expect(subscriptions.clearDosSyncedSubscription).not.toHaveBeenCalled();
    expect(subscriptions.syncFromDosPlan).not.toHaveBeenCalled();
    expect(mapped.tier).toBe('STANDARD');
  });

  it('user without a DOS UUID providerId is treated as free, no write', async () => {
    const { service, subscriptions } = buildService(plusEntitlement, Role.SUPERADMIN);
    const localUser = { id: 'user-2', providerName: Provider.LOCAL, providerId: '' } as any;
    const mapped = await service.syncOrg(localUser, ORG_ID);
    expect(subscriptions.clearDosSyncedSubscription).not.toHaveBeenCalled();
    expect(subscriptions.syncFromDosPlan).not.toHaveBeenCalled();
    expect(mapped.tier).toBe('FREE');
  });
});
