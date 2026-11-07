import assert from 'node:assert/strict';
import test from 'node:test';
import { canAccessChatRoom, staffChatRoomWhere } from '@server/modules/chat/chat-room-scope';

test('Staff chat access is limited to assigned rooms with permission', () => {
  const room = { customerId: 'customer-1', assignedStaffId: 'staff-1' };
  assert.equal(canAccessChatRoom({ id: 'staff-1', role: 'STAFF', permissions: ['chat'] }, room), true);
  assert.equal(canAccessChatRoom({ id: 'staff-2', role: 'STAFF', permissions: ['chat'] }, room), false);
  assert.equal(canAccessChatRoom({ id: 'staff-1', role: 'STAFF', permissions: [] }, room), false);
  assert.equal(canAccessChatRoom({ id: 'admin-1', role: 'ADMIN' }, room), true);
  assert.equal(canAccessChatRoom({ id: 'customer-1', role: 'CUSTOMER' }, room), true);
  assert.equal(canAccessChatRoom({ id: 'customer-2', role: 'CUSTOMER' }, room), false);
  assert.deepEqual(staffChatRoomWhere('staff-1', false), { assignedStaffId: 'staff-1' });
});
