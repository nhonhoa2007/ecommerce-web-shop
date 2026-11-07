import { redirect } from 'next/navigation';
import { prisma } from '@server/database/prisma';
import { requireAdmin } from '@server/modules/admin/guards';
import { listAdminAuditLogs } from '@server/modules/admin/audit-log.service';
import { AdminAuditLogsView } from '@client/views/admin/AdminAuditLogsView';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const access = await requireAdmin();
  if (!access.authorized) redirect(access.response.status === 401 ? '/login?callbackUrl=/admin/audit-logs' : '/');
  const { logs, total } = await listAdminAuditLogs(prisma, { limit: 50 });
  return <AdminAuditLogsView initialLogs={logs} total={total} />;
}
