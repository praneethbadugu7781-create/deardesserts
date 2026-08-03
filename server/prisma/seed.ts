import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Dear Desserts (Bhavanipuram, Vijayawada) Database...');

  // Clear existing data
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

  // 1. Create Flagship Branch
  const branch = await prisma.branch.upsert({
    where: { code: 'DD-VIJ-01' },
    update: {
      name: 'Dear Desserts - Bhavanipuram',
      address: 'Swathi Theatre Road, Opp. Sri Balaji Sweets, Bhavanipuram, Vijayawada, Andhra Pradesh 520012',
    },
    create: {
      name: 'Dear Desserts - Bhavanipuram',
      code: 'DD-VIJ-01',
      address: 'Swathi Theatre Road, Opp. Sri Balaji Sweets, Bhavanipuram, Vijayawada, Andhra Pradesh 520012',
      phone: '+91 98765 43210',
    },
  });

  // 2. Create Default Accounts (Admin, Cashier, Kitchen Staff)
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const kitchenPassword = await bcrypt.hash('kitchen123', 10);

  await prisma.user.create({
    data: {
      name: 'Store Manager',
      email: 'deardesserts.in@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      branchId: branch.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'POS Cashier',
      email: 'cashier@deardesserts.com',
      password: cashierPassword,
      role: 'CASHIER',
      branchId: branch.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Head Chef',
      email: 'kitchen@deardesserts.com',
      password: kitchenPassword,
      role: 'KITCHEN_STAFF',
      branchId: branch.id,
    },
  });

  // 3. Create Menu Categories
  const categoriesData = [
    { name: 'Bubble Waffles', slug: 'bubble-waffles', icon: 'Grid', displayOrder: 1, description: 'Crispy, fluffy bubble waffles filled with gourmet toppings' },
    { name: 'Belgian Waffles', slug: 'belgian-waffles', icon: 'Grid', displayOrder: 2, description: 'Golden warm Belgian waffles smothered in dark & milk chocolate' },
    { name: 'The Poppin Bowl', slug: 'pop-bowl', icon: 'IceCream', displayOrder: 3, description: 'Signature dessert pop bowls layered with cream & crunch' },
    { name: 'Brownie', slug: 'brownie', icon: 'IceCream', displayOrder: 4, description: 'Decadent chocolate brownies served warm' },
    { name: 'Specials', slug: 'specials', icon: 'Sparkles', displayOrder: 5, description: 'Chef special Matilda cake, Magnum obsession & Death by Chocolate' },
    { name: 'The Bowl Cakes', slug: 'bowl-cakes', icon: 'Cake', displayOrder: 6, description: 'Rich layered cake bowls packed with Rocher, Kunafa & Biscoff' },
    { name: 'The Crunch Corner', slug: 'savories', icon: 'Pizza', displayOrder: 7, description: 'Hot fries, chicken popcorn, chicken wings & cheesy chicken bun' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({ data: cat });
  }

  // 4. Create Menu Items (Original Dear Desserts Menu)
  const menuItemsData = [
    // Bubble Waffles
    { name: 'Triple trouble', categoryId: categories['bubble-waffles'].id, price: 180, taxPercent: 5.0, isAvailable: true, preparationMinutes: 6 },
    { name: 'Triple trouble with ice-cream', categoryId: categories['bubble-waffles'].id, price: 200, taxPercent: 5.0, isAvailable: true, preparationMinutes: 6 },
    { name: 'Fruity pebble', categoryId: categories['bubble-waffles'].id, price: 200, taxPercent: 5.0, isAvailable: true, preparationMinutes: 6 },
    { name: 'Kitkat crunch', categoryId: categories['bubble-waffles'].id, price: 210, taxPercent: 5.0, isAvailable: true, preparationMinutes: 6 },
    { name: 'Oreo dream', categoryId: categories['bubble-waffles'].id, price: 210, taxPercent: 5.0, isAvailable: true, preparationMinutes: 6 },
    { name: 'Nutella nirvana', categoryId: categories['bubble-waffles'].id, price: 220, taxPercent: 5.0, isAvailable: true, preparationMinutes: 7 },
    { name: 'Lotus biscoff bliss', categoryId: categories['bubble-waffles'].id, price: 230, taxPercent: 5.0, isAvailable: true, preparationMinutes: 7 },

    // Belgian Waffles
    { name: 'Triple chocomelt', categoryId: categories['belgian-waffles'].id, price: 120, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Coffee mocha', categoryId: categories['belgian-waffles'].id, price: 150, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Naked Nutella', categoryId: categories['belgian-waffles'].id, price: 160, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Kiki and Oreo', categoryId: categories['belgian-waffles'].id, price: 160, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Lotus biscoff Love', categoryId: categories['belgian-waffles'].id, price: 160, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },

    // The Poppin' Bowl (Pop Bowl)
    { name: 'The Triple choco', categoryId: categories['pop-bowl'].id, price: 190, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Triple Choco With ice-cream', categoryId: categories['pop-bowl'].id, price: 210, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Break time with kitkat', categoryId: categories['pop-bowl'].id, price: 220, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Nutella Pop Bowl', categoryId: categories['pop-bowl'].id, price: 230, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Biscoff Pop Bowl', categoryId: categories['pop-bowl'].id, price: 240, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'The Fruit Loaded', categoryId: categories['pop-bowl'].id, price: 250, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },

    // Brownie
    { name: 'Triple chocolate brownie', categoryId: categories['brownie'].id, price: 130, taxPercent: 5.0, isAvailable: true, preparationMinutes: 4 },
    { name: 'Oreo overload brownie', categoryId: categories['brownie'].id, price: 140, taxPercent: 5.0, isAvailable: true, preparationMinutes: 4 },
    { name: 'Meltdown with vanilla', categoryId: categories['brownie'].id, price: 160, taxPercent: 5.0, isAvailable: true, preparationMinutes: 4 },
    { name: 'Biscoff brownie', categoryId: categories['brownie'].id, price: 160, taxPercent: 5.0, isAvailable: true, preparationMinutes: 4 },
    { name: 'Hazelnut heaven', categoryId: categories['brownie'].id, price: 160, taxPercent: 5.0, isAvailable: true, preparationMinutes: 4 },

    // Specials
    { name: 'Matilda cake', categoryId: categories['specials'].id, price: 180, taxPercent: 5.0, isAvailable: true, preparationMinutes: 4 },
    { name: 'Magnum obsession', categoryId: categories['specials'].id, price: 200, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Brownie Bowl', categoryId: categories['specials'].id, price: 200, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Nutella Bites', categoryId: categories['specials'].id, price: 200, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Death By Chocolate', categoryId: categories['specials'].id, price: 240, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },

    // The Bowl Cakes
    { name: 'Triple Choco Bowl', categoryId: categories['bowl-cakes'].id, price: 180, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Crunch Chocolate Bowl', categoryId: categories['bowl-cakes'].id, price: 220, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Kitkat Bowl', categoryId: categories['bowl-cakes'].id, price: 220, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Oreo Overload Bowl', categoryId: categories['bowl-cakes'].id, price: 220, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Biscoff Bowl', categoryId: categories['bowl-cakes'].id, price: 230, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Kunafa Kraze Bowl', categoryId: categories['bowl-cakes'].id, price: 250, taxPercent: 5.0, isAvailable: true, preparationMinutes: 6 },
    { name: 'Ferrero Rocher Bowl', categoryId: categories['bowl-cakes'].id, price: 300, taxPercent: 5.0, isAvailable: true, preparationMinutes: 6 },

    // The Crunch Corner (savories)
    { name: 'Salted French Fries', categoryId: categories['savories'].id, price: 80, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Peri Peri French Fries', categoryId: categories['savories'].id, price: 100, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
    { name: 'Cheesy Fries', categoryId: categories['savories'].id, price: 130, taxPercent: 5.0, isAvailable: true, preparationMinutes: 6 },
    { name: 'Chicken loaded Fries', categoryId: categories['savories'].id, price: 150, taxPercent: 5.0, isAvailable: true, preparationMinutes: 7 },
    { name: 'Chicken Popcorn', categoryId: categories['savories'].id, price: 150, taxPercent: 5.0, isAvailable: true, preparationMinutes: 6 },
    { name: 'Chicken Wings', categoryId: categories['savories'].id, price: 160, taxPercent: 5.0, isAvailable: true, preparationMinutes: 8 },
    { name: 'Cheesy Chicken Bun', categoryId: categories['savories'].id, price: 100, taxPercent: 5.0, isAvailable: true, preparationMinutes: 5 },
  ];

  for (const item of menuItemsData) {
    await prisma.menuItem.create({ data: item });
  }

  console.log(`✅ Seeded ${menuItemsData.length} original outlet menu items across ${categoriesData.length} categories!`);
  console.log('🎉 Dear Desserts Bhavanipuram Vijayawada Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
