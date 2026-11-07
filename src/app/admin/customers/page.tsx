import { redirect } from 'next/navigation';
import { requireAdmin } from '@server/modules/admin/guards';
import { loadAdminCustomers } from '@server/modules/admin/customers.controller';
import { AdminCustomersView } from '@client/views/admin/AdminCustomersView';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const access = await requireAdmin();
  if (!access.authorized) redirect(access.response.status === 401 ? '/login?callbackUrl=/admin/customers' : '/');
  const customers = await loadAdminCustomers();
  return <AdminCustomersView initialCustomers={customers} />;
}
