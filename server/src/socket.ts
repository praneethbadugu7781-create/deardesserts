import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export const initSocket = (io: SocketIOServer) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to WebSocket: ${socket.id}`);

    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`📡 Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = (): SocketIOServer => {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized');
  }
  return ioInstance;
};

// Real-time broadcast helpers
export const emitOrderCreated = (orderData: any) => {
  if (ioInstance) {
    ioInstance.emit('order_created', orderData);
    ioInstance.emit('token_updated', { type: 'NEW', order: orderData });
    console.log(`📡 Broadcasted order_created for ${orderData.orderNumber}`);
  }
};

export const emitOrderStatusChanged = (orderData: any, previousStatus: string) => {
  if (ioInstance) {
    ioInstance.emit('order_status_updated', orderData);
    ioInstance.emit('token_updated', { type: 'STATUS_CHANGE', order: orderData, previousStatus });
    
    if (orderData.status === 'READY') {
      ioInstance.emit('token_ready', {
        tokenNumber: orderData.token?.tokenNumber,
        orderNumber: orderData.orderNumber,
        customerName: orderData.customerName,
      });
      console.log(`🔊 Broadcasted token_ready for ${orderData.token?.tokenNumber}`);
    }
  }
};

export const emitInventoryAlert = (inventoryItem: any) => {
  if (ioInstance) {
    ioInstance.emit('inventory_alert', inventoryItem);
  }
};
