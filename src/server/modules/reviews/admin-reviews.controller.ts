import { NextResponse } from 'next/server';
import { prisma } from '@server/database/prisma';
import { requireAdmin, requireOperatorPermission } from '@server/modules/admin/guards';
import { validateReviewModeration } from './review-moderation';

export const dynamic = 'force-dynamic';

export async function loadAdminReviews(filters: { search?: string; rating?: number; approved?: boolean } = {}) {
  const reviews = await prisma.review.findMany({
    where: {
      ...(filters.rating ? { rating: filters.rating } : {}),
      ...(filters.approved !== undefined ? { isApproved: filters.approved } : {}),
      ...(filters.search ? { OR: [
        { comment: { contains: filters.search, mode: 'insensitive' as const } },
        { reply: { contains: filters.search, mode: 'insensitive' as const } },
        { product: { name: { contains: filters.search, mode: 'insensitive' as const } } },
        { user: { name: { contains: filters.search, mode: 'insensitive' as const } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' as const } } },
      ] } : {}),
    },
    include: {
      product: { select: { id: true, name: true, image: true, price: true } },
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return reviews.map((review) => ({
    ...review,
    createdAt: review.createdAt.toISOString(),
    product: { ...review.product, price: Number(review.product.price) },
  }));
}

export async function GET(request: Request) {
  const access = await requireOperatorPermission('reviews');
  if (!access.authorized) return access.response;
  const params = new URL(request.url).searchParams;
  const ratingParam = params.get('rating');
  const approvedParam = params.get('approved');
  if ((ratingParam && !['1', '2', '3', '4', '5'].includes(ratingParam)) ||
      (approvedParam && !['true', 'false'].includes(approvedParam))) {
    return NextResponse.json({ error: 'Bộ lọc không hợp lệ' }, { status: 400 });
  }
  try {
    const reviews = await loadAdminReviews({
      search: params.get('search')?.trim(),
      rating: ratingParam ? Number(ratingParam) : undefined,
      approved: approvedParam ? approvedParam === 'true' : undefined,
    });
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json({ error: 'Lỗi tải danh sách đánh giá' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const access = await requireOperatorPermission('reviews');
  if (!access.authorized) return access.response;
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const validation = validateReviewModeration(body);
  if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 });
  const { id, isApproved, reply } = validation.data;
  try {
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Không tìm thấy đánh giá' }, { status: 404 });
    const review = await prisma.review.update({
      where: { id },
      data: {
        ...(isApproved !== undefined ? { isApproved } : {}),
        ...(reply !== undefined ? { reply } : {}),
      },
      include: {
        product: { select: { id: true, name: true, image: true, price: true } },
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
    return NextResponse.json({ success: true, review: { ...review, product: { ...review.product, price: Number(review.product.price) } } });
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật đánh giá' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const access = await requireAdmin();
  if (!access.authorized) return access.response;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Thiếu ID đánh giá' }, { status: 400 });
  try {
    const existing = await prisma.review.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: 'Không tìm thấy đánh giá' }, { status: 404 });
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json({ error: 'Lỗi xóa đánh giá' }, { status: 500 });
  }
}
