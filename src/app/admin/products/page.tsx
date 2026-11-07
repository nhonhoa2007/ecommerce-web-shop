import { redirect } from 'next/navigation';
import { prisma } from '@server/database/prisma';
import { requireOperatorPermission } from '@server/modules/admin/guards';
import { serializeProductDto } from '@server/modules/money/money-serialization';
import { AdminProductsView } from '@client/views/admin/AdminProductsView';
import type { Product } from '@shared/types';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ search?: string | string[] }> }) {
  const access = await requireOperatorPermission('products');
  if (!access.authorized) redirect(access.response.status === 401 ? '/login?callbackUrl=/admin/products' : '/');

  const products = await prisma.product.findMany({
    include: { variants: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
  const params = await searchParams;
  const query = typeof params.search === 'string' ? params.search : '';
  const safeProducts = products.map((product) => JSON.parse(JSON.stringify(serializeProductDto(product))) as Product);
  return <AdminProductsView initialProducts={safeProducts} initialQuery={query} canDelete={access.user.role === 'ADMIN'} />;
}
