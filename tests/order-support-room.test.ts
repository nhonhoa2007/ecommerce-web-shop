import assert from 'node:assert/strict';
import test from 'node:test';
import type { Prisma } from '@prisma/client';
import { openOrderSupportRoom } from '@server/modules/orders/order-chat.service';

test('signed-in orders get a support room linked to the order', async () => {
  const calls: unknown[] = [];
  const tx = {
    user: { findFirst: async () => ({ id: 'admin-1' }) },
    chatRoom: { create: async (args: unknown) => { calls.push(args); return { id: 'room-1' }; } },
    message: { create: async (args: unknown) => { calls.push(args); return {}; } },
  } as unknown as Prisma.TransactionClient;
  const roomId = await openOrderSupportRoom(tx, { id: 'order-1', orderCode: 'DH1' }, 'customer-1');
  assert.equal(roomId, 'room-1');
  assert.deepEqual(calls[0], { data: { orderId: 'order-1', customerId: 'customer-1', assignedStaffId: 'admin-1', lastMessage: 'Đơn hàng DH1 đã được tạo. Bạn có thể chat với shop tại đây!' }, select: { id: true } });
  assert.equal(calls.length, 2);
});

test('guest orders do not create a customer chat room', async () => {
  const roomId = await openOrderSupportRoom({} as Prisma.TransactionClient, { id: 'order-1', orderCode: 'DH1' }, null);
  assert.equal(roomId, null);
});
