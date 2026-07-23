import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { OrderStatus, PaymentMethod } from '../types';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/analytics/dashboard - Real-time Executive Summary
router.get('/dashboard', authenticateJWT, requireRole(['ADMIN']), async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Aggregate Revenues
    const todayOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startOfToday }, status: { not: 'CANCELLED' } },
    });

    const yesterdayOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startOfYesterday, lt: startOfToday }, status: { not: 'CANCELLED' } },
    });

    const weekOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startOfWeek }, status: { not: 'CANCELLED' } },
    });

    const monthOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } },
    });

    const yearOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startOfYear }, status: { not: 'CANCELLED' } },
    });

    const todayRevenue = todayOrders.reduce((acc, o) => acc + o.netAmount, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((acc, o) => acc + o.netAmount, 0);
    const weeklyRevenue = weekOrders.reduce((acc, o) => acc + o.netAmount, 0);
    const monthlyRevenue = monthOrders.reduce((acc, o) => acc + o.netAmount, 0);
    const yearlyRevenue = yearOrders.reduce((acc, o) => acc + o.netAmount, 0);

    const totalOrders = todayOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(todayRevenue / totalOrders) : 0;
    
    // Growth calculation
    const dailyGrowthPercent = yesterdayRevenue > 0
      ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 * 10) / 10
      : 100;

    // Total Items Sold Today
    const todayItemsCount = await prisma.orderItem.aggregate({
      where: { order: { createdAt: { gte: startOfToday }, status: { not: 'CANCELLED' } } },
      _sum: { quantity: true },
    });

    res.json({
      revenue: {
        today: Math.round(todayRevenue),
        yesterday: Math.round(yesterdayRevenue),
        weekly: Math.round(weeklyRevenue),
        monthly: Math.round(monthlyRevenue),
        yearly: Math.round(yearlyRevenue),
        dailyGrowthPercent,
      },
      sales: {
        totalOrders,
        totalBills: totalOrders,
        totalItemsSold: todayItemsCount._sum.quantity || 0,
        averageOrderValue: avgOrderValue,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

// GET /api/analytics/peak-hours - Hourly Sales & Rush Timings Analysis
router.get('/peak-hours', authenticateJWT, requireRole(['ADMIN']), async (_req, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { createdAt: true, netAmount: true },
    });

    // Bucket by Hour (0 to 23)
    const hourlyBuckets = Array.from({ length: 24 }, (_, hour) => {
      const formattedHour = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
      return {
        hour,
        label: formattedHour,
        ordersCount: 0,
        revenue: 0,
      };
    });

    for (const o of orders) {
      const hr = new Date(o.createdAt).getHours();
      hourlyBuckets[hr].ordersCount += 1;
      hourlyBuckets[hr].revenue += o.netAmount;
    }

    // Sort to identify peak rush windows
    const peakWindows = [
      { window: '12 PM - 3 PM', label: 'Lunch Rush', orders: hourlyBuckets.slice(12, 15).reduce((a, b) => a + b.ordersCount, 0), revenue: hourlyBuckets.slice(12, 15).reduce((a, b) => a + b.revenue, 0) },
      { window: '4 PM - 6 PM', label: 'Tea & Snacks', orders: hourlyBuckets.slice(16, 18).reduce((a, b) => a + b.ordersCount, 0), revenue: hourlyBuckets.slice(16, 18).reduce((a, b) => a + b.revenue, 0) },
      { window: '6 PM - 8 PM', label: 'Evening Peak Rush', orders: hourlyBuckets.slice(18, 20).reduce((a, b) => a + b.ordersCount, 0), revenue: hourlyBuckets.slice(18, 20).reduce((a, b) => a + b.revenue, 0) },
      { window: '8 PM - 10 PM', label: 'Night Dessert Rush', orders: hourlyBuckets.slice(20, 22).reduce((a, b) => a + b.ordersCount, 0), revenue: hourlyBuckets.slice(20, 22).reduce((a, b) => a + b.revenue, 0) },
    ];

    res.json({
      hourlyGraph: hourlyBuckets,
      peakWindows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compute peak sales analysis' });
  }
});

// GET /api/analytics/item-sales - Top Selling & Least Selling Desserts
router.get('/item-sales', authenticateJWT, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { timeframe } = req.query; // daily, weekly, monthly, yearly

    let dateFilter: Date | undefined;
    const now = new Date();

    if (timeframe === 'daily') {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeframe === 'weekly') {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    } else if (timeframe === 'monthly') {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: { not: 'CANCELLED' },
          ...(dateFilter && { createdAt: { gte: dateFilter } }),
        },
      },
      include: { menuItem: true },
    });

    const itemMap = new Map<string, { id: string; name: string; category: string; qty: number; revenue: number }>();

    for (const item of orderItems) {
      const existing = itemMap.get(item.menuItemId) || {
        id: item.menuItemId,
        name: item.menuItem.name,
        category: item.menuItem.categoryId,
        qty: 0,
        revenue: 0,
      };

      existing.qty += item.quantity;
      existing.revenue += item.totalPrice;
      itemMap.set(item.menuItemId, existing);
    }

    const aggregatedList = Array.from(itemMap.values());
    aggregatedList.sort((a, b) => b.qty - a.qty);

    const topSelling = aggregatedList.slice(0, 5);
    const leastSelling = [...aggregatedList].reverse().slice(0, 5);

    res.json({
      allItems: aggregatedList,
      topSelling,
      leastSelling,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item-wise sales analytics' });
  }
});

// GET /api/analytics/payments - Payment Method Distribution
router.get('/payments', authenticateJWT, requireRole(['ADMIN']), async (_req, res: Response) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayBills = await prisma.bill.findMany({
      where: {
        createdAt: { gte: startOfToday },
        isCancelled: false,
      },
    });

    let cashTotal = 0;
    let upiTotal = 0;
    let cardTotal = 0;

    for (const b of todayBills) {
      if (b.paymentMethod === 'CASH') cashTotal += b.totalAmount;
      if (b.paymentMethod === 'UPI') upiTotal += b.totalAmount;
      if (b.paymentMethod === 'CARD') cardTotal += b.totalAmount;
    }

    const grandTotal = cashTotal + upiTotal + cardTotal;

    res.json({
      today: {
        cash: Math.round(cashTotal),
        upi: Math.round(upiTotal),
        card: Math.round(cardTotal),
        total: Math.round(grandTotal),
      },
      chartData: [
        { name: 'UPI Payment', value: Math.round(upiTotal), color: '#3B82F6' },
        { name: 'Cash Collection', value: Math.round(cashTotal), color: '#10B981' },
        { name: 'Card Machine', value: Math.round(cardTotal), color: '#8B5CF6' },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment analytics' });
  }
});

export default router;
