'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(token?: string): Socket {
  if (!socket && token) {
    socket = io(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
  }
  return socket!;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
