'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDownWideNarrow, ArrowRight, Search } from 'lucide-react';
import { ProductGrid } from '@client/components/product/ProductGrid';
import type { Product } from '@shared/types';
import { buildStorefrontUrl, type StorefrontSort } from '@shared/utils/storefront';

export type HomeCatalogSort = StorefrontSort;

export interface HomeViewProps {
  products: Product[];
  allCategories: string[];
  currentCategory: string | null;
  searchQuery: string | null;
  total: number;
  page: number;
  pageSize: number;
  currentSort: HomeCatalogSort;
}

export function HomeView(props: HomeViewProps) {
  const router = useRouter();
  const shownCount = Math.min((props.page - 1) * props.pageSize + props.products.length, props.total);

  return (
    <div className="mx-auto max-w-[1200px] space-y-10 px-4 py-10 sm:px-6">
      <section className="rounded-[32px] bg-white px-5 py-10 text-center shadow-card sm:px-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-shop-violet">Tuần 2 · Storefront</p>
        <h1 className="text-4xl font-semibold tracking-tight-display text-ink-black sm:text-5xl">Khám phá sản phẩm</h1>
        <p className="mx-auto mb-8 mt-3 max-w-xl text-sm leading-relaxed text-muted-gray sm:text-base">
          Tìm kiếm nhanh, duyệt theo danh mục và sắp xếp sản phẩm theo nhu cầu của bạn.
        </p>
        <form action="/" method="GET" className="mx-auto max-w-xl">
          {props.currentCategory && <input type="hidden" name="category" value={props.currentCategory} />}
          {props.currentSort !== 'newest' && <input type="hidden" name="sort" value={props.currentSort} />}
          <div className="relative flex items-center rounded-full border border-ink-black/10 bg-white py-1.5 pl-5 pr-1.5 shadow-soft-sm focus-within:border-shop-violet/50">
            <Search className="mr-3 h-5 w-5 shrink-0 text-muted-gray" />
            <input name="search" type="search" defaultValue={props.searchQuery ?? ''} placeholder="Bạn đang tìm sản phẩm nào?" className="w-full bg-transparent text-sm text-ink-black placeholder:text-muted-gray focus:outline-none" />
            <button type="submit" className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-shop-violet text-white transition hover:bg-shop-violet-deep" aria-label="Tìm kiếm">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="category-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="category-heading" className="text-lg font-semibold text-ink-black">Danh mục sản phẩm</h2>
          {(props.currentCategory || props.searchQuery) && <Link href="/" className="text-sm text-shop-violet hover:underline">Xóa bộ lọc</Link>}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Link href={buildStorefrontUrl({ search: props.searchQuery, sort: props.currentSort })} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium ${!props.currentCategory ? 'bg-ink-black text-white' : 'border border-faint-border bg-white text-ink-black'}`}>Tất cả</Link>
          {props.allCategories.map((category) => (
            <Link key={category} href={buildStorefrontUrl({ category, search: props.searchQuery, sort: props.currentSort })} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium ${props.currentCategory === category ? 'bg-ink-black text-white' : 'border border-faint-border bg-white text-ink-black hover:border-ink-black/40'}`}>
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6" aria-labelledby="product-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="product-heading" className="text-2xl font-semibold tracking-tight-display text-ink-black">
              {props.currentCategory || (props.searchQuery ? `Kết quả cho “${props.searchQuery}”` : 'Sản phẩm mới nhất')}
            </h2>
            <p className="mt-1 text-xs text-muted-gray">Hiển thị {shownCount}/{props.total} sản phẩm</p>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-gray">
            <ArrowDownWideNarrow className="h-4 w-4" />
            <span>Sắp xếp</span>
            <select value={props.currentSort} onChange={(event) => router.push(buildStorefrontUrl({ category: props.currentCategory, search: props.searchQuery, sort: event.target.value as HomeCatalogSort, page: 1 }))} className="rounded-full border border-faint-border bg-white px-3 py-2 text-xs font-medium text-ink-black focus:border-shop-violet/50 focus:outline-none">
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá thấp → cao</option>
              <option value="price-desc">Giá cao → thấp</option>
            </select>
          </label>
        </div>

        <ProductGrid products={props.products} />

        {shownCount < props.total && (
          <div className="flex justify-center">
            <Link href={buildStorefrontUrl({ category: props.currentCategory, search: props.searchQuery, sort: props.currentSort, page: props.page + 1 })} className="rounded-full border border-faint-border bg-white px-6 py-3 text-sm font-medium text-ink-black shadow-soft-sm hover:border-ink-black/40">
              Xem thêm sản phẩm
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default HomeView;
