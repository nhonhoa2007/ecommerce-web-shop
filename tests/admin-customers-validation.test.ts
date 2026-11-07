import assert from 'node:assert/strict';
import test from 'node:test';
import { validateUserUpdatePayload } from '@server/modules/admin/admin-rbac.service';

test('rejects malformed role and permission updates', () => {
  for (const payload of [
    { userId: 'u1', role: 'OWNER' },
    { userId: 'u1', permissions: ['products', 'invalid'] },
    { userId: 'u1', permissions: 'products' },
    { userId: 'u1', isBlocked: 'true' },
    { userId: 'u1', isVerified: 1 },
  ]) {
    assert.equal(validateUserUpdatePayload(payload).valid, false);
  }
});

test('accepts only explicit valid changes', () => {
  const result = validateUserUpdatePayload({ userId: 'u1', role: 'STAFF', permissions: ['products', 'reviews'], isBlocked: false });
  assert.equal(result.valid, true);
  assert.deepEqual(result.data?.permissions, ['products', 'reviews']);
  assert.equal(result.data?.isBlocked, false);
});
