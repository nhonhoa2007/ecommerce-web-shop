import type { OrderStatus } from '@shared/types';
import {
  releaseOrderStock,
  type OrderStockItem,
  type StockReleaseTransaction,
} from '@server/modules/inventory/inventory.service';

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

interface StoredOrder {
  id: string;
  orderCode: string;
  status: OrderStatus;
  updatedAt: Date;
  items: OrderStockItem[];
}

export interface OrderStatusTransaction extends StockReleaseTransaction {
  order: {
    findUnique: (args: object) => Promise<StoredOrder | null>;
    updateMany: (args: object) => Promise<{ count: number }>;
  };
}

export class OrderStatusError extends Error {
  readonly status: number;

  constructor(message: string, status = 409) {
    super(message);
    this.name = 'OrderStatusError';
    this.status = status;
  }
}

export function canManageOrderStatus(
  role: string | undefined,
  permissions: readonly string[] = [],
) {
  return role === 'ADMIN' || (role === 'STAFF' && permissions.includes('orders'));
}

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus) {
  return from === to || transitions[from].includes(to);
}

export async function updateOrderStatus(
  tx: OrderStatusTransaction,
  orderId: string,
  targetStatus: OrderStatus,
) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: { select: { productId: true, variantId: true, quantity: true } } },
  });
  if (!order) throw new OrderStatusError('Không tìm thấy đơn hàng', 404);
  if (!canTransitionOrderStatus(order.status, targetStatus)) {
    throw new OrderStatusError(`Không thể chuyển trạng thái từ ${order.status} sang ${targetStatus}`);
  }
  if (order.status === targetStatus) {
    return {
      id: order.id,
      orderCode: order.orderCode,
      status: order.status,
      updatedAt: order.updatedAt,
    };
  }
  const claimed = await tx.order.updateMany({
    where: { id: orderId, status: order.status },
    data: {
      status: targetStatus,
      ...(targetStatus === 'COMPLETED' ? { completedAt: new Date() } : {}),
    },
  });
  if (claimed.count !== 1) {
    const current = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: { select: { productId: true, variantId: true, quantity: true } } },
    });
    if (current?.status === targetStatus) {
      return {
        id: current.id,
        orderCode: current.orderCode,
        status: current.status,
        updatedAt: current.updatedAt,
      };
    }
    throw new OrderStatusError('Đơn hàng vừa được cập nhật bởi một yêu cầu khác');
  }
  if (targetStatus === 'CANCELLED') await releaseOrderStock(tx, order.items);
  return { id: order.id, orderCode: order.orderCode, status: targetStatus, updatedAt: order.updatedAt };
}
