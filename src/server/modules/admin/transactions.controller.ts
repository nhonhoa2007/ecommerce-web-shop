import { NextResponse } from 'next/server';
import { prisma } from '@server/database/prisma';
import { requireAdmin } from './guards';
import { appendAdminAudit } from './audit-log.service';
import { validateBankReviewInput, validateTransferApplication } from './bank-review-input';

export const dynamic = 'force-dynamic';

export async function loadAdminTransactions(filters: { search?: string; verified?: boolean } = {}) {
  const transfers = await prisma.bankTransfer.findMany({
    where: {
      status: filters.verified === true ? 'APPLIED_ORDER' : filters.verified === false ? 'PENDING_REVIEW' : { in: ['APPLIED_ORDER', 'PENDING_REVIEW'] },
      ...(filters.search ? { OR: [
        { bankTransId: { contains: filters.search, mode: 'insensitive' as const } },
        { description: { contains: filters.search, mode: 'insensitive' as const } },
        { order: { orderCode: { contains: filters.search, mode: 'insensitive' as const } } },
      ] } : {}),
    },
    include: { order: { select: {
      id: true, orderCode: true, customerName: true, customerPhone: true,
      customerEmail: true, totalAmount: true, status: true, paymentStatus: true,
    } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return transfers.map((transfer) => ({
    id: transfer.id,
    orderId: transfer.orderId,
    bankTransId: transfer.bankTransId,
    amount: transfer.amount.toString(),
    description: transfer.description,
    bankName: transfer.bankName,
    senderAccount: transfer.senderAccount,
    receivedAt: transfer.receivedAt?.toISOString() ?? null,
    verified: transfer.status === 'APPLIED_ORDER',
    createdAt: transfer.createdAt.toISOString(),
    order: transfer.order ? { ...transfer.order, totalAmount: transfer.order.totalAmount.toString() } : null,
  }));
}

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (!access.authorized) return access.response;
  const params = new URL(request.url).searchParams;
  const verifiedParam = params.get('verified');
  if (verifiedParam && !['true', 'false'].includes(verifiedParam)) {
    return NextResponse.json({ error: 'Bộ lọc không hợp lệ' }, { status: 400 });
  }
  try {
    const transactions = await loadAdminTransactions({
      search: params.get('search')?.trim(),
      verified: verifiedParam ? verifiedParam === 'true' : undefined,
    });
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json({ error: 'Lỗi tải danh sách giao dịch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const access = await requireAdmin();
  if (!access.authorized) return access.response;
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const validation = validateBankReviewInput(body);
  if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 });
  const { transferId, orderCode, note } = validation.data;
  try {
    await prisma.$transaction(async (tx) => {
      const [transfer, order] = await Promise.all([
        tx.bankTransfer.findUnique({ where: { id: transferId } }),
        tx.order.findUnique({ where: { orderCode } }),
      ]);
      const error = validateTransferApplication(transfer, order);
      if (error) throw new Error(error);
      if (!transfer || !order) throw new Error('Dữ liệu đối soát không tồn tại');
      const claimed = await tx.bankTransfer.updateMany({
        where: { id: transfer.id, status: 'PENDING_REVIEW', orderId: null },
        data: { status: 'APPLIED_ORDER', orderId: order.id, reviewedById: access.user.id, reviewedAt: new Date(), resolutionNote: note },
      });
      if (claimed.count !== 1) throw new Error('Giao dịch đã được xử lý đồng thời');
      const updated = await tx.order.updateMany({
        where: { id: order.id, status: 'PENDING', paymentStatus: 'UNPAID' },
        data: { status: 'CONFIRMED', paymentStatus: 'PAID' },
      });
      if (updated.count !== 1) throw new Error('Trạng thái đơn đã thay đổi');
      if (transfer.amount > order.totalAmount) {
        await tx.refundCase.create({ data: {
          sourceKey: `excess:${transfer.id}:${order.id}`,
          orderId: order.id,
          bankTransferId: transfer.id,
          amount: transfer.amount - order.totalAmount,
          reason: 'Tiền chuyển dư; cần hoàn phần chênh lệch',
        } });
      }
      await appendAdminAudit(tx, {
        operationKey: `audit:bank-review:${transfer.id}:${order.id}`,
        actorId: access.user.id,
        actorRole: 'ADMIN',
        action: 'RECONCILE_BANK_TRANSFER',
        entityType: 'Order',
        entityId: order.id,
        reason: note,
        afterState: { transferId: transfer.id, amount: transfer.amount.toString(), orderAmount: order.totalAmount.toString() },
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Lỗi đối soát' }, { status: 409 });
  }
}
