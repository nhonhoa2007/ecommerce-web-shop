'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatVND } from '@shared/utils';

interface ReportOrder {
  id: string;
  orderCode: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  totalAmount?: string;
}

export function Week4OrdersReport({ orders, role }: { orders: ReportOrder[]; role: 'ADMIN' | 'STAFF' }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function confirmPayment(id: string) {
    setBusyId(id);
    setError('');
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(id)}/confirm-payment`, { method: 'POST' });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || 'Không thể xác nhận thanh toán');
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể xác nhận thanh toán');
    } finally {
      setBusyId(null);
    }
  }

  return <main className="mx-auto max-w-6xl px-4 py-10">
    <h1 className="text-3xl font-semibold">Báo cáo đơn hàng</h1>
    <p className="mt-2 text-sm text-muted-gray">Xác nhận thanh toán sau khi đối chiếu giao dịch ngân hàng.</p>
    {error && <p role="alert" className="mt-4 text-red-600">{error}</p>}
    <div className="mt-6 overflow-x-auto rounded-3xl bg-white p-5 shadow-card"><table className="w-full min-w-[720px] text-left text-sm">
      <thead><tr className="border-b"><th className="py-3">Mã đơn</th><th>Khách hàng</th><th>Ngày tạo</th><th>Trạng thái</th><th>Thanh toán</th>{role === 'ADMIN' && <th>Số tiền</th>}<th>Thao tác</th></tr></thead>
      <tbody>{orders.map((order) => <tr key={order.id} className="border-b last:border-none">
        <td className="py-4 font-medium">{order.orderCode}</td><td>{order.customerName}</td><td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td><td>{order.status}</td><td>{order.paymentStatus}</td>
        {role === 'ADMIN' && <td>{formatVND(order.totalAmount ?? '0')}</td>}
        <td>{order.paymentStatus === 'UNPAID' && order.status === 'PENDING' && <button type="button" disabled={busyId !== null} onClick={() => confirmPayment(order.id)} className="rounded-full bg-ink-black px-3 py-2 text-xs text-white disabled:opacity-50">Xác nhận đã nhận tiền</button>}</td>
      </tr>)}</tbody>
    </table>{orders.length === 0 && <p className="py-8 text-center text-muted-gray">Chưa có đơn hàng.</p>}</div>
  </main>;
}
