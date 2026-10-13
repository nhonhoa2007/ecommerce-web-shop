export default function HomePage() {
  return (
    <div className="py-12 space-y-8">
      <div className="bg-white rounded-2xl p-8 border border-faint-border shadow-soft-sm">
        <div className="inline-block px-3 py-1 bg-shop-violet/10 text-shop-violet rounded-full text-xs font-semibold mb-3">
          Tuần 1: Khởi tạo dự án & Thiết kế Cơ sở dữ liệu
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-black mb-3">
          Hệ thống Website Thương mại điện tử
        </h1>
        <p className="text-muted-gray text-base leading-relaxed max-w-3xl">
          Đề án môn học Đồ án cơ sở 2 (ITe)-13, Trường Đại học Công nghệ Thông
          tin và Truyền thông Việt - Hàn (VKU). Hệ thống hỗ trợ bán hàng trực
          tuyến, thanh toán trực tuyến qua mã QR (VietQR) và phân quyền quản trị
          đa tầng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-faint-border shadow-soft-sm">
          <h2 className="text-lg font-bold mb-2 text-ink-black">
            Thông tin sinh viên
          </h2>
          <ul className="text-sm space-y-1.5 text-muted-gray">
            <li>
              <strong className="text-ink-black">Họ và tên:</strong> Phùng Nhơn
              Hòa
            </li>
            <li>
              <strong className="text-ink-black">MSSV:</strong> 25ITE020
            </li>
            <li>
              <strong className="text-ink-black">Lớp:</strong> Đồ án cơ sở 2
              (ITe)-13
            </li>
            <li>
              <strong className="text-ink-black">GVHD:</strong> TS. Nguyễn Đức
              Hiển
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl border border-faint-border shadow-soft-sm">
          <h2 className="text-lg font-bold mb-2 text-ink-black">
            Công nghệ sử dụng
          </h2>
          <ul className="text-sm space-y-1.5 text-muted-gray">
            <li>
              <strong className="text-ink-black">Frontend:</strong> Next.js 16,
              React 19, Tailwind CSS
            </li>
            <li>
              <strong className="text-ink-black">Backend:</strong> Next.js App
              Router, Prisma ORM
            </li>
            <li>
              <strong className="text-ink-black">Database:</strong> PostgreSQL
              (Quan hệ)
            </li>
            <li>
              <strong className="text-ink-black">Kiến trúc:</strong> Layered
              Clean Architecture
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl border border-faint-border shadow-soft-sm">
          <h2 className="text-lg font-bold mb-2 text-ink-black">
            Mục tiêu tuần 1
          </h2>
          <ul className="text-sm space-y-1.5 text-muted-gray">
            <li>✓ Khởi tạo mã nguồn Next.js & TypeScript</li>
            <li>✓ Thiết lập cấu trúc Clean Architecture</li>
            <li>✓ Phân tích thực thể: User, Product, Order...</li>
            <li>✓ Cài đặt CSDL PostgreSQL qua Prisma ORM</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
