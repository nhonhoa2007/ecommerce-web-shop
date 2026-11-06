import { NextResponse } from 'next/server';
import { requireOperatorPermission } from '@server/modules/admin/guards';
import { loadWeek4Analytics } from '@server/modules/admin/week4-analytics.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const access = await requireOperatorPermission('orders');
  if (!access.authorized) return access.response;
  try {
    const role = access.user.role === 'ADMIN' ? 'ADMIN' : 'STAFF';
    return NextResponse.json(await loadWeek4Analytics(role), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Analytics failed', error);
    return NextResponse.json({ error: 'Không thể tải thống kê' }, { status: 500 });
  }
}
