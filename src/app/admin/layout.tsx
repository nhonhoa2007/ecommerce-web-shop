import { getServerSession } from 'next-auth';
import { authOptions } from '@server/modules/auth/auth-options';
import { AdminAppShell } from '@client/components/admin/layout/AdminAppShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'STAFF'].includes(session.user.role ?? '')) return children;
  return <AdminAppShell user={session.user}>{children}</AdminAppShell>;
}
