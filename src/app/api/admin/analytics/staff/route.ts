import { NextResponse } from 'next/server';
import { requireOperatorPermission } from '@server/modules/admin/guards';
import { loadStaffDashboard } from '@server/modules/admin/staff-dashboard.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const access = await requireOperatorPermission('orders');
  if (!access.authorized) return access.response;
  try {
    return NextResponse.json(await loadStaffDashboard(access.user.permissions ?? ['orders']), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Staff analytics failed', error);
    return NextResponse.json({ error: 'Không thể tải thống kê vận hành' }, { status: 500 });
  }
}
