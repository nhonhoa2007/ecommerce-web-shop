import assert from 'node:assert/strict';
import test from 'node:test';
import { filterAdminOrders, initialOrderQuery, initialOrderStatus } from '@client/lib/admin-order-filter';

const orders = [
  { orderCode: 'DH001', customerName: 'Nguyễn Văn A', customerPhone: '0901234567', status: 'PENDING', paymentStatus: 'UNPAID' },
  { orderCode: 'DH002', customerName: 'Trần Văn B', customerPhone: '0907654321', status: 'SHIPPING', paymentStatus: 'PAID' },
];

test('order manager filters by query, progress and payment', () => {
  assert.deepEqual(filterAdminOrders(orders, { query: 'dh002', status: 'SHIPPING', payment: 'PAID' }), [orders[1]]);
  assert.deepEqual(filterAdminOrders(orders, { query: '090123', status: 'ALL', payment: 'UNPAID' }), [orders[0]]);
  assert.deepEqual(filterAdminOrders(orders, { query: '', status: 'PENDING', payment: 'PAID' }), []);
});

test('order manager accepts only known status in URL', () => {
  assert.equal(initialOrderQuery({ search: ' DH001 ' }), 'DH001');
  assert.equal(initialOrderStatus({ status: 'SHIPPING' }), 'SHIPPING');
  assert.equal(initialOrderStatus({ status: 'INVALID' }), 'ALL');
});
