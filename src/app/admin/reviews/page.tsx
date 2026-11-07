import { redirect } from 'next/navigation';
import { requireOperatorPermission } from '@server/modules/admin/guards';
import { loadAdminReviews } from '@server/modules/reviews/admin-reviews.controller';
import { AdminReviewsView } from '@client/views/admin/AdminReviewsView';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const access = await requireOperatorPermission('reviews');
  if (!access.authorized) redirect(access.response.status === 401 ? '/login?callbackUrl=/admin/reviews' : '/');
  const reviews = await loadAdminReviews();
  return <AdminReviewsView initialReviews={reviews} canDelete={access.user.role === 'ADMIN'} />;
}
