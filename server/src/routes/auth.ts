import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rateLimiter';
import { sendPasswordResetOtpEmail } from '../lib/resend';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dear_desserts_super_secret_jwt_key_2026_qsr';

// Rate limiters for security
const loginLimiter = createRateLimiter(15, 15 * 60 * 1000); // 15 attempts per 15 min
const resetLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 min

/**
 * Helper to resolve user account from MongoDB Atlas by email or alias
 */
async function findUserByEmailOrRole(targetEmail: string) {
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: targetEmail },
        targetEmail === 'deardesserts.in@gmail.com' ? { role: 'ADMIN' } : {},
        targetEmail === 'admin@deardesserts.com' ? { role: 'ADMIN' } : {},
        targetEmail === 'cashier@deardesserts.com' ? { role: 'CASHIER' } : {},
        targetEmail === 'kitchen@deardesserts.com' ? { role: 'KITCHEN_STAFF' } : {},
      ],
    },
    include: { branch: true },
  });

  return user;
}

// POST /api/auth/login
router.post('/login', loginLimiter, async (req: AuthRequest, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const targetEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanPass) {
      return res.status(400).json({ error: 'Password cannot be empty' });
    }

    console.log(`🔐 [AUTH LOG] Login attempt for: "${targetEmail}" from IP: ${clientIp}`);

    // Look up user in MongoDB Atlas
    let user = await findUserByEmailOrRole(targetEmail);

    // If default user doesn't exist in MongoDB yet, auto-create it with default credentials
    if (!user) {
      if (targetEmail === 'deardesserts.in@gmail.com' || targetEmail === 'admin@deardesserts.com') {
        const defaultHash = await bcrypt.hash('admin123', 10);
        user = await prisma.user.create({
          data: {
            name: 'Store Manager',
            email: 'deardesserts.in@gmail.com',
            password: defaultHash,
            role: 'ADMIN',
          },
          include: { branch: true },
        });
      } else if (targetEmail === 'cashier@deardesserts.com') {
        const defaultHash = await bcrypt.hash('cashier123', 10);
        user = await prisma.user.create({
          data: {
            name: 'POS Cashier',
            email: 'cashier@deardesserts.com',
            password: defaultHash,
            role: 'CASHIER',
          },
          include: { branch: true },
        });
      } else if (targetEmail === 'kitchen@deardesserts.com') {
        const defaultHash = await bcrypt.hash('kitchen123', 10);
        user = await prisma.user.create({
          data: {
            name: 'Head Chef',
            email: 'kitchen@deardesserts.com',
            password: defaultHash,
            role: 'KITCHEN_STAFF',
          },
          include: { branch: true },
        });
      }
    }

    if (!user || !user.isActive) {
      console.warn(`❌ [AUTH FAIL] User not found or inactive: "${targetEmail}" from IP: ${clientIp}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify bcrypt password against stored hash in MongoDB Atlas
    const isMatch = await bcrypt.compare(cleanPass, user.password).catch(() => false);

    if (!isMatch) {
      console.warn(`❌ [AUTH FAIL] Invalid password for: "${targetEmail}" from IP: ${clientIp}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log(`✅ [AUTH SUCCESS] Login successful for: "${user.email}" (${user.role})`);

    // Generate JWT Token (Expires in 7 Days)
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      branchId: user.branchId || 'b1',
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch || { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
      },
    });
  } catch (error: any) {
    console.error('💥 [AUTH ERROR] Login handler exception:', error);
    res.status(500).json({ error: 'Internal Server Error during login' });
  }
});

// POST /api/auth/change-password (Authenticated logged-in user)
router.post('/change-password', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const cleanNewPass = newPassword.trim();
    if (cleanNewPass.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const userId = req.user?.id;
    const userEmail = req.user?.email;

    // Find user in MongoDB Atlas
    let user = null;
    if (userId && userId.length === 24) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!user && userEmail) {
      user = await findUserByEmailOrRole(userEmail);
    }

    if (!user) {
      return res.status(404).json({ error: 'User account not found in database' });
    }

    // Verify current password
    const isCurrentMatch = await bcrypt.compare(currentPassword.trim(), user.password).catch(() => false);
    if (!isCurrentMatch) {
      console.warn(`❌ [AUTH FAIL] Password change failed: Incorrect current password for user "${user.email}"`);
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password EXACTLY ONCE with 10 salt rounds
    const hashedPassword = await bcrypt.hash(cleanNewPass, 10);

    // Update password in MongoDB Atlas
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`✅ [AUTH SUCCESS] Password updated in MongoDB Atlas for user "${user.email}"`);

    res.json({ message: 'Password updated successfully! Please use your new password to log in on all devices.' });
  } catch (error: any) {
    console.error('💥 [AUTH ERROR] Change password exception:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// In-memory OTP storage for password reset
const otpStore: Record<string, { code: string; expiresAt: number }> = {};

// POST /api/auth/forgot-password
router.post('/forgot-password', resetLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    const targetEmail = (email || '').trim().toLowerCase();

    if (!targetEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate random 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore[targetEmail] = { code: otpCode, expiresAt };

    console.log(`🔑 [AUTH OTP] Verification OTP generated for "${targetEmail}": ${otpCode}`);

    // Dispatch OTP email via Resend
    await sendPasswordResetOtpEmail({ email: targetEmail, otpCode }).catch((err) => {
      console.warn('Resend email notice:', err.message);
    });

    res.json({ message: `Verification code sent to ${targetEmail}` });
  } catch (error: any) {
    console.error('💥 [AUTH ERROR] Forgot password exception:', error);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', resetLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP code, and new password are required' });
    }

    const cleanNewPass = newPassword.trim();
    if (cleanNewPass.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const key = email.trim().toLowerCase();
    const record = otpStore[key];

    if (!record || record.code !== otpCode.trim() || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new code.' });
    }

    delete otpStore[key];

    // Hash new password EXACTLY ONCE with 10 salt rounds
    const hashedPassword = await bcrypt.hash(cleanNewPass, 10);

    // Find or create user in MongoDB Atlas
    let user = await findUserByEmailOrRole(key);

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      console.log(`✅ [AUTH SUCCESS] Password reset completed in MongoDB Atlas for user "${user.email}"`);
    } else {
      user = await prisma.user.create({
        data: {
          name: key.includes('admin') ? 'Store Manager' : 'Staff Member',
          email: key,
          password: hashedPassword,
          role: key.includes('admin') ? 'ADMIN' : 'CASHIER',
        },
        include: { branch: true },
      });
      console.log(`✅ [AUTH SUCCESS] Created new user with reset password in MongoDB Atlas for "${user?.email || key}"`);
    }

    res.json({ message: 'Password reset successfully! You can now log in with your new password on any device.' });
  } catch (error: any) {
    console.error('💥 [AUTH ERROR] Reset password exception:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    let user = null;
    if (userId && userId.length === 24) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          branch: true,
          createdAt: true,
        },
      });
    }

    if (!user && userEmail) {
      user = await findUserByEmailOrRole(userEmail);
    }

    if (user) {
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch || { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
      });
    }

    return res.json({
      id: req.user?.id || 'user_id',
      name: req.user?.name || 'Staff Member',
      email: req.user?.email || '',
      role: req.user?.role || 'ADMIN',
      branch: { id: 'b1', name: 'Dear Desserts - Bhavanipuram', code: 'DD-01' },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current user profile' });
  }
});

export default router;
