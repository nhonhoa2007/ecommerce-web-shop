import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Hệ thống Website Thương mại điện tử - Đồ án cơ sở 2',
  description: 'Đồ án cơ sở 2: Hệ thống website thương mại điện tử - Sinh viên thực hiện: Phùng Nhơn Hòa (25ITE020)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-canvas-mist text-ink-black flex flex-col antialiased">
        <Providers>
          <header className="border-b border-faint-border bg-white px-6 py-4 shadow-soft-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span className="text-xl font-bold tracking-tight text-shop-violet">shop.</span>
              <span className="text-xs text-muted-gray">Đồ án cơ sở 2 • Phùng Nhơn Hòa</span>
            </div>
          </header>
          <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full p-6">
            {children}
          </main>
          <footer className="border-t border-faint-border bg-white px-6 py-4 text-center text-xs text-muted-gray">
            © 2026 Hệ thống Website Thương mại điện tử - TS. Nguyễn Đức Hiển hướng dẫn
          </footer>
        </Providers>
      </body>
    </html>
  );
}
