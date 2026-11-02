import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPaymentQrUrl } from '@server/modules/payment/qr.service';

test('QR contains the persisted amount and unique order code', () => {
  const url = buildPaymentQrUrl({ bankId: 'MB', accountNo: '123456', accountName: 'SHOP' }, 'DH123', 250000n);
  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get('amount'), '250000');
  assert.equal(parsed.searchParams.get('addInfo'), 'DH123');
});

test('QR is unavailable without configured bank details', () => {
  assert.equal(buildPaymentQrUrl({ bankId: 'MB', accountNo: '', accountName: 'SHOP' }, 'DH123', 1n), null);
});
