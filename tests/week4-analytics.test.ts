import assert from 'node:assert/strict';
import test from 'node:test';
import { buildRevenueComparison, calculatePaymentMethodDistribution } from '@server/modules/admin/admin-analytics.service';

test('revenue trend includes paid orders in the selected and previous periods', () => {
  const start = new Date(2026, 10, 6);
  const data = buildRevenueComparison('today', start, [
    { totalAmount: 100, createdAt: new Date(2026, 10, 6, 1) },
    { totalAmount: 50, createdAt: new Date(2026, 10, 5, 1) },
  ]);
  assert.equal(data.current.reduce((sum, point) => sum + point.revenue, 0), 100);
  assert.equal(data.previous.reduce((sum, point) => sum + point.revenue, 0), 50);
});

test('payment distribution separates bank, wallet and COD orders', () => {
  assert.deepEqual(calculatePaymentMethodDistribution([
    { bankTransfers: [{ bankName: 'BANK' }] },
    { bankTransfers: [{ bankName: 'SHOP_WALLET' }] },
    { bankTransfers: [], shipment: { codAmount: 100 } },
  ]), { vietqrPercentage: 33.3, walletPercentage: 33.3, codPercentage: 33.3 });
});
