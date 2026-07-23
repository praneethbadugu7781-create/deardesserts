import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { OrderStatus, PaymentMethod } from '../types';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';
import { emitOrderCreated, emitOrderStatusChanged } from '../socket';

const router = Router();
const prisma = new PrismaClient();

async function getNextTokenNumber(): Promise<{ tokenStr: string; seq: number }> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const countToday = await prisma.token.count({
    where: {
      createdAt: { gte: todayStart },
    },
  });

  const nextSeq = countToday + 101;
  return {
    tokenStr: `T-${nextSeq}`,
    seq: nextSeq,
  };
}

async function getNextBillNumber(): Promise<string> {
  const countAll = await prisma.bill.count();
  return `DD-${1020 + countAll + 1}`;
}

async function getNextOrderNumber(): Promise<string> {
  const countAll = await prisma.order.count();
  return `ORD-${1000 + countAll + 1}`;
}

// GET /api/orders
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, date } = req.query;

    const where: any = {};

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status as OrderStatus;
    }

    if (date && typeof date === 'string') {
      const selectedDate = new Date(date);
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      where.createdAt = {
        gte: selectedDate,
        lt: nextDate,
      };
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { token: { tokenNumber: { contains: search } } },
        { bill: { billNumber: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { menuItem: true } },
        token: true,
        bill: true,
        payments: true,
        cashier: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/tokens/live
router.get('/tokens/live', async (_req, res: Response) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const activeOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: todayStart },
        status: { in: ['NEW', 'PREPARING', 'READY'] },
      },
      include: {
        items: { include: { menuItem: true } },
        token: true,
        bill: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const preparingTokens = activeOrders
      .filter((o) => o.status === 'NEW' || o.status === 'PREPARING')
      .map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        tokenNumber: o.token?.tokenNumber,
        status: o.status,
        createdAt: o.createdAt,
        items: o.items.map((i) => ({ name: i.menuItem.name, quantity: i.quantity, notes: i.notes })),
      }));

    const readyTokens = activeOrders
      .filter((o) => o.status === 'READY')
      .map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        tokenNumber: o.token?.tokenNumber,
        status: o.status,
        readyAt: o.token?.readyAt || o.updatedAt,
      }));

    res.json({
      preparing: preparingTokens,
      ready: readyTokens,
      allActive: activeOrders,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live token display data' });
  }
});

// POST /api/orders
router.post('/', authenticateJWT, requireRole(['ADMIN', 'CASHIER']), async (req: AuthRequest, res: Response) => {
  try {
    const { items, paymentMethod, customerName, customerPhone, discountAmount, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!paymentMethod || !['CASH', 'UPI', 'CARD'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Valid payment method (CASH, UPI, CARD) required' });
    }

    let subtotal = 0;
    const orderItemsData = [];

    for (const it of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: it.menuItemId } });
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item with ID ${it.menuItemId} not found` });
      }

      const itemTotal = menuItem.price * it.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        menuItemId: menuItem.id,
        itemPrice: menuItem.price,
        quantity: it.quantity,
        totalPrice: itemTotal,
        notes: it.notes || '',
      });
    }

    const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
    const discount = discountAmount ? parseFloat(discountAmount) : 0;
    const netAmount = Math.max(0, subtotal + taxAmount - discount);

    const orderNum = await getNextOrderNumber();
    const { tokenStr, seq } = await getNextTokenNumber();
    const billNum = await getNextBillNumber();

    const newOrder = await prisma.order.create({
      data: {
        orderNumber: orderNum,
        branchId: req.user?.branchId,
        cashierId: req.user?.id,
        status: 'NEW',
        customerName: customerName || 'Guest',
        customerPhone: customerPhone || '',
        subtotal,
        taxAmount,
        discountAmount: discount,
        netAmount,
        notes,
        items: {
          create: orderItemsData,
        },
        token: {
          create: {
            tokenNumber: tokenStr,
            dailySeq: seq,
            status: 'NEW',
          },
        },
        bill: {
          create: {
            billNumber: billNum,
            subtotal,
            gstAmount: taxAmount,
            discount,
            totalAmount: netAmount,
            paymentMethod: paymentMethod as PaymentMethod,
          },
        },
        payments: {
          create: {
            method: paymentMethod as PaymentMethod,
            amount: netAmount,
            status: 'PAID',
          },
        },
      },
      include: {
        items: { include: { menuItem: true } },
        token: true,
        bill: true,
        payments: true,
        cashier: { select: { name: true } },
      },
    });

    emitOrderCreated(newOrder);

    res.status(201).json(newOrder);
  } catch (error: any) {
    console.error('Failed to process POS order:', error);
    res.status(500).json({ error: 'Failed to process POS order' });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['NEW', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { token: true, bill: true },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const previousStatus = existingOrder.status;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
        token: {
          update: {
            status: status as OrderStatus,
            ...(status === 'READY' && { readyAt: new Date() }),
            ...(status === 'COMPLETED' && { completedAt: new Date() }),
          },
        },
      },
      include: {
        items: { include: { menuItem: true } },
        token: true,
        bill: true,
      },
    });

    emitOrderStatusChanged(updatedOrder, previousStatus);

    res.json(updatedOrder);
  } catch (error) {
    console.error('Failed to update order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// POST /api/orders/:id/cancel
router.post('/:id/cancel', authenticateJWT, requireRole(['ADMIN', 'CASHIER']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        token: {
          update: { status: 'CANCELLED' },
        },
        bill: {
          update: {
            isCancelled: true,
            cancellationReason: reason || 'Cancelled by Cashier/Admin',
          },
        },
      },
      include: { token: true, bill: true },
    });

    emitOrderStatusChanged(updatedOrder, 'CANCELLED');

    res.json({ message: 'Order and Bill cancelled successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// POST /api/orders/:id/refund
router.post('/:id/refund', authenticateJWT, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { refundAmount } = req.body;

    const bill = await prisma.bill.findUnique({ where: { orderId: id } });
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found for order' });
    }

    const updatedBill = await prisma.bill.update({
      where: { id: bill.id },
      data: {
        isRefunded: true,
        refundAmount: refundAmount ? parseFloat(refundAmount) : bill.totalAmount,
      },
    });

    res.json({ message: 'Refund processed successfully', bill: updatedBill });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

export default router;
