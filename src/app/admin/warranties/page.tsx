import { redirect } from 'next/navigation';
import { prisma } from '@server/database/prisma';
import { requireOperatorPermission } from '@server/modules/admin/guards';
import { AdminWarrantiesView } from '@client/views/admin/AdminWarrantiesView';

export const dynamic = 'force-dynamic';

export default async function AdminWarrantiesPage() {
  const access = await requireOperatorPermission('warranties');
  if (!access.authorized) redirect(access.response.status === 401 ? '/login?callbackUrl=/admin/warranties' : '/');
  const claims = await prisma.warrantyClaim.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      order: { select: { orderCode: true, status: true } },
      orderItem: { select: { productName: true, quantity: true } },
    },
    take: 50,
  });
  return <AdminWarrantiesView initialClaims={JSON.parse(JSON.stringify(claims))} />;
}
