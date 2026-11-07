'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@client/stores/cart-store';

export function OrderForm() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || items.length === 0) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.get('customerName'),
          customerPhone: form.get('customerPhone'),
          customerAddress: form.get('customerAddress'),
          items: items.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.orderId) throw new Error(result.error || 'Không thể tạo đơn hàng');
      clearCart();
      router.push(`/payment/${encodeURIComponent(result.orderId)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tạo đơn hàng');
    } finally {
      setPending(false);
    }
  }

  return <form onSubmit={submit} className="mt-5 space-y-3 rounded-3xl bg-white p-5 shadow-card">
    <h2 className="font-semibold">Thông tin nhận hàng</h2>
    <label className="block text-sm">Họ tên<input name="customerName" required maxLength={100} className="mt-1 w-full rounded-xl border p-2" /></label>
    <label className="block text-sm">Số điện thoại<input name="customerPhone" required maxLength={20} className="mt-1 w-full rounded-xl border p-2" /></label>
    <label className="block text-sm">Địa chỉ<input name="customerAddress" required maxLength={300} className="mt-1 w-full rounded-xl border p-2" /></label>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <button type="submit" disabled={pending} className="w-full rounded-full bg-shop-violet px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Đang tạo đơn...' : 'Tạo đơn và xem mã QR'}</button>
  </form>;
}
