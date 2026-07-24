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
      email: 'admin@deardesserts.com',
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
    { name: 'Cakes & Pastries', slug: 'cakes', icon: 'Cake', displayOrder: 1, description: 'Freshly baked decadent slices and layered cakes' },
    { name: 'Warm Waffles', slug: 'waffles', icon: 'Grid', displayOrder: 2, description: 'Crispy Belgian waffles drenched in gourmet spreads' },
    { name: 'Brownies & Sundaes', slug: 'brownies-sundaes', icon: 'IceCream', displayOrder: 3, description: 'Sizzling brownies and artisanal scoop sundaes' },
    { name: 'Thickshakes & Drinks', slug: 'shakes', icon: 'CupSoda', displayOrder: 4, description: 'Creamy dessert thickshakes and refreshing sips' },
    { name: 'Savouries & Snacks', slug: 'savouries', icon: 'Pizza', displayOrder: 5, description: 'Cheesy hot toasts and crispy sides' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({ data: cat });
  }

  // 4. Create Menu Items
  const menuItemsData = [
    // Cakes
    {
      name: 'Red Velvet Layer Slice',
      categoryId: categories['cakes'].id,
      price: 160,
      taxPercent: 5.0,
      description: 'Classic velvety sponge with rich cream cheese frosting',
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600',
      preparationMinutes: 3,
    },
    {
      name: 'Black Forest Special Slice',
      categoryId: categories['cakes'].id,
      price: 140,
      taxPercent: 5.0,
      description: 'Layers of moist chocolate sponge with cherries & fresh cream',
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',
      preparationMinutes: 3,
    },
    {
      name: 'Belgian Truffle Slice',
      categoryId: categories['cakes'].id,
      price: 190,
      taxPercent: 5.0,
      description: 'Rich 70% dark Belgian chocolate layer cake',
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
      preparationMinutes: 4,
    },
    // Waffles
    {
      name: 'Nutella Overload Waffle',
      categoryId: categories['waffles'].id,
      price: 190,
      taxPercent: 5.0,
      description: 'Crispy warm waffle smothered in Nutella & dark chocochips',
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600',
      preparationMinutes: 7,
    },
    {
      name: 'Lotus Biscoff Crunch Waffle',
      categoryId: categories['waffles'].id,
      price: 210,
      taxPercent: 5.0,
      description: 'Golden waffle layered with Biscoff spread & crushed biscuits',
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=600',
      preparationMinutes: 8,
    },
    // Brownies & Sundaes
    {
      name: 'Sizzling Chocolate Brownie',
      categoryId: categories['brownies-sundaes'].id,
      price: 180,
      taxPercent: 5.0,
      description: 'Hot walnut brownie served on a sizzling plate with vanilla ice cream',
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600',
      preparationMinutes: 6,
    },
    {
      name: 'Double Chocolate Fudge Sundae',
      categoryId: categories['brownies-sundaes'].id,
      price: 160,
      taxPercent: 5.0,
      description: 'Two scoops of Belgian dark choc ice cream topped with hot fudge',
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600',
      preparationMinutes: 4,
    },
    {
      name: 'Special Royal Fruit Salad',
      categoryId: categories['brownies-sundaes'].id,
      price: 130,
      taxPercent: 5.0,
      description: 'Fresh seasonal fruits with Madagascar vanilla scoop & honey drizzle',
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600',
      preparationMinutes: 5,
    },
    // Shakes
    {
      name: 'Belgian Chocolate Thickshake',
      categoryId: categories['shakes'].id,
      price: 170,
      taxPercent: 5.0,
      description: 'Thick blended cocoa shake crowned with chocolate whipped cream',
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600',
      preparationMinutes: 5,
    },
    {
      name: 'Salted Caramel Crunch Shake',
      categoryId: categories['shakes'].id,
      price: 180,
      taxPercent: 5.0,
      description: 'Caramel ice cream blended with salted praline bits & caramel drizzle',
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=600',
      preparationMinutes: 5,
    },
    // Savouries
    {
      name: 'Cheesy Garlic Toastie',
      categoryId: categories['savouries'].id,
      price: 140,
      taxPercent: 5.0,
      description: 'Grilled sandwich with garlic butter, mozzarella & Italian herbs',
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600',
      preparationMinutes: 6,
    },
    {
      name: 'Peri Peri Crispy Fries',
      categoryId: categories['savouries'].id,
      price: 120,
      taxPercent: 5.0,
      description: 'Golden fried potatoes tossed in zesty peri-peri spice mix',
      isAvailable: true,
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600',
      preparationMinutes: 5,
    },
  ];

  for (const item of menuItemsData) {
    await prisma.menuItem.create({ data: item });
  }

  console.log(`✅ Seeded ${menuItemsData.length} real menu items across ${categoriesData.length} categories!`);
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
