import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'https://blog.devopsnotes.org'
  : 'http://localhost:5000'

export const getChatSocket = () => {
  if (!socket) {
    console.log("Socket connectée à :", SOCKET_URL)
    socket = io(SOCKET_URL, {
      path: '/socket.io/',
      withCredentials: true,
      transports: ['websocket', 'polling'] 
    });
  }
  return socket;
};

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
