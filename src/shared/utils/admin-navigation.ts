export function canOpenAdminDashboard(user: {
  role?: string;
  permissions?: readonly string[];
} | null | undefined): boolean {
  if (user?.role === 'ADMIN') return true;
  return user?.role === 'STAFF' && Boolean(user.permissions?.includes('orders'));
}
