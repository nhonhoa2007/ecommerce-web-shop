'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getVisibleAdminSections } from '@shared/admin-page-access';

interface AdminUser {
  name?: string | null;
  email?: string | null;
  role?: string;
  permissions?: string[];
}

export function AdminAppShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-[1440px] flex-col bg-[#f5f6f7] lg:flex-row">
    <aside className="border-b border-slate-200 bg-white p-5 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
      <Link href="/admin" className="text-xl font-semibold">shop. <span className="text-sm font-normal text-slate-500">Admin</span></Link>
      <nav aria-label="Điều hướng quản trị" className="mt-6 flex gap-2 lg:flex-col">
        {getVisibleAdminSections(user).map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined}
          className={`rounded-xl px-4 py-3 text-sm font-medium ${pathname === item.href ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>{item.name}</Link>)}
      </nav>
      <div className="mt-8 border-t pt-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-800">{user.name || user.email || 'Người dùng'}</p>
        <p>{user.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</p>
        <Link href="/" className="mt-4 inline-block underline">Về cửa hàng</Link>
      </div>
    </aside>
    <div className="min-w-0 flex-1">{children}</div>
  </div>;
}
