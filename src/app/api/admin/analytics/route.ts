import { NextResponse } from 'next/server';
import { requireAdmin } from '@server/modules/admin/guards';
import { loadAdminAnalytics } from '@server/modules/admin/dashboard-analytics.service';
import type { AnalyticsRange } from '@server/modules/admin/admin-analytics.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (!access.authorized) return access.response;
  const query = new URL(request.url).searchParams.get('range');
  const range: AnalyticsRange = query === 'today' || query === '7days' || query === 'month' ? query : 'today';
  try {
    return NextResponse.json(await loadAdminAnalytics(range), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Analytics failed', error);
    return NextResponse.json({ error: 'Không thể tải thống kê' }, { status: 500 });
  }
}
