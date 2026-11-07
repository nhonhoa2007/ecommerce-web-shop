import { prisma } from '@server/database/prisma';
import { buildUrgentActions, formatItemsSummary } from './admin-analytics.service';

export async function loadStaffDashboard(permissions: readonly string[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [todayOrders, pendingOrdersCount, recentOrders, lowStockCount, activeShipmentsCount, criticalStockCount] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: {
      id: true, orderCode: true, customerName: true, customerPhone: true, status: true,
      paymentStatus: true, createdAt: true,
      items: { select: { quantity: true, product: { select: { name: true } } } },
    } }),
    permissions.includes('products') ? prisma.product.count({ where: { isActive: true, stock: { lte: 5 } } }) : Promise.resolve(0),
    permissions.includes('shipments') ? prisma.shipment.count({ where: { status: 'DELIVERING' } }) : Promise.resolve(0),
    permissions.includes('products') ? prisma.product.count({ where: { isActive: true, stock: { lte: 3 } } }) : Promise.resolve(0),
  ]);
  return {
    todayOrders, pendingOrdersCount, lowStockCount, activeShipmentsCount,
    urgentActions: buildUrgentActions({ unmatchedTransactionsCount: 0, criticalStockCount, pendingOrdersCount }),
    recentOrders: recentOrders.map((order) => ({
      id: order.id, orderCode: order.orderCode, customerName: order.customerName,
      customerPhone: order.customerPhone, itemsSummary: formatItemsSummary(order.items),
      status: order.status, paymentStatus: order.paymentStatus, createdAt: order.createdAt.toISOString(),
    })),
  };
}
