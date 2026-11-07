export function validateBankReviewInput(input: unknown):
  | { valid: true; data: { transferId: string; orderCode: string; note: string } }
  | { valid: false; error: string } {
  if (!input || typeof input !== 'object') return { valid: false, error: 'Dữ liệu không hợp lệ' };
  const raw = input as Record<string, unknown>;
  const transferId = typeof raw.transferId === 'string' ? raw.transferId.trim() : '';
  const orderCode = typeof raw.orderCode === 'string' ? raw.orderCode.trim().toUpperCase() : '';
  const note = typeof raw.note === 'string' ? raw.note.trim() : '';
  if (!transferId || !orderCode || !note) {
    return { valid: false, error: 'Cần giao dịch đã ghi nhận, mã đơn và lý do đối soát' };
  }
  if (transferId.length > 100 || orderCode.length > 100 || note.length > 500) {
    return { valid: false, error: 'Dữ liệu đối soát quá dài' };
  }
  return { valid: true, data: { transferId, orderCode, note } };
}

export function validateTransferApplication(
  transfer: { status: string; orderId: string | null; amount: bigint } | null,
  order: { status: string; paymentStatus: string; totalAmount: bigint } | null,
): string | null {
  if (!transfer || transfer.status !== 'PENDING_REVIEW' || transfer.orderId || transfer.amount <= 0n) {
    return 'Giao dịch không còn chờ đối soát';
  }
  if (!order || order.status !== 'PENDING' || order.paymentStatus !== 'UNPAID') {
    return 'Đơn hàng không còn chờ thanh toán';
  }
  if (transfer.amount < order.totalAmount) return 'Giao dịch chưa đủ giá trị đơn hàng';
  return null;
}
