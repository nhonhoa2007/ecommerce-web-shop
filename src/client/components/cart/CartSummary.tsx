import Link from 'next/link';
import { formatVND } from '@shared/utils';

export function CartSummary({ subtotal, itemCount }: { subtotal: number; itemCount: number }) {
  return (
    <aside className="h-fit rounded-[24px] bg-ink-black p-6 text-white lg:sticky lg:top-24">
      <h2 className="text-lg font-semibold">Tóm tắt giỏ hàng</h2>
      <div className="mt-5 space-y-3 border-b border-white/15 pb-5 text-sm">
        <div className="flex justify-between gap-4 text-white/70">
          <span>Sản phẩm</span>
          <span>{itemCount}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Tạm tính</span>
          <span className="font-semibold">{formatVND(subtotal)}</span>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-white/60">
        Giá và tồn kho sẽ được máy chủ kiểm tra lại khi tạo đơn hàng.
      </p>
      <Link href="/" className="mt-5 block rounded-full bg-white px-4 py-3 text-center text-sm font-medium text-ink-black">
        Tiếp tục mua sắm
      </Link>
    </aside>
  );
}
