import assert from 'node:assert/strict';
import test from 'node:test';
import { confirmOrderPayment } from '@server/modules/payment/confirm-payment.service';

test('confirms a pending unpaid order exactly once', async () => {
  let calls = 0;
  const db = { order: { updateMany: async (args: { where: { paymentStatus: string; status: string }; data: { paymentStatus: string } }) => {
    assert.equal(args.where.paymentStatus, 'UNPAID');
    assert.equal(args.where.status, 'PENDING');
    assert.equal(args.data.paymentStatus, 'PAID');
    calls++;
    return { count: calls === 1 ? 1 : 0 };
  } } };
  assert.equal(await confirmOrderPayment(db, 'order1'), true);
  assert.equal(await confirmOrderPayment(db, 'order1'), false);
});
