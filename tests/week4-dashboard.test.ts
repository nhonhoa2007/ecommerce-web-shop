import assert from 'node:assert/strict';
import test from 'node:test';
import { getDashboardAnalyticsEndpoint } from '@client/lib/dashboard-analytics';
import { buildUrgentActions, calculateQrMatchRate } from '@server/modules/admin/admin-analytics.service';

test('dashboard uses distinct Admin and Staff analytics endpoints', () => {
  assert.equal(getDashboardAnalyticsEndpoint('ADMIN', 'month'), '/api/admin/analytics?range=month');
  assert.equal(getDashboardAnalyticsEndpoint('STAFF', 'today'), '/api/admin/analytics/staff');
});

test('dashboard actions link to the relevant Admin sections', () => {
  const actions = buildUrgentActions({ unmatchedTransactionsCount: 2, criticalStockCount: 1, pendingOrdersCount: 3 });
  assert.deepEqual(actions.map((item) => item.link), ['/admin/transactions', '/admin/products', '/admin/orders']);
  assert.equal(calculateQrMatchRate(3, 4), 75);
});
