import assert from 'node:assert/strict';
import test from 'node:test';
import { useCartStore } from '@client/stores/cart-store';

const baseItem = {
  productId: 'product-1',
  name: 'Bàn phím cơ',
  price: 1_500_000,
  image: '/keyboard.png',
  stock: 5,
  variantId: null,
  variantTitle: null,
};

test.beforeEach(() => useCartStore.getState().clearCart());

test('cart accumulates the same line and clamps it to available stock', () => {
  useCartStore.getState().addItem(baseItem, 2.8);
  useCartStore.getState().addItem(baseItem, 10);

  const state = useCartStore.getState();
  assert.equal(state.items.length, 1);
  assert.equal(state.items[0].quantity, 5);
  assert.equal(state.getTotalItems(), 5);
  assert.equal(state.getTotalAmount(), 7_500_000);
});

test('cart keeps variants of one product as separate lines', () => {
  useCartStore.getState().addItem(baseItem, 1);
  useCartStore.getState().addItem(
    { ...baseItem, variantId: 'blue', variantTitle: 'Màu xanh', price: 1_600_000 },
    2,
  );

  assert.deepEqual(
    useCartStore.getState().items.map((item) => [item.variantId, item.quantity]),
    [
      [null, 1],
      ['blue', 2],
    ],
  );
});

test('cart normalizes positive quantities and removes zero quantities', () => {
  useCartStore.getState().addItem(baseItem, -4);
  assert.equal(useCartStore.getState().items[0].quantity, 1);

  useCartStore.getState().updateItemQuantity('product-1', 99.9, null);
  assert.equal(useCartStore.getState().items[0].quantity, 5);

  useCartStore.getState().updateItemQuantity('product-1', 0, null);
  assert.equal(useCartStore.getState().items.length, 0);
});

test('cart ignores items with no stock and removes only the requested variant', () => {
  useCartStore.getState().addItem({ ...baseItem, stock: 0 }, 1);
  assert.equal(useCartStore.getState().items.length, 0);

  useCartStore.getState().addItem(baseItem, 1);
  useCartStore.getState().addItem({ ...baseItem, variantId: 'blue', variantTitle: 'Màu xanh' }, 1);
  useCartStore.getState().removeItem('product-1', 'blue');

  assert.equal(useCartStore.getState().items.length, 1);
  assert.equal(useCartStore.getState().items[0].variantId, null);
});
