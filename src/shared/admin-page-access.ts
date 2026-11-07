export interface AdminPageUser {
  role?: string;
  permissions?: readonly string[];
}

export const ADMIN_SECTIONS = [
  { name: 'Bảng điều khiển', href: '/admin', permission: 'orders' },
  { name: 'Đơn hàng', href: '/admin/orders', permission: 'orders' },
  { name: 'Sản phẩm', href: '/admin/products', permission: 'products' },
] as const;

export function canAccessAdminPage(user: AdminPageUser | null | undefined, pathname: string): boolean {
  const section = ADMIN_SECTIONS.find((item) => item.href === pathname);
  if (!section || !user) return false;
  if (user.role === 'ADMIN') return true;
  return user.role === 'STAFF' && Boolean(user.permissions?.includes(section.permission));
}

export function getVisibleAdminSections(user: AdminPageUser | null | undefined) {
  return ADMIN_SECTIONS.filter((section) => canAccessAdminPage(user, section.href));
}
