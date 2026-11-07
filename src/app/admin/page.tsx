import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireOperatorPermission } from '@server/modules/admin/guards';
import { AdminDashboardView } from '@client/views/admin/AdminDashboardView';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const access = await requireOperatorPermission('orders');
  if (!access.authorized) {
    if (access.response.status === 401) redirect('/login?callbackUrl=/admin');
    return <main className="mx-auto max-w-xl px-4 py-16"><h1 className="text-2xl font-semibold">Không có quyền xem dashboard</h1><Link href="/" className="mt-6 inline-block underline">Về trang chủ</Link></main>;
  }
  return <AdminDashboardView user={access.user} />;
}
