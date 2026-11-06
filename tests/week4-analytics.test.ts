import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeOrders } from '@server/modules/admin/week4-analytics.service';

test('revenue includes paid orders only and groups by day', () => {
  const data = summarizeOrders([
    { id: '1', orderCode: 'DH1', customerName: 'A', totalAmount: 100n, paymentStatus: 'PAID', status: 'CONFIRMED', createdAt: new Date('2026-11-06T01:00:00Z') },
    { id: '2', orderCode: 'DH2', customerName: 'B', totalAmount: 500n, paymentStatus: 'UNPAID', status: 'PENDING', createdAt: new Date('2026-11-06T02:00:00Z') },
  ]);
  assert.equal(data.totalRevenue, '100');
  assert.equal(data.totalOrders, 2);
  assert.equal(data.revenueByDay[0].amount, '100');
  assert.equal(data.ordersByStatus.PENDING, 1);
});
