// frontend/src/api/chatSocket.ts
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './auth';

let socket: Socket | null = null;
const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ?? 'http://localhost:5000';


export function getChatSocket(): Socket {
  if (!socket) {
    const token = getAuthToken();
    socket = io(SOCKET_URL, {
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