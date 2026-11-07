import Link from 'next/link';
import Image from 'next/image';
import { formatVND } from '@shared/utils';

interface PaymentCardProps {
  orderCode: string;
  amount: string;
  qrUrl: string | null;
  bankName: string;
  accountNo: string;
  accountName: string;
  paymentStatus: string;
}

export function PaymentCard(props: PaymentCardProps) {
  return <section className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-card">
    <h1 className="text-2xl font-semibold">Thanh toán đơn {props.orderCode}</h1>
    <p className="mt-2 text-muted-gray">Trạng thái: {props.paymentStatus === 'PAID' ? 'Đã xác nhận thanh toán' : 'Chờ xác nhận thanh toán'}</p>
    {props.paymentStatus !== 'PAID' && props.qrUrl ? <Image unoptimized width={256} height={256} className="mx-auto my-6 h-64 w-64" src={props.qrUrl} alt={`Mã QR chuyển khoản cho đơn ${props.orderCode}`} /> : null}
    {!props.qrUrl && props.paymentStatus !== 'PAID' ? <p className="my-6 text-amber-800">Tài khoản ngân hàng chưa được cấu hình.</p> : null}
    <dl className="grid grid-cols-2 gap-3 border-t pt-5 text-sm">
      <dt>Số tiền</dt><dd className="text-right font-semibold">{formatVND(props.amount)}</dd>
      <dt>Ngân hàng</dt><dd className="text-right">{props.bankName || '—'}</dd>
      <dt>Số tài khoản</dt><dd className="text-right">{props.accountNo || '—'}</dd>
      <dt>Chủ tài khoản</dt><dd className="text-right">{props.accountName || '—'}</dd>
      <dt>Nội dung chuyển khoản</dt><dd className="text-right font-semibold">{props.orderCode}</dd>
    </dl>
    <p className="mt-5 text-xs text-muted-gray">Sau khi chuyển khoản, vui lòng chờ cửa hàng xác nhận giao dịch.</p>
    <Link href="/" className="mt-5 inline-block text-sm underline">Tiếp tục mua sắm</Link>
  </section>;
}
