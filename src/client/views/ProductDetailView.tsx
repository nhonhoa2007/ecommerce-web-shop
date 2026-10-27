'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, PackageOpen, Star } from 'lucide-react';
import type { Product } from '@shared/types';
import { formatVND } from '@shared/utils';
import { isSupportedProductImageSource } from '@shared/utils/storefront';
import { useCartStore } from '@client/stores/cart-store';

export function ProductDetailView({ product }: { product: Product }) {
  const imageSource = isSupportedProductImageSource(product.image) ? product.image : null;
  const activeVariants = product.variants?.filter((variant) => variant.isActive) ?? [];
  const [selectedVariantId, setSelectedVariantId] = useState(activeVariants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const selectedVariant = activeVariants.find((variant) => variant.id === selectedVariantId) ?? null;
  const displayPrice = selectedVariant?.price ?? product.effectivePrice ?? product.price;
  const availableStock = selectedVariant?.stock ?? product.stock;
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: Number(displayPrice),
        image: product.image ?? undefined,
        stock: availableStock,
        variantId: selectedVariant?.id ?? null,
        variantTitle: selectedVariant?.title ?? null,
      },
      quantity,
    );
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-gray transition hover:text-ink-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại cửa hàng
      </Link>

      <article className="grid gap-8 overflow-hidden rounded-[32px] bg-white p-4 shadow-card md:grid-cols-2 md:p-8">
        <div className="relative aspect-square overflow-hidden rounded-[24px] bg-canvas-mist">
          {imageSource ? (
            <Image
              src={imageSource}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-gray">
              <PackageOpen className="h-12 w-12" />
              <span>Chưa có ảnh sản phẩm</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-gray">
            {product.category && (
              <span className="rounded-full bg-canvas-mist px-3 py-1">{product.category}</span>
            )}
            {product.avgRating && product.avgRating > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-ink-black text-ink-black" />
                {product.avgRating} ({product.reviewCount ?? 0})
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight-display text-ink-black sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-semibold text-ink-black">{formatVND(displayPrice)}</p>
          <p className="mt-5 leading-7 text-muted-gray">
            {product.description || 'Sản phẩm hiện chưa có mô tả chi tiết.'}
          </p>

          {activeVariants.length > 0 && (
            <section className="mt-7" aria-labelledby="variant-heading">
              <h2 id="variant-heading" className="text-sm font-semibold text-ink-black">
                Phân loại sản phẩm
              </h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {activeVariants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      setQuantity(1);
                    }}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      selectedVariantId === variant.id
                        ? 'border-ink-black bg-canvas-mist'
                        : 'border-faint-border hover:border-ink-black/40'
                    }`}
                  >
                    <p className="font-medium text-ink-black">{variant.title}</p>
                    <p className="mt-1 text-sm text-muted-gray">
                      {formatVND(variant.price)} · Còn {variant.stock}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="mt-7 flex items-center gap-2 text-sm font-medium">
            <Check className="h-4 w-4" />
            {availableStock > 0 ? `Còn ${availableStock} sản phẩm` : 'Sản phẩm đã hết hàng'}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <label className="flex items-center gap-2 rounded-full border border-faint-border px-4 py-2">
              <span className="text-sm text-muted-gray">Số lượng</span>
              <input
                type="number"
                min={1}
                max={Math.max(availableStock, 1)}
                value={quantity}
                onChange={(event) =>
                  setQuantity(Math.min(Math.max(1, Math.floor(Number(event.target.value) || 1)), Math.max(availableStock, 1)))
                }
                className="w-14 bg-transparent text-center font-medium outline-none"
              />
            </label>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={availableStock <= 0}
              className="rounded-full bg-ink-black px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </article>
    </main>
  );
}
