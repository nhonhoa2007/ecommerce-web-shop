import { redirect } from 'next/navigation';
import { requireOperatorPermission } from '@server/modules/admin/guards';
import { loadAdminShipments } from '@server/modules/admin/shipments.controller';
import { AdminShipmentsView } from '@client/views/admin/AdminShipmentsView';

export const dynamic = 'force-dynamic';

export default async function AdminShipmentsPage() {
  const access = await requireOperatorPermission('shipments');
  if (!access.authorized) redirect(access.response.status === 401 ? '/login?callbackUrl=/admin/shipments' : '/');
  const shipments = await loadAdminShipments();
  return <AdminShipmentsView initialShipments={shipments} canViewOrders={access.user.role === 'ADMIN' || Boolean(access.user.permissions?.includes('orders'))} />;
}
