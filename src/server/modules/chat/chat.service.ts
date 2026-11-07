import { prisma } from '@server/database/prisma';
import { getStaffPermissions } from '@server/modules/admin/permission.service';
import type { ChatRoom, Message } from '@shared/types';
import { canAccessChatRoom } from './chat-room-scope';

const roomInclude = {
  order: { select: { orderCode: true } },
  customer: { select: { id: true, name: true, avatar: true } },
  assignedStaff: { select: { id: true, name: true, avatar: true } },
  _count: { select: { messages: true } },
} as const;

export class ChatService {
  static async getAdminChatRooms(userId: string, staffOnly = false): Promise<ChatRoom[]> {
    const rooms = await prisma.chatRoom.findMany({
      where: staffOnly ? { assignedStaffId: userId } : {},
      include: roomInclude,
      orderBy: { lastActiveAt: 'desc' },
    });
    return rooms.map((room) => ({
      id: room.id,
      orderId: room.orderId,
      order: room.order,
      lastMessage: room.lastMessage,
      lastActiveAt: room.lastActiveAt.toISOString(),
      participants: [room.customer || room.assignedStaff].filter((person): person is NonNullable<typeof person> => person !== null)
        .map((user) => ({ user })),
      _count: room._count,
    }));
  }

  static async getCustomerChatRooms(userId: string): Promise<ChatRoom[]> {
    const rooms = await prisma.chatRoom.findMany({
      where: { customerId: userId },
      include: roomInclude,
      orderBy: { lastActiveAt: 'desc' },
    });
    return rooms.map((room) => ({
      id: room.id,
      orderId: room.orderId,
      order: room.order,
      lastMessage: room.lastMessage,
      lastActiveAt: room.lastActiveAt.toISOString(),
      participants: room.assignedStaff ? [{ user: room.assignedStaff }] : [],
      _count: room._count,
    }));
  }

  static async getRoomConversation(roomId: string, userId: string): Promise<{
    allowed: boolean;
    messages: Message[];
    otherName: string;
    order?: { orderCode: string } | null;
  }> {
    const [room, user] = await Promise.all([
      prisma.chatRoom.findUnique({ where: { id: roomId }, include: roomInclude }),
      prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    ]);
    if (!room || !user) return { allowed: false, messages: [], otherName: '', order: null };
    const permissions = user.role === 'STAFF' ? await getStaffPermissions(userId) : [];
    if (!canAccessChatRoom({ id: userId, role: user.role, permissions }, room)) {
      return { allowed: false, messages: [], otherName: '', order: null };
    }
    if (user.role === 'ADMIN' && !room.assignedStaffId) {
      await prisma.chatRoom.updateMany({ where: { id: roomId, assignedStaffId: null }, data: { assignedStaffId: userId } });
    }
    const rawMessages = await prisma.message.findMany({
      where: { roomId },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    return {
      allowed: true,
      messages: rawMessages.map((message) => ({ ...message, createdAt: message.createdAt.toISOString() })),
      otherName: (room.customerId === userId ? room.assignedStaff?.name : room.customer?.name) || room.order?.orderCode || 'Chat',
      order: room.order,
    };
  }
}
