'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartLine } from '@client/stores/cart-store';
import { formatVND } from '@shared/utils';
import { isSupportedProductImageSource } from '@shared/utils/storefront';

interface CartItemProps {
  item: CartLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const imageSource = isSupportedProductImageSource(item.image) ? item.image : null;

  return (
    <article className="flex gap-4 rounded-[24px] border border-faint-border bg-white p-4">
      <Link
        href={`/products/${item.productId}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-canvas-mist"
      >
        {imageSource && <Image src={imageSource} alt={item.name} fill sizes="96px" className="object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/products/${item.productId}`} className="font-semibold text-ink-black hover:underline">
              {item.name}
            </Link>
            {item.variantTitle && <p className="mt-1 text-xs text-muted-gray">{item.variantTitle}</p>}
          </div>
          <button type="button" onClick={onRemove} className="p-2 text-muted-gray hover:text-red-600" aria-label={`Xóa ${item.name}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm font-medium text-ink-black">{formatVND(item.price)}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-full border border-faint-border">
            <button type="button" onClick={() => onQuantityChange(item.quantity - 1)} className="p-2" aria-label="Giảm số lượng">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className="p-2 disabled:opacity-30"
              aria-label="Tăng số lượng"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-gray">Tối đa {item.stock}</p>
        </div>
      </div>
    </article>
  );
}
