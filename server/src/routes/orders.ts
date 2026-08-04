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

// GET /api/orders - Get all orders
router.get('/', async (req: AuthRequest, res: Response) => {
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

// GET /api/orders/tokens/live - Live token display for token screen
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

// POST /api/orders - Create Order & Bill (CASHIER / ADMIN)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { items, paymentMethod, customerName, customerPhone, discountAmount, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    const payMethod = (paymentMethod || 'UPI').toUpperCase();

    let subtotal = 0;
    const orderItemsData = [];

    // Ensure default category exists in DB
    let defaultCat = await prisma.category.findFirst().catch(() => null);
    if (!defaultCat) {
      defaultCat = await prisma.category.create({
        data: { name: 'Desserts', slug: 'desserts' },
      }).catch(() => null);
    }

    for (const it of items) {
      let menuItem = null;

      // 1. Try lookup by ObjectId if valid
      if (it.menuItemId && typeof it.menuItemId === 'string' && it.menuItemId.length === 24) {
        menuItem = await prisma.menuItem.findUnique({ where: { id: it.menuItemId } }).catch(() => null);
      }

      // 2. Try lookup by item name
      if (!menuItem && (it.name || it.menuItem?.name)) {
        const searchName = it.name || it.menuItem?.name;
        menuItem = await prisma.menuItem.findFirst({ where: { name: searchName } }).catch(() => null);
      }

      // 3. Auto-create MenuItem in DB if missing so relationship works 100%
      if (!menuItem) {
        const itemName = it.name || it.menuItem?.name || 'Dessert Special';
        const itemPrice = parseFloat(it.price || it.itemPrice || 150);

        if (defaultCat) {
          menuItem = await prisma.menuItem.create({
            data: {
              name: itemName,
              price: itemPrice,
              categoryId: defaultCat.id,
              isAvailable: true,
            },
          }).catch(() => null);
        }
      }

      const finalPrice = menuItem ? menuItem.price : parseFloat(it.price || it.itemPrice || 150);
      const qty = parseInt(it.quantity) || 1;
      const itemTotal = finalPrice * qty;
      subtotal += itemTotal;

      if (menuItem) {
        orderItemsData.push({
          menuItemId: menuItem.id,
          itemPrice: finalPrice,
          quantity: qty,
          totalPrice: itemTotal,
          notes: it.notes || '',
        });
      }
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
        status: 'NEW',
        customerName: customerName || 'Guest Customer',
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
            paymentMethod: payMethod,
          },
        },
        payments: {
          create: {
            method: payMethod,
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
      },
    });

    // Emit live WebSocket event to update Admin Dashboard & KDS instantly
    emitOrderCreated(newOrder);

    res.status(201).json(newOrder);
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order: ' + (error?.message || 'Unknown error') });
  }
});

// PATCH /api/orders/:id/status - Update Status (KDS / Admin)
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['NEW', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { menuItem: true } },
        token: true,
        bill: true,
      },
    });

    if (updatedOrder.token) {
      const tokenStatus = status === 'COMPLETED' ? 'COMPLETED' : status === 'READY' ? 'READY' : 'NEW';
      await prisma.token.update({
        where: { orderId: id },
        data: {
          status: tokenStatus,
          ...(status === 'READY' && { readyAt: new Date() }),
          ...(status === 'COMPLETED' && { completedAt: new Date() }),
        },
      });
    }

    emitOrderStatusChanged(updatedOrder, status);

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
