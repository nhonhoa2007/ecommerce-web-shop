import { redirect } from 'next/navigation';
import { requireAdmin } from '@server/modules/admin/guards';
import { loadAdminTransactions } from '@server/modules/admin/transactions.controller';
import { AdminTransactionsView } from '@client/views/admin/AdminTransactionsView';

export const dynamic = 'force-dynamic';

export default async function AdminTransactionsPage() {
  const access = await requireAdmin();
  if (!access.authorized) redirect(access.response.status === 401 ? '/login?callbackUrl=/admin/transactions' : '/');
  const transactions = await loadAdminTransactions();
  return <AdminTransactionsView initialTransactions={transactions} />;
}
