import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 
      (process.env.NODE_ENV === 'production'
        ? 'https://deardesserts.onrender.com'
        : 'http://localhost:5000');
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Dear Desserts WebSocket Server:', socket?.id);
    });
  }
  return socket;
};
