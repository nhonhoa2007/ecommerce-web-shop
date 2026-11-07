import assert from 'node:assert/strict';
import test from 'node:test';
import { validateCouponCreate } from '@server/modules/admin/coupon-input';

const valid = { code: ' SALE10 ', discountType: 'PERCENTAGE', discountValue: 10, minOrderAmount: 100000, usageLimit: 100, perUserLimit: 1, startDate: '2026-11-01', endDate: '2026-12-01' };

test('coupon creation checks discount bounds and date range', () => {
  assert.equal(validateCouponCreate(valid).valid, true);
  for (const body of [
    { ...valid, code: 'a b' },
    { ...valid, discountValue: 101 },
    { ...valid, discountValue: -1 },
    { ...valid, usageLimit: 0 },
    { ...valid, startDate: 'invalid' },
    { ...valid, endDate: '2026-10-31' },
  ]) assert.equal(validateCouponCreate(body).valid, false);
});
