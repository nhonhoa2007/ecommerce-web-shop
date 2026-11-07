import assert from 'node:assert/strict';
import test from 'node:test';
import { canAccessAdminPage, getVisibleAdminSections } from '@shared/admin-page-access';

test('Admin sees existing sections and Staff needs orders permission', () => {
  assert.equal(canAccessAdminPage({ role: 'ADMIN' }, '/admin'), true);
  assert.equal(canAccessAdminPage({ role: 'STAFF', permissions: ['orders'] }, '/admin/orders'), true);
  assert.equal(canAccessAdminPage({ role: 'STAFF', permissions: ['products'] }, '/admin/orders'), false);
  assert.equal(canAccessAdminPage({ role: 'CUSTOMER' }, '/admin'), false);
  assert.deepEqual(getVisibleAdminSections({ role: 'ADMIN' }).map((item) => item.href), ['/admin', '/admin/orders', '/admin/products', '/admin/customers', '/admin/reviews']);
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
