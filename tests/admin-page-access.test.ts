import assert from 'node:assert/strict';
import test from 'node:test';
import { canAccessAdminPage, getVisibleAdminSections } from '@shared/admin-page-access';

test('Admin sees existing sections and Staff needs orders permission', () => {
  assert.equal(canAccessAdminPage({ role: 'ADMIN' }, '/admin'), true);
  assert.equal(canAccessAdminPage({ role: 'STAFF', permissions: ['orders'] }, '/admin/orders'), true);
  assert.equal(canAccessAdminPage({ role: 'STAFF', permissions: ['products'] }, '/admin/orders'), false);
  assert.equal(canAccessAdminPage({ role: 'CUSTOMER' }, '/admin'), false);
  assert.deepEqual(getVisibleAdminSections({ role: 'ADMIN' }).map((item) => item.href), ['/admin', '/admin/orders', '/admin/products', '/admin/customers', '/admin/reviews', '/admin/shipments', '/admin/transactions', '/admin/coupons', '/admin/chat', '/admin/warranties', '/admin/returns', '/admin/audit-logs']);
});

test('Products section is visible only to authorized operators', () => {
  assert.equal(canAccessAdminPage({ role: 'ADMIN' }, '/admin/products'), true);
  assert.equal(canAccessAdminPage({ role: 'STAFF', permissions: ['products'] }, '/admin/products'), true);
  assert.equal(canAccessAdminPage({ role: 'STAFF', permissions: ['orders'] }, '/admin/products'), false);
  assert.equal(canAccessAdminPage({ role: 'CUSTOMER' }, '/admin/products'), false);
  assert.equal(getVisibleAdminSections({ role: 'ADMIN' }).some((item) => item.href === '/admin/products'), true);
});

test('Customers and Staff permissions are Admin only', () => {
  assert.equal(canAccessAdminPage({ role: 'ADMIN' }, '/admin/customers'), true);
  assert.equal(canAccessAdminPage({ role: 'STAFF', permissions: ['orders', 'products'] }, '/admin/customers'), false);
  assert.equal(canAccessAdminPage({ role: 'CUSTOMER' }, '/admin/customers'), false);
});

test('Reviews section requires reviews permission for Staff', () => {
  assert.equal(canAccessAdminPage({ role: 'ADMIN' }, '/admin/reviews'), true);
  assert.equal(canAccessAdminPage({ role: 'STAFF', permissions: ['reviews'] }, '/admin/reviews'), true);
  assert.equal(canAccessAdminPage({ role: 'STAFF', permissions: ['orders'] }, '/admin/reviews'), false);
});

test('After-sales pages require warranties permission and audit is Admin only', () => {
  const staff = { role: 'STAFF', permissions: ['warranties'] };
  assert.equal(canAccessAdminPage(staff, '/admin/warranties'), true);
  assert.equal(canAccessAdminPage(staff, '/admin/returns'), true);
  assert.equal(canAccessAdminPage(staff, '/admin/audit-logs'), false);
  assert.equal(canAccessAdminPage({ role: 'ADMIN' }, '/admin/audit-logs'), true);
});

test('Shipments require shipments permission for Staff', () => {
  assert.equal(canAccessAdminPage({ role: 'ADMIN' }, '/admin/shipments'), true);
  assert.equal(canAccessAdminPage({ role: 'STAFF', permissions: ['shipments'] }, '/admin/shipments'), true);
  assert.equal(canAccessAdminPage({ role: 'STAFF', permissions: ['orders'] }, '/admin/shipments'), false);
});

test('Transactions are Admin only', () => {
  assert.equal(canAccessAdminPage({ role: 'ADMIN' }, '/admin/transactions'), true);
  assert.equal(canAccessAdminPage({ role: 'STAFF', permissions: ['orders'] }, '/admin/transactions'), false);
});

test('Coupons are Admin only', () => {
  assert.equal(canAccessAdminPage({ role: 'ADMIN' }, '/admin/coupons'), true);
  assert.equal(canAccessAdminPage({ role: 'STAFF', permissions: ['products'] }, '/admin/coupons'), false);
});

test('Chat and room detail require chat permission for Staff', () => {
  const staff = { role: 'STAFF', permissions: ['chat'] };
  assert.equal(canAccessAdminPage(staff, '/admin/chat'), true);
  assert.equal(canAccessAdminPage(staff, '/admin/chat/room-1'), true);
  assert.equal(canAccessAdminPage({ role: 'STAFF', permissions: ['orders'] }, '/admin/chat/room-1'), false);
});
