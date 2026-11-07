import assert from 'node:assert/strict';
import test from 'node:test';
import { canOpenAdminDashboard } from '@shared/utils/admin-navigation';

test('admin and staff with orders permission can open dashboard', () => {
  assert.equal(canOpenAdminDashboard({ role: 'ADMIN' }), true);
  assert.equal(canOpenAdminDashboard({ role: 'STAFF', permissions: ['orders'] }), true);
  assert.equal(canOpenAdminDashboard({ role: 'STAFF', permissions: ['products'] }), false);
  assert.equal(canOpenAdminDashboard({ role: 'CUSTOMER' }), false);
});
