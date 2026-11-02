import { notFound } from 'next/navigation';
import { prisma } from '@server/database/prisma';
import { getBankDetails, buildPaymentQrUrl } from '@server/modules/payment/qr.service';
import { PaymentCard } from '@client/components/payment/PaymentCard';

export const dynamic = 'force-dynamic';

export default async function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: {
    orderCode: true, totalAmount: true, paymentStatus: true,
  } });
  if (!order) notFound();
  const bank = getBankDetails();
  return <main className="px-4 py-12"><PaymentCard
    orderCode={order.orderCode} amount={order.totalAmount.toString()}
    qrUrl={buildPaymentQrUrl(bank, order.orderCode, order.totalAmount)}
    bankName={bank.bankId} accountNo={bank.accountNo} accountName={bank.accountName}
    paymentStatus={order.paymentStatus}
  /></main>;
}
