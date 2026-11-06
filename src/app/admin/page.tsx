import { redirect } from 'next/navigation';
import { requireOperatorPermission } from '@server/modules/admin/guards';
import { loadWeek4Analytics } from '@server/modules/admin/week4-analytics.service';
import { Week4Dashboard } from '@client/views/admin/Week4Dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const access = await requireOperatorPermission('orders');
  if (!access.authorized) redirect('/login?callbackUrl=/admin');
  const role = access.user.role === 'ADMIN' ? 'ADMIN' : 'STAFF';
  const data = await loadWeek4Analytics(role);
  return <Week4Dashboard role={role} data={data} />;
}
