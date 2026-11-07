import { NextResponse } from 'next/server';
import { prisma } from '@server/database/prisma';
import { requireAdmin } from '@server/modules/admin/guards';
import { listAdminAuditLogs } from '@server/modules/admin/audit-log.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (!access.authorized) return access.response;
  const params = new URL(request.url).searchParams;
  const rawLimit = Number(params.get('limit') ?? 50);
  const rawOffset = Number(params.get('offset') ?? 0);
  if (!Number.isInteger(rawLimit) || rawLimit < 1 || !Number.isInteger(rawOffset) || rawOffset < 0) {
    return NextResponse.json({ error: 'Phân trang không hợp lệ' }, { status: 400 });
  }
  const result = await listAdminAuditLogs(prisma, {
    entityType: params.get('entityType') || undefined,
    entityId: params.get('entityId') || undefined,
    actorId: params.get('actorId') || undefined,
    action: params.get('action') || undefined,
    limit: Math.min(rawLimit, 100),
    offset: rawOffset,
  });
  return NextResponse.json(result);
}
