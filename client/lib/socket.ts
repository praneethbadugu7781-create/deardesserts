import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = typeof window !== 'undefined' ? window.location.protocol + '//' + window.location.hostname + ':5000' : 'http://localhost:5000';
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
