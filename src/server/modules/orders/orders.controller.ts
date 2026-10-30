import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@server/modules/auth/auth-options';
import { prisma } from '@server/database/prisma';
import { reserveOrderStock, type StockTransaction } from '@server/modules/inventory/inventory.service';
import {
  createOrderCode,
  loadAuthoritativeOrderItems,
  OrderInputError,
  type OrderProductRepository,
  validateOrderInput,
} from './order-input.service';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const input = validateOrderInput(await request.json());
    const orderCode = createOrderCode();

    const order = await prisma.$transaction(async (tx) => {
      const authoritative = await loadAuthoritativeOrderItems(
        tx as unknown as OrderProductRepository,
        input.items,
      );
      const failedLine = await reserveOrderStock(tx as unknown as StockTransaction, authoritative.items);
      if (failedLine) {
        throw new OrderInputError(`Sản phẩm hoặc phân loại ${failedLine} không đủ tồn kho`, 409);
      }

      return tx.order.create({
        data: {
          orderCode,
          userId: session?.user?.id ?? null,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerAddress: input.customerAddress,
          customerEmail: input.customerEmail,
          note: input.note,
          subtotal: authoritative.subtotal,
          shippingFee: BigInt(0),
          discountAmount: BigInt(0),
          totalAmount: authoritative.subtotal,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          items: {
            create: authoritative.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              variantTitle: item.variantTitle,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
              unitPrice: item.price,
            })),
          },
        },
        select: { id: true, orderCode: true, totalAmount: true, status: true },
      });
    });

    return NextResponse.json(
      { ...order, totalAmount: order.totalAmount.toString() },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof OrderInputError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Dữ liệu JSON không hợp lệ' }, { status: 400 });
    }
    console.error('Order creation failed', error);
    return NextResponse.json({ error: 'Không thể tạo đơn hàng' }, { status: 500 });
  }
}
