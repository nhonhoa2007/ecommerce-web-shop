import { prisma } from '@server/database/prisma';

export interface AnalyticsOrder {
  id: string;
  orderCode: string;
  customerName: string;
  totalAmount: bigint;
  paymentStatus: string;
  status: string;
  createdAt: Date;
}

export function summarizeOrders(orders: AnalyticsOrder[]) {
  const ordersByStatus: Record<string, number> = {};
  const revenue = new Map<string, bigint>();
  let totalRevenue = 0n;
  for (const order of orders) {
    ordersByStatus[order.status] = (ordersByStatus[order.status] ?? 0) + 1;
    if (order.paymentStatus === 'PAID') {
      totalRevenue += order.totalAmount;
      const day = order.createdAt.toISOString().slice(0, 10);
      revenue.set(day, (revenue.get(day) ?? 0n) + order.totalAmount);
    }
  }
  return {
    totalOrders: orders.length,
    totalRevenue: totalRevenue.toString(),
    ordersByStatus,
    revenueByDay: [...revenue].sort(([a], [b]) => a.localeCompare(b)).map(([day, amount]) => ({ day, amount: amount.toString() })),
  };
}

export async function loadWeek4Analytics(role: 'ADMIN' | 'STAFF') {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const [totalOrders, statusGroups, paidOrders, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
    role === 'ADMIN' ? prisma.order.findMany({ where: { paymentStatus: 'PAID', createdAt: { gte: since } }, select: { totalAmount: true, createdAt: true } }) : Promise.resolve([]),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 20, select: {
      id: true, orderCode: true, customerName: true, status: true, paymentStatus: true, totalAmount: true, createdAt: true,
    } }),
  ]);
  const ordersByStatus = Object.fromEntries(statusGroups.map((row) => [row.status, row._count.id]));
  const recent = recentOrders.map((order) => ({
    id: order.id, orderCode: order.orderCode, customerName: order.customerName,
    status: order.status, paymentStatus: order.paymentStatus, createdAt: order.createdAt.toISOString(),
    ...(role === 'ADMIN' ? { totalAmount: order.totalAmount.toString() } : {}),
  }));
  if (role === 'STAFF') return { totalOrders, ordersByStatus, recentOrders: recent };
  const revenueByDay = new Map<string, bigint>();
  for (const order of paidOrders) {
    const day = order.createdAt.toISOString().slice(0, 10);
    revenueByDay.set(day, (revenueByDay.get(day) ?? 0n) + order.totalAmount);
  }
  return {
    totalOrders, ordersByStatus, recentOrders: recent,
    totalRevenue: paidOrders.reduce((sum, order) => sum + order.totalAmount, 0n).toString(),
    revenueByDay: [...revenueByDay].sort(([a], [b]) => a.localeCompare(b)).map(([day, amount]) => ({ day, amount: amount.toString() })),
  };
}
