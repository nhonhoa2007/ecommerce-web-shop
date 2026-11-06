import Link from 'next/link';
import { formatVND } from '@shared/utils';

interface DashboardData {
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalRevenue?: string;
  revenueByDay?: Array<{ day: string; amount: string }>;
  recentOrders: Array<{ id: string; orderCode: string; customerName: string; status: string; paymentStatus: string; totalAmount?: string }>;
}

export function Week4Dashboard({ role, data }: { role: 'ADMIN' | 'STAFF'; data: DashboardData }) {
  const maxRevenue = Math.max(1, ...(data.revenueByDay ?? []).map((point) => Number(point.amount)));
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <div className="flex items-center justify-between gap-4"><div><p className="text-sm text-muted-gray">{role === 'ADMIN' ? 'Quản trị' : 'Nhân viên'}</p><h1 className="text-3xl font-semibold">Tổng quan cửa hàng</h1></div><Link href="/admin/orders" className="rounded-full bg-ink-black px-5 py-3 text-sm text-white">Xem đơn hàng</Link></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article className="rounded-3xl bg-white p-6 shadow-card"><p className="text-sm text-muted-gray">Tổng đơn hàng</p><p className="mt-3 text-3xl font-semibold">{data.totalOrders}</p></article>
      <article className="rounded-3xl bg-white p-6 shadow-card"><p className="text-sm text-muted-gray">Đơn chờ xử lý</p><p className="mt-3 text-3xl font-semibold">{data.ordersByStatus.PENDING ?? 0}</p></article>
      {role === 'ADMIN' && <article className="rounded-3xl bg-white p-6 shadow-card"><p className="text-sm text-muted-gray">Doanh thu đã thanh toán (30 ngày)</p><p className="mt-3 text-3xl font-semibold">{formatVND(data.totalRevenue ?? '0')}</p></article>}
    </div>
    {role === 'ADMIN' && <section className="mt-6 rounded-3xl bg-white p-6 shadow-card"><h2 className="font-semibold">Doanh thu theo ngày</h2><div className="mt-6 flex min-h-40 items-end gap-2" aria-label="Biểu đồ doanh thu 30 ngày">{(data.revenueByDay ?? []).map((point) => <div key={point.day} className="group flex flex-1 flex-col items-center gap-2" title={`${point.day}: ${formatVND(point.amount)}`}><div className="w-full rounded-t bg-shop-violet" style={{ height: `${Math.max(4, Math.round(Number(point.amount) / maxRevenue * 120))}px` }} /><span className="text-[10px] text-muted-gray">{point.day.slice(5)}</span></div>)}</div>{!data.revenueByDay?.length && <p className="text-sm text-muted-gray">Chưa có đơn đã thanh toán trong 30 ngày.</p>}</section>}
    <section className="mt-6 rounded-3xl bg-white p-6 shadow-card"><h2 className="font-semibold">Đơn hàng gần đây</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="py-2">Mã đơn</th><th>Khách hàng</th><th>Trạng thái</th><th>Thanh toán</th></tr></thead><tbody>{data.recentOrders.slice(0, 5).map((order) => <tr key={order.id} className="border-t"><td className="py-3">{order.orderCode}</td><td>{order.customerName}</td><td>{order.status}</td><td>{order.paymentStatus}</td></tr>)}</tbody></table></div></section>
  </main>;
}
