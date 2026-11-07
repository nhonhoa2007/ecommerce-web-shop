import type { DiscountType } from '@prisma/client';

export interface CouponCreateData {
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount: bigint | null;
  minOrderAmount: bigint;
  usageLimit: number;
  perUserLimit: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export function validateCouponCreate(input: unknown):
  | { valid: true; data: CouponCreateData }
  | { valid: false; error: string } {
  if (!input || typeof input !== 'object') return { valid: false, error: 'Dữ liệu không hợp lệ' };
  const raw = input as Record<string, unknown>;
  const code = typeof raw.code === 'string' ? raw.code.trim().toUpperCase() : '';
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return { valid: false, error: 'Mã giảm giá phải có 3–32 ký tự chữ, số, _ hoặc -' };
  if (!['FIXED', 'PERCENTAGE', 'FREE_SHIPPING'].includes(String(raw.discountType))) {
    return { valid: false, error: 'Loại giảm giá không hợp lệ' };
  }
  const discountType = raw.discountType as DiscountType;
  const discountValue = discountType === 'FREE_SHIPPING' ? 0 : Number(raw.discountValue);
  if (!Number.isSafeInteger(discountValue) || discountValue < 0 || discountValue > 2_147_483_647 ||
      (discountType !== 'FREE_SHIPPING' && discountValue === 0) ||
      (discountType === 'PERCENTAGE' && discountValue > 100)) {
    return { valid: false, error: 'Mức giảm không hợp lệ' };
  }
  const minAmount = Number(raw.minOrderAmount ?? 0);
  const maxAmount = raw.maxDiscount == null || raw.maxDiscount === '' ? null : Number(raw.maxDiscount);
  if (!Number.isSafeInteger(minAmount) || minAmount < 0 ||
      (maxAmount !== null && (!Number.isSafeInteger(maxAmount) || maxAmount <= 0))) {
    return { valid: false, error: 'Điều kiện số tiền không hợp lệ' };
  }
  const usageLimit = Number(raw.usageLimit ?? 100);
  const perUserLimit = Number(raw.perUserLimit ?? 1);
  if (!Number.isInteger(usageLimit) || usageLimit < 1 || usageLimit > 2_147_483_647 ||
      !Number.isInteger(perUserLimit) || perUserLimit < 1 || perUserLimit > usageLimit) {
    return { valid: false, error: 'Giới hạn sử dụng không hợp lệ' };
  }
  const startDate = typeof raw.startDate === 'string' ? new Date(raw.startDate) : new Date(NaN);
  const endDate = typeof raw.endDate === 'string' ? new Date(raw.endDate) : new Date(NaN);
  if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime()) || startDate >= endDate) {
    return { valid: false, error: 'Khoảng thời gian không hợp lệ' };
  }
  if (raw.isActive !== undefined && typeof raw.isActive !== 'boolean') return { valid: false, error: 'Trạng thái không hợp lệ' };
  if (raw.description !== undefined && raw.description !== null && typeof raw.description !== 'string') {
    return { valid: false, error: 'Mô tả không hợp lệ' };
  }
  return { valid: true, data: {
    code,
    description: typeof raw.description === 'string' ? raw.description.trim().slice(0, 500) || null : null,
    discountType,
    discountValue,
    maxDiscount: maxAmount === null ? null : BigInt(maxAmount),
    minOrderAmount: BigInt(minAmount),
    usageLimit,
    perUserLimit,
    startDate,
    endDate,
    isActive: raw.isActive !== false,
  } };
}
