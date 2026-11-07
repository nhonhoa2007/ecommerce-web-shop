import { redirect } from 'next/navigation';
import { requireAdmin } from '@server/modules/admin/guards';
import { AdminCouponsView } from '@client/views/admin/AdminCouponsView';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const access = await requireAdmin();
  if (!access.authorized) redirect(access.response.status === 401 ? '/login?callbackUrl=/admin/coupons' : '/');
  return <AdminCouponsView />;
}
