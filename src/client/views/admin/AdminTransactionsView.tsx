'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CreditCard, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDateTime, formatVND } from '@shared/utils';

export interface AdminTransactionItem {
  id: string;
  orderId: string | null;
  bankTransId: string | null;
  amount: string;
  description: string;
  bankName: string | null;
  senderAccount: string | null;
  receivedAt: string | null;
  verified: boolean;
  createdAt: string;
  order: {
    id: string;
    orderCode: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    totalAmount: string;
    status: string;
    paymentStatus: string;
  } | null;
}

export function AdminTransactionsView({ initialTransactions }: { initialTransactions: AdminTransactionItem[] }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');
  const [selected, setSelected] = useState<AdminTransactionItem | null>(null);
  const [orderCode, setOrderCode] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => transactions.filter((tx) => {
    if (filter === 'VERIFIED' && !tx.verified) return false;
    if (filter === 'UNVERIFIED' && tx.verified) return false;
    const q = search.trim().toLowerCase();
    return !q || [tx.bankTransId, tx.description, tx.order?.orderCode, tx.order?.customerName, tx.senderAccount]
      .some((value) => value?.toLowerCase().includes(q));
  }), [transactions, search, filter]);
  const verifiedTotal = transactions.filter((tx) => tx.verified).reduce((total, tx) => total + BigInt(tx.amount), 0n);

  async function reconcile(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !orderCode.trim() || !note.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/transactions/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferId: selected.id, orderCode, note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể đối soát');
      const refreshed = await fetch('/api/admin/transactions');
      if (!refreshed.ok) throw new Error('Đã đối soát, nhưng không tải lại được danh sách');
      const result = await refreshed.json();
      setTransactions(result.transactions);
      setSelected(null);
      toast.success('Đã đối soát giao dịch với đơn hàng');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lỗi đối soát');
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
    <div>
      <Link href="/admin" className="text-sm text-slate-500 hover:underline">Admin</Link>
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold"><CreditCard className="size-7 text-blue-600" />Đối soát giao dịch ngân hàng</h1>
      <p className="mt-1 text-sm text-slate-500">Chỉ khớp giao dịch ngân hàng đã ghi nhận với đơn hàng đang chờ thanh toán.</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border bg-white p-5"><p className="text-xs text-slate-500">Tổng giao dịch</p><strong className="text-2xl">{transactions.length}</strong></div>
      <div className="rounded-xl border bg-white p-5"><p className="text-xs text-slate-500">Đã khớp đơn</p><strong className="text-2xl text-green-700">{transactions.filter((tx) => tx.verified).length}</strong></div>
      <div className="rounded-xl border bg-white p-5"><p className="text-xs text-slate-500">Tổng tiền đã khớp</p><strong className="text-2xl text-blue-700">{formatVND(verifiedTotal)}</strong></div>
    </div>
    <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4">
      <label className="relative min-w-56 flex-1"><Search className="absolute left-3 top-3 size-4 text-slate-400" /><span className="sr-only">Tìm giao dịch</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã giao dịch, đơn, người gửi" className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm" /></label>
      <label><span className="sr-only">Trạng thái</span><select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="rounded-lg border px-3 py-2 text-sm"><option value="ALL">Tất cả</option><option value="VERIFIED">Đã khớp</option><option value="UNVERIFIED">Chờ đối soát</option></select></label>
    </div>
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Mã giao dịch</th><th className="p-3">Đơn hàng</th><th className="p-3">Số tiền</th><th className="p-3">Nội dung</th><th className="p-3">Thời gian</th><th className="p-3">Trạng thái</th><th className="p-3">Thao tác</th></tr></thead><tbody className="divide-y">
        {filtered.map((tx) => <tr key={tx.id}><td className="p-3 font-mono text-xs">{tx.bankTransId || tx.id}</td><td className="p-3">{tx.order?.orderCode || 'Chưa gắn đơn'}</td><td className="p-3 font-semibold text-green-700">{formatVND(tx.amount)}</td><td className="max-w-64 truncate p-3" title={tx.description}>{tx.description}</td><td className="p-3 text-xs">{formatDateTime(tx.receivedAt || tx.createdAt)}</td><td className="p-3">{tx.verified ? <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 className="size-4" />Đã khớp</span> : <span className="inline-flex items-center gap-1 text-amber-700"><AlertCircle className="size-4" />Chờ đối soát</span>}</td><td className="p-3">{!tx.verified && !tx.orderId && <button type="button" onClick={() => { setSelected(tx); setOrderCode(''); setNote(''); }} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white">Khớp đơn</button>}</td></tr>)}
        {filtered.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-slate-500">Không có giao dịch phù hợp</td></tr>}
      </tbody></table>
    </div>
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"><form onSubmit={reconcile} className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl"><h2 className="text-lg font-bold">Khớp giao dịch đã ghi nhận</h2><p className="text-sm text-slate-600">Giao dịch {selected.bankTransId || selected.id}: {formatVND(selected.amount)}</p><label className="block text-sm">Mã đơn hàng<input required value={orderCode} onChange={(event) => setOrderCode(event.target.value.toUpperCase())} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="block text-sm">Lý do đối soát<textarea required maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelected(null)} disabled={submitting} className="rounded-lg border px-4 py-2 text-sm">Hủy</button><button type="submit" disabled={submitting} className="rounded-lg bg-blue-700 px-4 py-2 text-sm text-white">{submitting ? 'Đang đối soát...' : 'Xác nhận'}</button></div></form></div>}
  </div>;
}
