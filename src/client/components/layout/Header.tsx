'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LogOut, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useHydrated } from '@client/hooks/useHydrated';
import { useCartStore } from '@client/stores/cart-store';
import { buildStorefrontUrl, normalizeStorefrontSort } from '@shared/utils/storefront';

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const hydrated = useHydrated();
  const cartCount = useCartStore((state) => state.getTotalItems());

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    const currentParams = new URLSearchParams(window.location.search);
    router.push(buildStorefrontUrl({
      category: currentParams.get('category'),
      search: query,
      sort: normalizeStorefrontSort(currentParams.get('sort') ?? undefined),
    }));
    setSearchQuery('');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-faint-border/60 bg-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex h-16 items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-full p-2 text-ink-black transition hover:bg-canvas-mist md:hidden"
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex items-center gap-1" aria-label="Trang chủ shop">
            <span className="text-xl font-semibold tracking-tight-display text-ink-black">shop</span>
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-shop-violet" />
          </Link>

          <Link
            href="/"
            className="hidden rounded-full px-3 py-1.5 text-sm text-muted-gray transition hover:bg-canvas-mist hover:text-ink-black md:block"
          >
            Khám phá
          </Link>

          <form onSubmit={handleSearch} className="hidden flex-1 sm:block">
            <div className="relative mx-auto max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-gray" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full rounded-full border border-ink-black/10 bg-white py-2.5 pl-11 pr-12 text-sm text-ink-black placeholder:text-muted-gray focus:border-shop-violet/50 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-shop-violet text-white transition hover:bg-shop-violet-deep"
                aria-label="Tìm kiếm"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/cart"
              className="relative rounded-full p-2.5 text-muted-gray transition hover:bg-canvas-mist hover:text-ink-black"
              aria-label={`Giỏ hàng có ${hydrated ? cartCount : 0} sản phẩm`}
            >
              <ShoppingBag className="h-4 w-4" />
              {hydrated && cartCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-shop-violet px-1 text-center text-[10px] leading-5 text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            {session ? (
              <>
                <span className="hidden items-center gap-1.5 rounded-full bg-canvas-mist px-3 py-1.5 text-sm text-ink-black sm:flex">
                  <User className="h-3.5 w-3.5 text-muted-gray" />
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-full p-2.5 text-muted-gray transition hover:bg-canvas-mist hover:text-ink-black"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden rounded-full px-3 py-2 text-sm text-muted-gray hover:bg-canvas-mist hover:text-ink-black sm:block">
                  Đăng nhập
                </Link>
                <Link href="/register" className="rounded-full bg-ink-black px-4 py-2 text-sm text-white transition hover:bg-slate-ink">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-navigation" className="space-y-3 border-t border-faint-border py-4 md:hidden">
            <form onSubmit={handleSearch} className="sm:hidden">
              <label className="relative block">
                <span className="sr-only">Tìm kiếm sản phẩm</span>
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-gray" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full rounded-full border border-ink-black/10 py-2.5 pl-11 pr-4 text-sm focus:border-shop-violet/50 focus:outline-none"
                />
              </label>
            </form>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block rounded-2xl px-3 py-2.5 text-sm text-ink-black hover:bg-canvas-mist">
              Khám phá sản phẩm
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
