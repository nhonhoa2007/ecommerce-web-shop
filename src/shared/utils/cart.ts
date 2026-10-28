export function normalizeCartQuantity(requested: number, stock: number) {
  const available = Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0;
  if (available === 0) return 0;
  const quantity = Number.isFinite(requested) ? Math.max(1, Math.floor(requested)) : 1;
  return Math.min(quantity, available);
}
