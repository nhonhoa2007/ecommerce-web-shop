import { redirect } from 'next/navigation';
import { prisma } from '@server/database/prisma';
import { requireOperatorPermission } from '@server/modules/admin/guards';
import { AdminReturnsView } from '@client/views/admin/AdminReturnsView';

export const dynamic = 'force-dynamic';

export default async function AdminReturnsPage() {
  const access = await requireOperatorPermission('warranties');
  if (!access.authorized) redirect(access.response.status === 401 ? '/login?callbackUrl=/admin/returns' : '/');
  const returns = await prisma.returnRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { order: { select: { orderCode: true, status: true } } },
    take: 50,
  });
  return <AdminReturnsView initialReturns={JSON.parse(JSON.stringify(returns))} />;
}
