import type { Prisma } from '@prisma/client';

export async function openOrderSupportRoom(
  tx: Prisma.TransactionClient,
  order: { id: string; orderCode: string },
  customerId: string | null,
): Promise<string | null> {
  if (!customerId) return null;
  const admin = await tx.user.findFirst({ where: { role: 'ADMIN', isBlocked: false }, select: { id: true }, orderBy: { createdAt: 'asc' } });
  const content = `Đơn hàng ${order.orderCode} đã được tạo. Bạn có thể chat với shop tại đây!`;
  const room = await tx.chatRoom.create({
    data: {
      orderId: order.id,
      customerId,
      ...(admin ? { assignedStaffId: admin.id, lastMessage: content } : {}),
    },
    select: { id: true },
  });
  if (admin) {
    await tx.message.create({ data: {
      roomId: room.id,
      senderId: admin.id,
      content,
      type: 'SYSTEM',
    } });
  }
  return room.id;
}
