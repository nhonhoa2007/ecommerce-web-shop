import { NextResponse } from 'next/server';
import { prisma } from '@server/database/prisma';
import { requireAdmin } from './guards';
import { updateUserRbac, validateUserUpdatePayload } from './admin-rbac.service';

export const dynamic = 'force-dynamic';

type CustomerFilters = { search?: string; role?: string; status?: string };

export async function loadAdminCustomers({ search, role, status }: CustomerFilters = {}) {
  const users = await prisma.user.findMany({
    where: {
      ...(role && role !== 'ALL' ? { role: role as 'CUSTOMER' | 'STAFF' | 'ADMIN' } : {}),
      ...(status === 'ACTIVE' ? { isBlocked: false } : status === 'BLOCKED' ? { isBlocked: true } : {}),
      ...(search ? { OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
        { address: { contains: search, mode: 'insensitive' as const } },
      ] } : {}),
    },
    select: {
      id: true, name: true, email: true, phone: true, address: true, avatar: true,
      role: true, isVerified: true, isBlocked: true, createdAt: true,
      staffPermissions: { select: { permission: true } },
      orders: {
        select: { id: true, orderCode: true, totalAmount: true, status: true, paymentStatus: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users.map((user) => {
    const paidOrders = user.orders.filter((order) => order.paymentStatus === 'PAID');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      role: user.role,
      permissions: user.staffPermissions.map((entry) => entry.permission),
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt.toISOString(),
      orderCount: user.orders.length,
      paidOrderCount: paidOrders.length,
      totalSpent: paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
      recentOrders: user.orders.slice(0, 3).map((order) => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt.toISOString(),
      })),
    };
  });
}

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (!access.authorized) return access.response;

  const params = new URL(request.url).searchParams;
  const role = params.get('role') || undefined;
  const status = params.get('status') || undefined;
  if ((role && !['ALL', 'CUSTOMER', 'STAFF', 'ADMIN'].includes(role)) ||
      (status && !['ALL', 'ACTIVE', 'BLOCKED'].includes(status))) {
    return NextResponse.json({ error: 'Bộ lọc không hợp lệ' }, { status: 400 });
  }
  try {
    const customers = await loadAdminCustomers({ search: params.get('search')?.trim(), role, status });
    return NextResponse.json({ customers, users: customers });
  } catch (error) {
    console.error('Fetch customers error:', error);
    return NextResponse.json({ error: 'Lỗi tải danh sách người dùng' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const access = await requireAdmin();
  if (!access.authorized) return access.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  const validation = validateUserUpdatePayload(body);
  if (!validation.valid || !validation.data) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  try {
    const result = await updateUserRbac(
      { adminId: access.user.id, ...validation.data },
      prisma.user as unknown as Parameters<typeof updateUserRbac>[1],
    );
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode || 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật người dùng' }, { status: 500 });
  }
}
