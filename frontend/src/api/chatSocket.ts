// frontend/src/api/chatSocket.ts
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './auth';

let socket: Socket | null = null;

export function getChatSocket(): Socket {
  if (!socket) {
    const token = getAuthToken();
    socket = io('http://localhost:5000', {
      auth: { token },
    });

    socket.on('connect_error', (err: Error) => {
      console.error('Socket connect error:', err.message);
    });
  }
  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}