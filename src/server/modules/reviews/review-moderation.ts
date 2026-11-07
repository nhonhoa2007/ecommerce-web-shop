export function validateReviewModeration(input: unknown):
  | { valid: true; data: { id: string; isApproved?: boolean; reply?: string | null } }
  | { valid: false; error: string } {
  if (!input || typeof input !== 'object') return { valid: false, error: 'Dữ liệu không hợp lệ' };
  const raw = input as Record<string, unknown>;
  const id = typeof raw.id === 'string' ? raw.id.trim() : '';
  if (!id) return { valid: false, error: 'Thiếu ID đánh giá' };
  if (raw.isApproved !== undefined && typeof raw.isApproved !== 'boolean') {
    return { valid: false, error: 'Trạng thái kiểm duyệt không hợp lệ' };
  }
  if (raw.reply !== undefined && raw.reply !== null && typeof raw.reply !== 'string') {
    return { valid: false, error: 'Phản hồi không hợp lệ' };
  }
  if (typeof raw.reply === 'string' && raw.reply.length > 2000) {
    return { valid: false, error: 'Phản hồi quá dài' };
  }
  if (raw.isApproved === undefined && raw.reply === undefined) {
    return { valid: false, error: 'Không có thông tin cần cập nhật' };
  }
  return { valid: true, data: {
    id,
    ...(raw.isApproved !== undefined ? { isApproved: raw.isApproved as boolean } : {}),
    ...(raw.reply !== undefined ? { reply: typeof raw.reply === 'string' ? raw.reply.trim() || null : null } : {}),
  } };
}
