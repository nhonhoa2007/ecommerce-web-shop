import Image from 'next/image';
import { Star } from 'lucide-react';
import { formatVND } from '@shared/utils';
import { isSupportedProductImageSource } from '@shared/utils/storefront';
import type { Product } from '@shared/types';

export function ProductCard({ product }: { product: Product }) {
  const activeVariants = product.variants?.filter((variant) => variant.isActive) ?? [];
  const displayPrice = product.effectivePrice ?? product.price;
  const imageSource = isSupportedProductImageSource(product.image) ? product.image : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[28px] bg-white p-2.5 shadow-card transition hover:shadow-card-hover">
      <div className="relative aspect-square overflow-hidden rounded-[20px] bg-canvas-mist">
        {imageSource ? (
          <Image
            src={imageSource}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-gray">Chưa có ảnh</div>
        )}

        {product.category && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink-black shadow-soft-sm backdrop-blur-sm">
            {product.category}
          </span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-black/80 px-3 py-1.5 text-xs font-medium text-white">Hết hàng</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 px-1.5 pb-1 pt-3">
        <div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink-black">{product.name}</h3>
          <div className="mt-1 flex h-4 items-center gap-1 text-[11px] text-muted-gray">
            {product.avgRating && product.avgRating > 0 ? (
              <>
                <Star className="h-3 w-3 fill-ink-black text-ink-black" />
                <span className="font-medium text-ink-black">{product.avgRating}</span>
                <span>({product.reviewCount ?? 0})</span>
              </>
            ) : (
              <span>Chưa có đánh giá</span>
            )}
          </div>
          {activeVariants.length > 0 && (
            <p className="mt-1 text-[11px] text-muted-gray">{activeVariants.length} phân loại</p>
          )}
        </div>
        <div className="border-t border-faint-border/60 pt-2">
          <p className="text-base font-semibold tracking-tight-display text-ink-black">{formatVND(displayPrice)}</p>
          <p className="mt-0.5 text-[11px] text-muted-gray">Còn {product.stock} sản phẩm</p>
        </div>
      </div>
    </article>
  );
}
