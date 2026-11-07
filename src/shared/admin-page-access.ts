export interface AdminPageUser {
  role?: string;
  permissions?: readonly string[];
}

export const ADMIN_SECTIONS = [
  { name: 'Bảng điều khiển', href: '/admin', permission: 'orders' },
  { name: 'Đơn hàng', href: '/admin/orders', permission: 'orders' },
  { name: 'Sản phẩm', href: '/admin/products', permission: 'products' },
  { name: 'Khách hàng', href: '/admin/customers', permission: 'admin', adminOnly: true },
  { name: 'Đánh giá', href: '/admin/reviews', permission: 'reviews' },
  { name: 'Vận đơn', href: '/admin/shipments', permission: 'shipments' },
  { name: 'Giao dịch', href: '/admin/transactions', permission: 'admin', adminOnly: true },
  { name: 'Mã giảm giá', href: '/admin/coupons', permission: 'admin', adminOnly: true },
  { name: 'Hỗ trợ khách hàng', href: '/admin/chat', permission: 'chat' },
  { name: 'Bảo hành', href: '/admin/warranties', permission: 'warranties' },
  { name: 'Đổi trả', href: '/admin/returns', permission: 'warranties' },
  { name: 'Nhật ký kiểm toán', href: '/admin/audit-logs', permission: 'admin', adminOnly: true },
] as const;

export function canAccessAdminPage(user: AdminPageUser | null | undefined, pathname: string): boolean {
  const section = ADMIN_SECTIONS.find((item) => item.href === pathname || (item.href === '/admin/chat' && pathname.startsWith('/admin/chat/')));
  if (!section || !user) return false;
  if (user.role === 'ADMIN') return true;
  if ('adminOnly' in section && section.adminOnly) return false;
  return user.role === 'STAFF' && Boolean(user.permissions?.includes(section.permission));
}

export function getVisibleAdminSections(user: AdminPageUser | null | undefined) {
  return ADMIN_SECTIONS.filter((section) => canAccessAdminPage(user, section.href));
}
