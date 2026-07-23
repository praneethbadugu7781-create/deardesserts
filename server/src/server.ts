import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { initSocket } from './socket';
import authRoutes from './routes/auth';
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import inventoryRoutes from './routes/inventory';
import analyticsRoutes from './routes/analytics';
import staffRoutes from './routes/staff';
import reportRoutes from './routes/reports';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});
initSocket(io);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'Dear Desserts Smart Outlet Management Server',
    database: 'MongoDB Atlas Connected',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/reports', reportRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Global Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

server.listen(PORT, () => {
  console.log(`🚀 Dear Desserts Express Server listening on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server running on ws://localhost:${PORT}`);
});
