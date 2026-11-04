export interface PaymentUpdateStore {
  order: {
    updateMany(args: object): Promise<{ count: number }>;
  };
}

export async function confirmOrderPayment(db: PaymentUpdateStore, orderId: string): Promise<boolean> {
  const result = await db.order.updateMany({
    where: { id: orderId, paymentStatus: 'UNPAID', status: 'PENDING' },
    data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
  });
  return result.count === 1;
}
