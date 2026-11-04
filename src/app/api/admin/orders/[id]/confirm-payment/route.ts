import { NextResponse } from 'next/server';
import { requireOperatorPermission } from '@server/modules/admin/guards';
import { prisma } from '@server/database/prisma';
import { confirmOrderPayment } from '@server/modules/payment/confirm-payment.service';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireOperatorPermission('orders');
  if (!access.authorized) return access.response;
  const { id } = await params;
  try {
    const confirmed = await confirmOrderPayment(prisma, id);
    if (!confirmed) return NextResponse.json({ error: 'Đơn không còn chờ xác nhận thanh toán' }, { status: 409 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment confirmation failed', error);
    return NextResponse.json({ error: 'Không thể xác nhận thanh toán' }, { status: 500 });
  }
}
