import { NextResponse } from 'next/server';
import { prisma } from '@server/database/prisma';
import { requireOperatorPermission } from './guards';
import type { ShipmentStatus } from '@shared/types';
import type { AdminShipmentLog } from '@client/views/admin/AdminShipmentsView';

export const dynamic = 'force-dynamic';

const STATUSES = ['READY_TO_PICK', 'PICKING', 'DELIVERING', 'DELIVERED', 'RETURNED', 'CANCELLED'] as const;

export async function loadAdminShipments({ search, status }: { search?: string; status?: ShipmentStatus } = {}) {
  const shipments = await prisma.shipment.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search ? { OR: [
        { trackingCode: { contains: search, mode: 'insensitive' as const } },
        { order: { orderCode: { contains: search, mode: 'insensitive' as const } } },
        { order: { customerName: { contains: search, mode: 'insensitive' as const } } },
      ] } : {}),
    },
    include: { order: { select: {
      id: true, orderCode: true, customerName: true, customerPhone: true, customerAddress: true,
      totalAmount: true, status: true, paymentStatus: true,
    } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return shipments.map((shipment) => ({
    id: shipment.id,
    orderId: shipment.orderId,
    carrier: shipment.carrier,
    trackingCode: shipment.trackingCode,
    shippingFee: Number(shipment.shippingFee),
    codAmount: Number(shipment.codAmount),
    status: shipment.status,
    estimatedArrival: shipment.estimatedArrival?.toISOString() ?? null,
    shippingLogs: (shipment.shippingLogs as unknown as AdminShipmentLog[] | null) ?? null,
    createdAt: shipment.createdAt.toISOString(),
    order: { ...shipment.order, totalAmount: Number(shipment.order.totalAmount) },
  }));
}

export async function GET(request: Request) {
  const access = await requireOperatorPermission('shipments');
  if (!access.authorized) return access.response;
  const params = new URL(request.url).searchParams;
  const status = params.get('status');
  if (status && !STATUSES.includes(status as ShipmentStatus)) {
    return NextResponse.json({ error: 'Trạng thái vận đơn không hợp lệ' }, { status: 400 });
  }
  try {
    const shipments = await loadAdminShipments({ search: params.get('search')?.trim(), status: status as ShipmentStatus | undefined });
    return NextResponse.json({ success: true, shipments });
  } catch (error) {
    console.error('Get shipments error:', error);
    return NextResponse.json({ error: 'Lỗi lấy danh sách vận đơn' }, { status: 500 });
  }
}
