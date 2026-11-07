import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireOperatorPermission } from '@server/modules/admin/guards';
import { prisma } from '@server/database/prisma';
import { AdminOrdersView } from '@client/views/admin/AdminOrdersView';
import { initialOrderQuery, initialOrderStatus } from '@client/lib/admin-order-filter';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; search?: string | string[]; status?: string | string[] }> }) {
  const access = await requireOperatorPermission('orders');
  if (!access.authorized) {
    if (access.response.status === 401) redirect('/login?callbackUrl=/admin/orders');
    return <main className="mx-auto max-w-xl px-4 py-16"><h1 className="text-2xl font-semibold">Không có quyền xem đơn hàng</h1><Link href="/" className="mt-6 inline-block underline">Về trang chủ</Link></main>;
  }
  const canViewFinancials = access.user.role === 'ADMIN';
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, select: {
    id: true, orderCode: true, customerName: true, customerPhone: true, customerEmail: true,
    customerAddress: true, totalAmount: true, status: true, paymentStatus: true, note: true, createdAt: true,
    items: { select: { id: true, quantity: true, price: true, product: { select: { name: true, image: true } } } },
  } });
  const serializedOrders = orders.map((order) => ({
    id: order.id, orderCode: order.orderCode, customerName: order.customerName, customerPhone: order.customerPhone,
    customerEmail: order.customerEmail ?? undefined, customerAddress: order.customerAddress,
    status: order.status, paymentStatus: order.paymentStatus, note: order.note ?? undefined,
    createdAt: order.createdAt.toISOString(),
    ...(canViewFinancials ? { totalAmount: order.totalAmount.toString() } : {}),
    items: order.items.map((item) => ({ id: item.id, quantity: item.quantity,
      ...(canViewFinancials ? { price: item.price.toString() } : {}),
      product: { name: item.product.name, image: item.product.image ?? undefined },
    })),
  }));
  const params = await searchParams;
  const initialQuery = initialOrderQuery(params);
  const initialStatus = initialOrderStatus(params);
  return <AdminOrdersView key={`${initialQuery}:${initialStatus}`} initialOrders={serializedOrders} initialQuery={initialQuery} initialStatus={initialStatus} canViewFinancials={canViewFinancials} />;
}
