import assert from 'node:assert/strict';
import test from 'node:test';
import { validateBankReviewInput, validateTransferApplication } from '@server/modules/admin/bank-review-input';

test('bank review requires an existing transfer, order code, and reason', () => {
  for (const body of [null, {}, { transferId: 't1', orderCode: 'DH1' }, { transferId: 't1', note: 'ok' }, { orderCode: 'DH1', note: 'ok' }]) {
    assert.equal(validateBankReviewInput(body).valid, false);
  }
  assert.deepEqual(validateBankReviewInput({ transferId: ' t1 ', orderCode: ' dh1 ', note: '  Khách ghi sai mã  ' }), {
    valid: true,
    data: { transferId: 't1', orderCode: 'DH1', note: 'Khách ghi sai mã' },
  });
});

test('transfer application rejects duplicate, cancelled and underpaid matches', () => {
  const transfer = { status: 'PENDING_REVIEW', orderId: null, amount: 100n };
  const order = { status: 'PENDING', paymentStatus: 'UNPAID', totalAmount: 100n };
  assert.equal(validateTransferApplication(transfer, order), null);
  assert.match(validateTransferApplication({ ...transfer, status: 'APPLIED_ORDER' }, order) || '', /giao dịch/i);
  assert.match(validateTransferApplication(transfer, { ...order, status: 'CANCELLED' }) || '', /đơn hàng/i);
  assert.match(validateTransferApplication({ ...transfer, amount: 99n }, order) || '', /chưa đủ/i);
});
