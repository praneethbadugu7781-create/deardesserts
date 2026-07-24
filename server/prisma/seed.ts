import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing all fake data from Dear Desserts database...');

  // Delete all existing data
  await prisma.payment.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.token.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared all orders, tokens, menu items, categories, inventory, and staff');

  // 1. Create Default Branch
  const branch = await prisma.branch.upsert({
    where: { code: 'DD-01' },
    update: {},
    create: {
      name: 'Dear Desserts - Flagship Outlet',
      code: 'DD-01',
      address: 'Flagship Store',
      phone: '+91 98765 43210',
    },
  });

  // 2. Create Base Staff Logins (Admin, Cashier, Kitchen)
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const kitchenPassword = await bcrypt.hash('kitchen123', 10);

  await prisma.user.create({
    data: {
      name: 'Admin Manager',
      email: 'admin@deardesserts.com',
      password: hashedPassword,
      role: 'ADMIN',
      branchId: branch.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Cashier Staff',
      email: 'cashier@deardesserts.com',
      password: cashierPassword,
      role: 'CASHIER',
      branchId: branch.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Kitchen Staff',
      email: 'kitchen@deardesserts.com',
      password: kitchenPassword,
      role: 'KITCHEN_STAFF',
      branchId: branch.id,
    },
  });

  console.log('✅ Created fresh default accounts: Admin, Cashier, Kitchen Staff');
  console.log('🎉 Database reset complete! All fake menu items, categories, and orders removed.');
}

main()
  .catch((e) => {
    console.error('❌ Error clearing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
