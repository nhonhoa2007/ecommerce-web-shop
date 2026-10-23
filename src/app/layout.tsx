import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@client/components/layout/Header';
import { Footer } from '@client/components/layout/Footer';

export const metadata: Metadata = {
  title: 'shop. · Hệ thống Website Thương mại điện tử',
  description: 'Khám phá, tìm kiếm và lọc sản phẩm trên website thương mại điện tử.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col bg-canvas-mist text-ink-black antialiased">
        <Providers>
          <Header />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
