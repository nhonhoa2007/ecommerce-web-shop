import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pagePath = new URL('../src/app/products/[id]/page.tsx', import.meta.url);
const cardPath = new URL('../src/client/components/product/ProductCard.tsx', import.meta.url);

test('dynamic product page loads the catalog product and renders its view', async () => {
  const source = await readFile(pagePath, 'utf8');

  assert.match(source, /CatalogService\.getProductDetail\(id\)/);
  assert.match(source, /if \(!product\)\s*\{\s*notFound\(\)/);
  assert.match(source, /<ProductDetailView product=\{product\}/);
});

test('product cards link to the dynamic detail route', async () => {
  const source = await readFile(cardPath, 'utf8');

  assert.match(source, /href=\{`\/products\/\$\{product\.id\}`\}/);
});
