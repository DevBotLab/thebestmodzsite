import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';

let io: SocketServer;

export function initSocket(httpServer: HTTPServer) {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Требуется авторизация'));
      const { verifyToken } = await import('./auth');
      const payload = await verifyToken(token);
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error('Неверный токен'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    console.log(`Socket connected: user ${user.userId}`);

    socket.on('ticket:join', (ticketId: string) => {
      socket.join(`ticket:${ticketId}`);
    });

    socket.on('ticket:leave', (ticketId: string) => {
      socket.leave(`ticket:${ticketId}`);
    });

    socket.on('ticket:message', async ({ ticketId, text }: { ticketId: string; text: string }) => {
      if (!text?.trim()) return;
      const { prisma } = await import('./prisma');
      try {
        const message = await prisma.ticketMessage.create({
          data: { ticketId: parseInt(ticketId), userId: user.userId, text, isAdmin: user.isAdmin || false },
        });
        io.to(`ticket:${ticketId}`).emit('ticket:newMessage', message);
        if (!user.isAdmin) {
          io.to('admin:notifications').emit('newTicketMessage', { ticketId, userId: user.userId, text: text.substring(0, 50) });
        }
      } catch (e) {
        socket.emit('error', 'Ошибка отправки сообщения');
      }
    });

    socket.on('ticket:typing', ({ ticketId, isTyping }: { ticketId: string; isTyping: boolean }) => {
      socket.to(`ticket:${ticketId}`).emit('ticket:typing', { userId: user.userId, isTyping });
    });

    if (user.isAdmin) {
      socket.join('admin:notifications');
    }
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.io не инициализирован');
  return io;
}
