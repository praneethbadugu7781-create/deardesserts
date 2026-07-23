import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/reports/sales - Comprehensive Report Generation
router.get('/sales', authenticateJWT, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, reportType } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 86400 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: {
        bill: true,
        items: { include: { menuItem: true } },
        token: true,
        cashier: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
    const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');

    const totalNetRevenue = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((acc, o) => acc + o.netAmount, 0);

    const totalTaxCollected = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((acc, o) => acc + o.taxAmount, 0);

    const totalDiscountsGiven = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((acc, o) => acc + o.discountAmount, 0);

    res.json({
      period: { start, end },
      summary: {
        totalOrders,
        completedOrdersCount: completedOrders.length,
        cancelledOrdersCount: cancelledOrders.length,
        totalNetRevenue: Math.round(totalNetRevenue),
        totalTaxCollected: Math.round(totalTaxCollected),
        totalDiscountsGiven: Math.round(totalDiscountsGiven),
        avgOrderValue: totalOrders > 0 ? Math.round(totalNetRevenue / totalOrders) : 0,
      },
      ordersList: orders.map((o) => ({
        orderNumber: o.orderNumber,
        billNumber: o.bill?.billNumber || 'N/A',
        tokenNumber: o.token?.tokenNumber || 'N/A',
        date: o.createdAt,
        customerName: o.customerName,
        paymentMethod: o.bill?.paymentMethod || 'N/A',
        subtotal: o.subtotal,
        tax: o.taxAmount,
        discount: o.discountAmount,
        netTotal: o.netAmount,
        status: o.status,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET /api/reports/export/csv - Download Report as CSV format
router.get('/export/csv', authenticateJWT, requireRole(['ADMIN']), async (_req, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { bill: true, token: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    let csvContent = 'Bill No,Order No,Token No,Date,Customer,Payment Method,Subtotal,Tax,Discount,Total,Status\n';

    for (const o of orders) {
      const dateStr = new Date(o.createdAt).toISOString().replace(/T/, ' ').replace(/\..+/, '');
      csvContent += `"${o.bill?.billNumber || ''}","${o.orderNumber}","${o.token?.tokenNumber || ''}","${dateStr}","${o.customerName || 'Guest'}","${o.bill?.paymentMethod || ''}",${o.subtotal},${o.taxAmount},${o.discountAmount},${o.netAmount},"${o.status}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Dear_Desserts_Sales_Report.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export CSV report' });
  }
});

export default router;
