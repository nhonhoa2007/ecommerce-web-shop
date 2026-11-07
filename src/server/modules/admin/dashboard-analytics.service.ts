import { prisma } from '@server/database/prisma';
import { getCachedAnalytics, setCachedAnalytics } from '@server/infrastructure/redis';
import {
  type AdminAnalyticsResponse,
  type AnalyticsRange,
  calculateRevenueGrowth,
  calculateQrMatchRate,
  calculatePaymentMethodDistribution,
  buildUrgentActions,
  formatItemsSummary,
  buildRevenueComparison,
  getPreviousRevenueStart,
  buildNewCustomersTrend,
} from './admin-analytics.service';

export async function loadAdminAnalytics(range: AnalyticsRange = '7days'): Promise<AdminAnalyticsResponse> {
    const cacheKey = `web-shop-admin-${range}`;
    const cached = await getCachedAnalytics<AdminAnalyticsResponse>(cacheKey);
    if (cached) return cached;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const thirtyDaysAgo = new Date(startOfToday);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const trendStartDate = range === 'today' ? startOfToday : range === 'month' ? thirtyDaysAgo : sevenDaysAgo;
    const previousTrendStartDate = getPreviousRevenueStart(trendStartDate, range);
    // Đầu tháng cách đây 11 tháng (để trend khách hàng mới đủ 12 bucket tháng)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0);

    const [
      paidOrdersAgg,
      totalOrders,
      ordersByStatusRaw,
      lowStockCount,
      criticalStockCount,
      totalCustomers,
      todayPaidAgg,
      yesterdayPaidAgg,
      todayOrders,
      periodOrdersCount,
      pendingOrdersCount,
      processingOrdersCount,
      activeShipmentsCount,
      deliveredShipmentsCount,
      totalShipmentsCount,
      totalTransactions,
      matchedTransactions,
      unmatchedTransactionsCount,
      paidOrdersForDistribution,
      recentPaidOrders,
      topOrderItems,
      rawRecentOrders,
      recentCustomers,
    ] = await Promise.all([
      // 1. Overall paid orders & revenue
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      // 2. Total orders
      prisma.order.count(),
      // 3. Orders by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // 4. Low stock products (stock <= 5)
      prisma.product.count({
        where: { isActive: true, stock: { lte: 5 } },
      }),
      // 5. Critical low stock (stock <= 3) for urgent action
      prisma.product.count({
        where: { isActive: true, stock: { lte: 3 } },
      }),
      // 6. Total customers
      prisma.user.count({
        where: { role: 'CUSTOMER' },
      }),
      // 7. Today paid revenue
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfToday },
        },
        _sum: { totalAmount: true },
      }),
      // 8. Yesterday paid revenue
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: startOfYesterday,
            lt: startOfToday,
          },
        },
        _sum: { totalAmount: true },
      }),
      // 9. Today orders
      prisma.order.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      prisma.order.count({
        where: { createdAt: { gte: trendStartDate } },
      }),
      // 10. Pending orders
      prisma.order.count({
        where: { status: 'PENDING' },
      }),
      // 11. Processing orders
      prisma.order.count({
        where: { status: 'PROCESSING' },
      }),
      // 12. Active shipments (DELIVERING)
      prisma.shipment.count({
        where: { status: 'DELIVERING' },
      }),
      // 13. Delivered shipments
      prisma.shipment.count({
        where: { status: 'DELIVERED' },
      }),
      // 14. Total shipments
      prisma.shipment.count(),
      // 15. Total transactions (from BankTransfer)
      prisma.bankTransfer.count(),
      prisma.bankTransfer.count({ where: { status: { in: ['APPLIED_ORDER', 'APPLIED_TOPUP'] } } }),
      // 16. Unmatched transactions (PENDING_REVIEW)
      prisma.bankTransfer.count({ where: { status: 'PENDING_REVIEW' } }),
      // 17. Paid orders for payment distribution (giới hạn 500 đơn gần nhất thay vì load toàn bộ DB)
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: {
          bankTransfers: { select: { bankName: true }, take: 1 },
          shipment: { select: { codAmount: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      // 18. Paid orders for revenue trend in range
      prisma.order.findMany({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: previousTrendStartDate },
        },
        select: {
          totalAmount: true,
          createdAt: true,
        },
      }),
      // 19. Top selling products
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: { paymentStatus: 'PAID' },
        },
        _sum: { quantity: true },
        orderBy: {
          _sum: { quantity: 'desc' },
        },
        take: 5,
      }),
      // 20. Recent orders for the compact dashboard table
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          orderCode: true,
          customerName: true,
          customerPhone: true,
          totalAmount: true,
          paymentStatus: true,
          status: true,
          createdAt: true,
          items: {
            select: { quantity: true, product: { select: { name: true } } },
          },
        },
      }),
      // 21. Customers registered trong 12 tháng gần nhất (cho trend khách hàng mới)
      prisma.user.findMany({
        where: { role: 'CUSTOMER', createdAt: { gte: twelveMonthsAgo } },
        select: { createdAt: true },
      }),
    ]);

    const totalRevenue = Number(paidOrdersAgg._sum.totalAmount || 0n);
    const totalPaidOrders = paidOrdersAgg._count.id || 0;
    const todayRevenue = Number(todayPaidAgg._sum.totalAmount || 0n);
    const yesterdayRevenue = Number(yesterdayPaidAgg._sum.totalAmount || 0n);
    const todayRevenueGrowth = calculateRevenueGrowth(todayRevenue, yesterdayRevenue);

    const qrMatchRate = calculateQrMatchRate(matchedTransactions, totalTransactions);

    const ordersByStatus: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const item of ordersByStatusRaw) {
      ordersByStatus[item.status] = item._count.id;
    }

    const recentPaidOrdersMapped = recentPaidOrders.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
    }));

    const { current: revenueTrend, previous: previousRevenueTrend } = buildRevenueComparison(range, trendStartDate, recentPaidOrdersMapped);
    const periodRevenue = revenueTrend.reduce((sum, point) => sum + point.revenue, 0);
    const paidOrdersForDistributionMapped = paidOrdersForDistribution.map((o) => ({
      bankTransfers: o.bankTransfers,
      shipment: o.shipment ? { codAmount: Number(o.shipment.codAmount) } : null,
    }));
    const paymentMethodDistribution = calculatePaymentMethodDistribution(paidOrdersForDistributionMapped);
    const urgentActions = buildUrgentActions({
      unmatchedTransactionsCount,
      criticalStockCount,
      pendingOrdersCount,
    });

    const recentOrders = rawRecentOrders.map((order) => ({
      id: order.id,
      orderCode: order.orderCode,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      itemsSummary: formatItemsSummary(order.items),
      totalAmount: Number(order.totalAmount),
      paymentStatus: order.paymentStatus,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    }));

    const topProductIds = topOrderItems.map((item) => item.productId);
    const topProductsInfo = topProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, name: true, price: true, image: true, category: true },
        })
      : [];
    const productInfoMap = new Map(topProductsInfo.map((p) => [p.id, p]));

    const topProducts = topOrderItems.map((item) => {
      const info = productInfoMap.get(item.productId);
      return {
        productId: item.productId,
        name: info?.name || 'Sản phẩm',
        price: Number(info?.price || 0),
        image: info?.image || null,
        category: info?.category || null,
        totalSold: item._sum.quantity || 0,
      };
    });

    const analyticsResponse: AdminAnalyticsResponse = {
      summary: {
        totalRevenue,
        todayRevenue,
        todayRevenueGrowth,
        totalOrders,
        todayOrders,
        periodOrdersCount,
        pendingOrdersCount,
        processingOrdersCount,
        lowStockCount,
        totalCustomers,
        qrMatchRate,
        unmatchedTransactionsCount,
        activeShipmentsCount,
        deliveredShipmentsCount,
        totalShipmentsCount,
        totalTransactions,
        matchedTransactionsCount: matchedTransactions,
        totalPaidOrders,
        periodRevenue,
      },
      ordersByStatus,
      revenueTrend,
      previousRevenueTrend,
      newCustomersTrend: buildNewCustomersTrend(now, recentCustomers),
      paymentMethodDistribution,
      paymentDistributionSampleCount: paidOrdersForDistribution.length,
      urgentActions,
      recentOrders,
      topProducts,
      range,
    };

    await setCachedAnalytics(cacheKey, analyticsResponse, 60);
    return analyticsResponse;
  }
