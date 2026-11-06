import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('dashboard is protected and uses role-specific analytics', async () => {
  const page = await readFile(new URL('../src/app/admin/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /requireOperatorPermission\('orders'\)/);
  assert.match(page, /loadWeek4Analytics\(role\)/);
});
