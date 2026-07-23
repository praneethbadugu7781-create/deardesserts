import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/menu/categories - Public / Cashier / Admin
router.get('/categories', async (_req, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { items: true } },
      },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/menu/items - List all menu items with search & category filter
router.get('/items', async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, search, isAvailable } = req.query;

    const where: any = {};
    if (categoryId && typeof categoryId === 'string') {
      where.categoryId = categoryId;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }

    const items = await prisma.menuItem.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// POST /api/menu/items - Create item (ADMIN only)
router.post('/items', authenticateJWT, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, categoryId, price, taxPercent, description, imageUrl, isCombo, preparationMinutes } = req.body;

    if (!name || !categoryId || price === undefined) {
      return res.status(400).json({ error: 'Name, Category ID, and Price are required' });
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        categoryId,
        price: parseFloat(price),
        taxPercent: taxPercent ? parseFloat(taxPercent) : 5.0,
        description,
        imageUrl,
        isCombo: Boolean(isCombo),
        preparationMinutes: preparationMinutes ? parseInt(preparationMinutes) : 5,
      },
      include: { category: true },
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// PUT /api/menu/items/:id - Update item details (ADMIN only)
router.put('/items/:id', authenticateJWT, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, categoryId, price, taxPercent, description, imageUrl, isAvailable, preparationMinutes } = req.body;

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(categoryId && { categoryId }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(taxPercent !== undefined && { taxPercent: parseFloat(taxPercent) }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
        ...(preparationMinutes !== undefined && { preparationMinutes: parseInt(preparationMinutes) }),
      },
      include: { category: true },
    });

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// PATCH /api/menu/items/:id/stock - Toggle Availability (ADMIN / CASHIER)
router.patch('/items/:id/stock', authenticateJWT, requireRole(['ADMIN', 'CASHIER']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: Boolean(isAvailable) },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item availability status' });
  }
});

// DELETE /api/menu/items/:id - Delete item (ADMIN only)
router.delete('/items/:id', authenticateJWT, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({ where: { id } });
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// GET /api/menu/offers - Offers & Promotions
router.get('/offers', async (_req, res: Response) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { isActive: true },
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promotional offers' });
  }
});

export default router;
