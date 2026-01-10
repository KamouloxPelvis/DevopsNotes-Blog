import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'https://devopsnotes.org'
  : 'http://localhost:5000';

export const getChatSocket = () => {
  if (!socket) {
    // Utilise la variable SOCKET_URL dynamique
    socket = io(SOCKET_URL, {
      withCredentials: true, // IMPORTANT pour envoyer le cookie de session
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
