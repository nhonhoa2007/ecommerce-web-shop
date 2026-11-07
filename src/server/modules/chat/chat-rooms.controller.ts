import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@server/database/prisma';
import { authOptions } from '@server/modules/auth/auth-options';
import { ChatService } from './chat.service';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    if (session.user.role === 'ADMIN' || session.user.role === 'STAFF') {
      if (session.user.role === 'STAFF' && !session.user.permissions?.includes('chat')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const rooms = await ChatService.getAdminChatRooms(session.user.id, session.user.role === 'STAFF');
      return NextResponse.json({ rooms });
    }
    const rooms = await prisma.chatRoom.findMany({
      where: { customerId: session.user.id },
      include: {
        order: { select: { orderCode: true } },
        assignedStaff: { select: { id: true, name: true, avatar: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { lastActiveAt: 'desc' },
    });
    return NextResponse.json({ rooms: rooms.map((room) => ({
      id: room.id,
      orderId: room.orderId,
      order: room.order,
      lastMessage: room.lastMessage,
      lastActiveAt: room.lastActiveAt.toISOString(),
      participants: room.assignedStaff ? [{ user: room.assignedStaff }] : [],
      _count: room._count,
    })) });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    return NextResponse.json({ error: 'Lỗi tải phòng chat' }, { status: 500 });
  }
}
