import { mapDosPlanToCrove, crovePackToDosPlan, isDosUserId } from './dos-plan.map';

describe('mapDosPlanToCrove', () => {
  it('maps pro to Crove PRO with 30 channels', () => {
    expect(mapDosPlanToCrove('pro')).toMatchObject({
      dosPlan: 'pro',
      tier: 'PRO',
      channels: 30,
      monthPrice: 19,
    });
  });

  it('maps plus to Crove STANDARD with 5 channels', () => {
    expect(mapDosPlanToCrove('plus')).toMatchObject({
      dosPlan: 'plus',
      tier: 'STANDARD',
      channels: 5,
      monthPrice: 9,
    });
  });

  it('maps missing/free to FREE with 0 channels', () => {
    expect(mapDosPlanToCrove(undefined)).toMatchObject({
      dosPlan: 'free',
      tier: 'FREE',
      channels: 0,
    });
  });
});

describe('crovePackToDosPlan', () => {
  it('maps STANDARD purchase buttons to DOS plus', () => {
    expect(crovePackToDosPlan('STANDARD')).toBe('plus');
  });

  it('maps PRO purchase buttons to DOS pro', () => {
    expect(crovePackToDosPlan('PRO')).toBe('pro');
  });
});

describe('isDosUserId', () => {
  it('accepts the DOS OIDC sub', () => {
    expect(isDosUserId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('rejects a Postiz local id', () => {
    expect(isDosUserId('clxyz')).toBe(false);
  });
});
