import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCartQuantity } from '@shared/utils/cart';

test('normalizes cart quantities to an integer within available stock', () => {
  assert.equal(normalizeCartQuantity(2.9, 5), 2);
  assert.equal(normalizeCartQuantity(99, 5), 5);
  assert.equal(normalizeCartQuantity(-3, 5), 1);
  assert.equal(normalizeCartQuantity(Number.NaN, 5), 1);
});

test('returns zero when no stock is available', () => {
  assert.equal(normalizeCartQuantity(1, 0), 0);
  assert.equal(normalizeCartQuantity(1, -5), 0);
});
