import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canManageOrderStatus,
  canTransitionOrderStatus,
  OrderStatusError,
  updateOrderStatus,
} from '@server/modules/orders/order-status.service';

test('allows only the configured forward and cancellation transitions', () => {
  assert.equal(canTransitionOrderStatus('PENDING', 'CONFIRMED'), true);
  assert.equal(canTransitionOrderStatus('CONFIRMED', 'PROCESSING'), true);
  assert.equal(canTransitionOrderStatus('PROCESSING', 'SHIPPING'), true);
  assert.equal(canTransitionOrderStatus('SHIPPING', 'COMPLETED'), true);
  assert.equal(canTransitionOrderStatus('PENDING', 'CANCELLED'), true);
  assert.equal(canTransitionOrderStatus('COMPLETED', 'PENDING'), false);
  assert.equal(canTransitionOrderStatus('CANCELLED', 'CONFIRMED'), false);
  assert.equal(canTransitionOrderStatus('PROCESSING', 'PENDING'), false);
});

test('treats a repeated status as idempotent and restricts management roles', () => {
  assert.equal(canTransitionOrderStatus('CONFIRMED', 'CONFIRMED'), true);
  assert.equal(canManageOrderStatus('ADMIN'), true);
  assert.equal(canManageOrderStatus('STAFF'), false);
  assert.equal(canManageOrderStatus('STAFF', ['orders']), true);
  assert.equal(canManageOrderStatus('CUSTOMER'), false);
  assert.equal(canManageOrderStatus(undefined), false);
});

test('concurrent cancellation claims the transition once and releases stock once', async () => {
  let currentStatus = 'PENDING';
  let initialReads = 0;
  let releaseInitialReads = () => undefined;
  const initialReadGate = new Promise<void>((resolve) => {
    releaseInitialReads = resolve;
  });
  let releaseCalls = 0;

  const tx = {
    order: {
      findUnique: async () => {
        if (initialReads < 2) {
          initialReads += 1;
          if (initialReads === 2) releaseInitialReads();
          await initialReadGate;
          return {
            id: 'order-1',
            orderCode: 'DH001',
            status: 'PENDING',
            updatedAt: new Date(),
            items: [{ productId: 'p1', variantId: null, quantity: 2 }],
          };
        }
        return {
          id: 'order-1',
          orderCode: 'DH001',
          status: currentStatus,
          updatedAt: new Date(),
          items: [{ productId: 'p1', variantId: null, quantity: 2 }],
        };
      },
      updateMany: async (args: { where: { status: string }; data: { status: string } }) => {
        if (currentStatus !== args.where.status) return { count: 0 };
        currentStatus = args.data.status;
        return { count: 1 };
      },
      update: async (args: { data: { status: string } }) => {
        currentStatus = args.data.status;
        return { id: 'order-1', orderCode: 'DH001', status: currentStatus };
      },
    },
    product: {
      update: async () => {
        releaseCalls += 1;
        return { id: 'p1' };
      },
    },
    productVariant: { update: async () => ({ id: 'v1' }) },
  };

  await Promise.all([
    updateOrderStatus(tx, 'order-1', 'CANCELLED'),
    updateOrderStatus(tx, 'order-1', 'CANCELLED'),
  ]);
  assert.equal(releaseCalls, 1);
  assert.equal(currentStatus, 'CANCELLED');
});

test('cancelling an order releases its inventory before updating status', async () => {
  const released: unknown[] = [];
  const updates: unknown[] = [];
  const tx = {
    order: {
      findUnique: async () => ({
        id: 'order-1',
        orderCode: 'DH001',
        status: 'PENDING',
        updatedAt: new Date('2026-10-29T00:00:00Z'),
        items: [{ productId: 'p1', variantId: null, quantity: 2 }],
      }),
      update: async (args: unknown) => {
        updates.push(args);
        return { id: 'order-1', orderCode: 'DH001', status: 'CANCELLED' };
      },
      updateMany: async (args: unknown) => {
        updates.push(args);
        return { count: 1 };
      },
    },
    product: {
      update: async (args: unknown) => {
        released.push(args);
        return { id: 'p1' };
      },
    },
    productVariant: { update: async () => ({ id: 'v1' }) },
  };

  const result = await updateOrderStatus(tx, 'order-1', 'CANCELLED');
  assert.equal(result.status, 'CANCELLED');
  assert.deepEqual(released, [
    { where: { id: 'p1' }, data: { stock: { increment: 2 } } },
  ]);
  assert.equal(updates.length, 1);
});

test('rejects transitions from a terminal state without changing inventory', async () => {
  const tx = {
    order: {
      findUnique: async () => ({
        id: 'order-1',
        orderCode: 'DH001',
        status: 'COMPLETED',
        updatedAt: new Date(),
        items: [],
      }),
      update: async () => ({ id: 'order-1', status: 'PENDING' }),
      updateMany: async () => ({ count: 1 }),
    },
    product: { update: async () => ({ id: 'p1' }) },
    productVariant: { update: async () => ({ id: 'v1' }) },
  };

  await assert.rejects(updateOrderStatus(tx, 'order-1', 'PENDING'), OrderStatusError);
});
