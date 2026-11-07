import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('order report is permission guarded and exposes confirmation action', async () => {
  const page = await readFile(new URL('../src/app/admin/orders/page.tsx', import.meta.url), 'utf8');
  const view = await readFile(new URL('../src/client/views/admin/Week4OrdersReport.tsx', import.meta.url), 'utf8');
  assert.match(page, /requireOperatorPermission\('orders'\)/);
  assert.match(view, /confirm-payment/);
});
