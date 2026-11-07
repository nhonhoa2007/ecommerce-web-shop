import { NextResponse } from 'next/server';
import { prisma } from '@server/database/prisma';
import { requireAdmin } from './guards';
import { validateCouponCreate } from './coupon-input';
import { serializeCouponDto } from '@server/modules/money/money-serialization';

export const dynamic = 'force-dynamic';

export async function GET() {
  const access = await requireAdmin();
  if (!access.authorized) return access.response;
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } },
    });
    return NextResponse.json({ coupons: coupons.map(serializeCouponDto) });
  } catch (error) {
    console.error('Fetch coupons error:', error);
    return NextResponse.json({ error: 'Lỗi tải mã giảm giá' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const access = await requireAdmin();
  if (!access.authorized) return access.response;
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const validation = validateCouponCreate(body);
  if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 });
  try {
    const coupon = await prisma.coupon.create({ data: validation.data });
    return NextResponse.json(serializeCouponDto(coupon), { status: 201 });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Mã giảm giá đã tồn tại' }, { status: 409 });
    }
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: 'Lỗi tạo mã giảm giá' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const access = await requireAdmin();
  if (!access.authorized) return access.response;
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const raw = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  if (typeof raw.id !== 'string' || !raw.id.trim() || typeof raw.isActive !== 'boolean') {
    return NextResponse.json({ error: 'Thiếu ID hoặc trạng thái' }, { status: 400 });
  }
  try {
    const coupon = await prisma.coupon.update({ where: { id: raw.id }, data: { isActive: raw.isActive } });
    return NextResponse.json({ success: true, coupon: serializeCouponDto(coupon) });
  } catch (error) {
    console.error('Update coupon error:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật mã giảm giá' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const access = await requireAdmin();
  if (!access.authorized) return access.response;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Thiếu ID mã giảm giá' }, { status: 400 });
  try {
    const coupon = await prisma.coupon.findUnique({ where: { id }, select: { id: true } });
    if (!coupon) return NextResponse.json({ error: 'Không tìm thấy mã giảm giá' }, { status: 404 });
    const ordersCount = await prisma.order.count({ where: { couponId: id } });
    if (ordersCount > 0) {
      const updated = await prisma.coupon.update({ where: { id }, data: { isActive: false } });
      return NextResponse.json({ success: true, softDeactivated: true, message: 'Mã đã được dùng nên chỉ vô hiệu hóa.', coupon: serializeCouponDto(updated) });
    }
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return NextResponse.json({ error: 'Lỗi xóa mã giảm giá' }, { status: 500 });
  }
}
