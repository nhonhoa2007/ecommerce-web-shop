import assert from 'node:assert/strict';
import test from 'node:test';
import {
  OrderInputError,
  loadAuthoritativeOrderItems,
  validateOrderInput,
} from '@server/modules/orders/order-input.service';

const customer = {
  customerName: ' Nguyễn Văn A ',
  customerPhone: ' 0901234567 ',
  customerAddress: ' 1 Nguyễn Huệ ',
};

test('validates and normalizes an order request', () => {
  const result = validateOrderInput({
    ...customer,
    customerEmail: ' TEST@EXAMPLE.COM ',
    items: [{ productId: 'p1', variantId: null, quantity: 2 }],
  });

  assert.equal(result.customerName, 'Nguyễn Văn A');
  assert.equal(result.customerEmail, 'test@example.com');
  assert.deepEqual(result.items, [{ productId: 'p1', variantId: null, quantity: 2 }]);
});

test('rejects malformed, duplicate, or non-positive order lines', () => {
  assert.throws(() => validateOrderInput({ ...customer, items: [] }), OrderInputError);
  assert.throws(
    () =>
      validateOrderInput({
        ...customer,
        items: [
          { productId: 'p1', quantity: 1 },
          { productId: 'p1', quantity: 2 },
        ],
      }),
    /trùng lặp/i,
  );
  assert.throws(
    () => validateOrderInput({ ...customer, items: [{ productId: 'p1', quantity: 1.5 }] }),
    /số nguyên dương/i,
  );
});

test('reloads authoritative prices and rejects missing or insufficient inventory', async () => {
  const repository = {
    product: {
      findMany: async () => [
        {
          id: 'p1',
          name: 'Chuột',
          price: BigInt(200_000),
          stock: 3,
          isActive: true,
          variants: [],
        },
      ],
    },
  };

  const loaded = await loadAuthoritativeOrderItems(repository, [
    { productId: 'p1', variantId: null, quantity: 2, price: 1 } as never,
  ]);
  assert.equal(loaded.items[0].price, BigInt(200_000));
  assert.equal(loaded.subtotal, BigInt(400_000));

  await assert.rejects(
    loadAuthoritativeOrderItems(repository, [{ productId: 'missing', variantId: null, quantity: 1 }]),
    /không còn tồn tại/i,
  );
  await assert.rejects(
    loadAuthoritativeOrderItems(repository, [{ productId: 'p1', variantId: null, quantity: 4 }]),
    /không đủ tồn kho/i,
  );
});
