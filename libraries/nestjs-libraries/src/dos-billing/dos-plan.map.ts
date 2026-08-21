import { pricing } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing';

export type DosPlan = 'free' | 'plus' | 'pro';
export type CroveMappedTier = 'FREE' | 'STANDARD' | 'PRO';

export type CrovePlanMapping = {
  dosPlan: DosPlan;
  tier: CroveMappedTier;
  channels: number;
  monthPrice: number;
};

const DOS_MONTH_PRICE = { plus: 9, pro: 19 } as const;

export function mapDosPlanToCrove(plan: string | null | undefined): CrovePlanMapping {
  if (plan === 'pro') {
    return {
      dosPlan: 'pro',
      tier: 'PRO',
      channels: pricing.PRO.channel || 30,
      monthPrice: DOS_MONTH_PRICE.pro,
    };
  }
  if (plan === 'plus') {
    return {
      dosPlan: 'plus',
      tier: 'STANDARD',
      channels: pricing.STANDARD.channel || 5,
      monthPrice: DOS_MONTH_PRICE.plus,
    };
  }
  return {
    dosPlan: 'free',
    tier: 'FREE',
    channels: pricing.FREE.channel || 0,
    monthPrice: 0,
  };
}

export function crovePackToDosPlan(
  pack: string,
): Exclude<DosPlan, 'free'> | 'free' {
  const upper = pack.toUpperCase();
  if (upper === 'PRO' || upper === 'ULTIMATE') {
    return 'pro';
  }
  if (upper === 'FREE') {
    return 'free';
  }
  return 'plus';
}

export function isDosUserId(value: string | undefined | null): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}
