import assert from 'node:assert/strict';
import test from 'node:test';
import { reserveOrderStock } from '@server/modules/inventory/inventory.service';

test('reserves base-product inventory with an atomic stock condition', async () => {
  const calls: unknown[] = [];
  const tx = {
    product: {
      updateMany: async (args: unknown) => {
        calls.push(args);
        return { count: 1 };
      },
      update: async () => ({ id: 'p1' }),
    },
    productVariant: { updateMany: async () => ({ count: 1 }) },
  };

  const failed = await reserveOrderStock(tx, [{ productId: 'p1', variantId: null, quantity: 2 }]);
  assert.equal(failed, null);
  assert.deepEqual(calls, [
    {
      where: { id: 'p1', isActive: true, stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    },
  ]);
});

test('reports the exact line that could not reserve stock', async () => {
  const tx = {
    product: {
      updateMany: async () => ({ count: 1 }),
      update: async () => ({ id: 'p1' }),
    },
    productVariant: { updateMany: async () => ({ count: 0 }) },
  };

  const failed = await reserveOrderStock(tx, [{ productId: 'p1', variantId: 'v1', quantity: 2 }]);
  assert.equal(failed, 'v1');
});
