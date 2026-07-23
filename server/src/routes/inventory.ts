import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { InventoryCategory } from '../types';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';
import { emitInventoryAlert } from '../socket';

const router = Router();
const prisma = new PrismaClient();

// GET /api/inventory/items - List all inventory stock
router.get('/items', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.query;

    const where: any = {};
    if (category && (category === 'INGREDIENT' || category === 'PACKAGING')) {
      where.category = category as InventoryCategory;
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    const lowStockItems = items.filter((item) => item.currentStock <= item.minStockAlert);

    res.json({
      items,
      totalCount: items.length,
      lowStockCount: lowStockItems.length,
      lowStockItems,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
});

// GET /api/inventory/alerts - Low Stock Warning Alerts
router.get('/alerts', authenticateJWT, async (_req, res: Response) => {
  try {
    const items = await prisma.inventoryItem.findMany();
    const lowStockAlerts = items
      .filter((item) => item.currentStock <= item.minStockAlert)
      .map((item) => ({
        id: item.id,
        name: item.name,
        currentStock: item.currentStock,
        minStockAlert: item.minStockAlert,
        unit: item.unit,
        category: item.category,
        message: `Only ${item.currentStock} ${item.unit} ${item.name} remaining in stock!`,
      }));

    res.json(lowStockAlerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
});

// POST /api/inventory/items - Add new inventory item (ADMIN)
router.post('/items', authenticateJWT, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, unit, currentStock, minStockAlert, unitCost } = req.body;

    if (!name || !category || !unit) {
      return res.status(400).json({ error: 'Name, Category, and Unit are required' });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        category: category as InventoryCategory,
        unit,
        currentStock: parseFloat(currentStock || '0'),
        minStockAlert: parseFloat(minStockAlert || '5'),
        unitCost: parseFloat(unitCost || '0'),
        branchId: req.user?.branchId,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// POST /api/inventory/restock - Restock quantity
router.post('/restock', authenticateJWT, requireRole(['ADMIN', 'CASHIER']), async (req: AuthRequest, res: Response) => {
  try {
    const { inventoryId, quantity, notes } = req.body;

    if (!inventoryId || !quantity || parseFloat(quantity) <= 0) {
      return res.status(400).json({ error: 'Valid inventoryId and positive quantity required' });
    }

    const qty = parseFloat(quantity);

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: inventoryId },
      data: {
        currentStock: { increment: qty },
      },
    });

    await prisma.inventoryUsage.create({
      data: {
        inventoryId,
        quantityUsed: -qty, // negative indicates restock
        reason: `RESTOCK: ${notes || 'Manual stock update'}`,
      },
    });

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to restock inventory item' });
  }
});

// POST /api/inventory/wastage - Record wastage
router.post('/wastage', authenticateJWT, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { inventoryId, quantity, reason } = req.body;

    const qty = parseFloat(quantity);

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: inventoryId },
      data: {
        currentStock: { decrement: qty },
      },
    });

    await prisma.inventoryUsage.create({
      data: {
        inventoryId,
        quantityUsed: qty,
        reason: `WASTAGE: ${reason || 'Spoilage / Damaged'}`,
      },
    });

    if (updatedItem.currentStock <= updatedItem.minStockAlert) {
      emitInventoryAlert(updatedItem);
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record inventory wastage' });
  }
});

export default router;
