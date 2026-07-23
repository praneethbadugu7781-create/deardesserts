import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Role } from '../types';
import bcrypt from 'bcryptjs';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/staff - List all staff
router.get('/', authenticateJWT, requireRole(['ADMIN']), async (_req, res: Response) => {
  try {
    const staffList = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(staffList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff members' });
  }
});

// POST /api/staff - Add employee (ADMIN)
router.post('/', authenticateJWT, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
        phone,
        branchId: req.user?.branchId,
      },
      select: { id: true, name: true, email: true, role: true, phone: true },
    });

    res.status(201).json(newUser);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'An employee with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

// GET /api/staff/attendance - Get attendance records
router.get('/attendance', authenticateJWT, requireRole(['ADMIN']), async (_req, res: Response) => {
  try {
    const attendance = await prisma.staffAttendance.findMany({
      include: { user: { select: { name: true, role: true } } },
      orderBy: { date: 'desc' },
      take: 50,
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff attendance' });
  }
});

// POST /api/staff/clock-in - Clock In / Clock Out
router.post('/clock-in', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existing = await prisma.staffAttendance.findFirst({
      where: { userId, date: { gte: todayStart } },
    });

    if (existing) {
      const updated = await prisma.staffAttendance.update({
        where: { id: existing.id },
        data: { clockOut: new Date() },
      });
      return res.json({ message: 'Clocked out successfully', attendance: updated });
    } else {
      const created = await prisma.staffAttendance.create({
        data: {
          userId,
          clockIn: new Date(),
          status: 'PRESENT',
        },
      });
      return res.json({ message: 'Clocked in successfully', attendance: created });
    }
  } catch (error) {
    res.status(500).json({ error: 'Clock-in failed' });
  }
});

export default router;
