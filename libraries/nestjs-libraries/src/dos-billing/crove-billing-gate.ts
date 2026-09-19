export function isDosSharedBillingEnabled(): boolean {
  return process.env.DOS_SHARED_BILLING === 'true';
}

export function isCroveBillingGated(): boolean {
  return (
    !!process.env.STRIPE_PUBLISHABLE_KEY || isDosSharedBillingEnabled()
  );
}

export function croveUiBillingEnabled(): boolean {
  return isCroveBillingGated();
}
