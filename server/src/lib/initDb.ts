import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Ensures default branch and accounts exist in MongoDB Atlas on server startup.
 * Fixes missing user records so bcrypt password operations work seamlessly.
 */
export async function ensureDefaultAccountsExist() {
  try {
    console.log('🔄 Checking MongoDB Atlas default accounts...');

    // 1. Ensure Flagship Branch
    let branch = await prisma.branch.findUnique({ where: { code: 'DD-VIJ-01' } });
    if (!branch) {
      branch = await prisma.branch.create({
        data: {
          name: 'Dear Desserts - Bhavanipuram',
          code: 'DD-VIJ-01',
          address: 'Swathi Theatre Road, Opp. Sri Balaji Sweets, Bhavanipuram, Vijayawada, AP 520012',
          phone: '+91 98765 43210',
        },
      });
      console.log('✅ Created default branch in MongoDB:', branch.name);
    }

    // 2. Ensure Admin Account (deardesserts.in@gmail.com)
    const adminEmail = 'deardesserts.in@gmail.com';
    const adminUser = await prisma.user.findFirst({
      where: { OR: [{ email: adminEmail }, { role: 'ADMIN' }] },
    });

    if (!adminUser) {
      const defaultAdminPass = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          name: 'Store Manager',
          email: adminEmail,
          password: defaultAdminPass,
          role: 'ADMIN',
          branchId: branch.id,
          isActive: true,
        },
      });
      console.log('✅ Created default Admin account in MongoDB Atlas:', adminEmail);
    }

    // 3. Ensure Cashier Account (cashier@deardesserts.com)
    const cashierEmail = 'cashier@deardesserts.com';
    const cashierUser = await prisma.user.findFirst({ where: { email: cashierEmail } });
    if (!cashierUser) {
      const defaultCashierPass = await bcrypt.hash('cashier123', 10);
      await prisma.user.create({
        data: {
          name: 'POS Cashier',
          email: cashierEmail,
          password: defaultCashierPass,
          role: 'CASHIER',
          branchId: branch.id,
          isActive: true,
        },
      });
      console.log('✅ Created default Cashier account in MongoDB Atlas:', cashierEmail);
    }

    // 4. Ensure Kitchen Account (kitchen@deardesserts.com)
    const kitchenEmail = 'kitchen@deardesserts.com';
    const kitchenUser = await prisma.user.findFirst({ where: { email: kitchenEmail } });
    if (!kitchenUser) {
      const defaultKitchenPass = await bcrypt.hash('kitchen123', 10);
      await prisma.user.create({
        data: {
          name: 'Head Chef',
          email: kitchenEmail,
          password: defaultKitchenPass,
          role: 'KITCHEN_STAFF',
          branchId: branch.id,
          isActive: true,
        },
      });
      console.log('✅ Created default Kitchen account in MongoDB Atlas:', kitchenEmail);
    }

    console.log('✨ MongoDB Atlas default accounts verification complete.');
  } catch (error) {
    console.error('❌ Failed to verify default MongoDB accounts on startup:', error);
  }
}
