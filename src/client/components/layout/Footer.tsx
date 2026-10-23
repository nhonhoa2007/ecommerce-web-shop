import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto bg-ink-black text-white">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-3 flex items-center gap-1">
            <span className="text-xl font-semibold tracking-tight-display">shop</span>
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-shop-violet" />
          </div>
          <p className="max-w-md text-sm leading-relaxed text-warm-fog">
            Website thương mại điện tử hỗ trợ tìm kiếm, lọc sản phẩm và quản lý danh mục trực tuyến.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">Khám phá</h2>
          <ul className="space-y-2 text-sm text-warm-fog">
            <li><Link href="/" className="transition hover:text-white">Tất cả sản phẩm</Link></li>
            <li><Link href="/login" className="transition hover:text-white">Đăng nhập</Link></li>
            <li><Link href="/register" className="transition hover:text-white">Đăng ký</Link></li>
          </ul>
        </div>
        <p className="border-t border-white/10 pt-5 text-xs text-warm-fog md:col-span-3">
          © 2026 Hệ thống Website Thương mại điện tử · Đồ án cơ sở 2
        </p>
      </div>
    </footer>
  );
}
