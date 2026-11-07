import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireOperatorPermission } from '@server/modules/admin/guards';
import { loadWeek4Analytics } from '@server/modules/admin/week4-analytics.service';
import { Week4OrdersReport } from '@client/views/admin/Week4OrdersReport';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const access = await requireOperatorPermission('orders');
  if (!access.authorized) {
    if (access.response.status === 401) redirect('/login?callbackUrl=/admin/orders');
    return <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Không có quyền xem đơn hàng</h1>
      <p className="mt-3 text-muted-gray">Tài khoản này chưa được cấp quyền quản lý đơn hàng.</p>
      <Link href="/" className="mt-6 inline-block underline">Về trang chủ</Link>
    </main>;
  }
  const role = access.user.role === 'ADMIN' ? 'ADMIN' : 'STAFF';
  const data = await loadWeek4Analytics(role);
  return <Week4OrdersReport orders={data.recentOrders} role={role} />;
}
