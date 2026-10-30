import { NextResponse } from 'next/server';
import { requireOperatorPermission } from '@server/modules/admin/guards';
import { prisma } from '@server/database/prisma';
import {
  OrderStatusError,
  type OrderStatusTransaction,
  updateOrderStatus,
} from '@server/modules/orders/order-status.service';
import type { OrderStatus } from '@shared/types';

const orderStatuses = new Set<OrderStatus>([
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPING',
  'COMPLETED',
  'CANCELLED',
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await requireOperatorPermission('orders');
  if (!access.authorized) return access.response;

  try {
    const body = (await request.json()) as { status?: unknown };
    if (typeof body.status !== 'string' || !orderStatuses.has(body.status as OrderStatus)) {
      return NextResponse.json({ error: 'Trạng thái đơn hàng không hợp lệ' }, { status: 400 });
    }
    const { id } = await params;
    const order = await prisma.$transaction((tx) =>
      updateOrderStatus(tx as unknown as OrderStatusTransaction, id, body.status as OrderStatus),
    );
    return NextResponse.json(order);
  } catch (error: unknown) {
    if (error instanceof OrderStatusError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Dữ liệu JSON không hợp lệ' }, { status: 400 });
    }
    console.error('Order status update failed', error);
    return NextResponse.json({ error: 'Không thể cập nhật trạng thái đơn hàng' }, { status: 500 });
  }
}
