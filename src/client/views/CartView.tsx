'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { CartItem } from '@client/components/cart/CartItem';
import { CartSummary } from '@client/components/cart/CartSummary';
import { useHydrated } from '@client/hooks/useHydrated';
import { useCartStore } from '@client/stores/cart-store';

export function CartView() {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const subtotal = useCartStore((state) => state.getTotalAmount());
  const itemCount = useCartStore((state) => state.getTotalItems());

  if (!hydrated) {
    return <main className="mx-auto min-h-screen max-w-6xl px-4 py-10" aria-busy="true" />;
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-gray" />
        <h1 className="mt-5 text-2xl font-semibold text-ink-black">Giỏ hàng đang trống</h1>
        <p className="mt-2 text-muted-gray">Hãy chọn sản phẩm phù hợp trước khi tạo đơn hàng.</p>
        <Link href="/" className="mt-6 rounded-full bg-ink-black px-6 py-3 text-sm font-medium text-white">
          Khám phá sản phẩm
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight-display text-ink-black">Giỏ hàng</h1>
      <p className="mt-2 text-sm text-muted-gray">Kiểm tra số lượng trước khi tạo đơn.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-3" aria-label="Sản phẩm trong giỏ hàng">
          {items.map((item) => (
            <CartItem
              key={`${item.productId}:${item.variantId ?? 'base'}`}
              item={item}
              onQuantityChange={(quantity) =>
                updateItemQuantity(item.productId, quantity, item.variantId)
              }
              onRemove={() => removeItem(item.productId, item.variantId)}
            />
          ))}
        </section>
        <CartSummary subtotal={subtotal} itemCount={itemCount} />
      </div>
    </main>
  );
}
