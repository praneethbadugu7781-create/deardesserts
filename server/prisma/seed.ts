import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Dear Desserts Database Seeding...');

  // 1. Create Default Branch
  const branch = await prisma.branch.upsert({
    where: { code: 'DD-01' },
    update: {},
    create: {
      name: 'Dear Desserts - Flagship Outlet',
      code: 'DD-01',
      address: '74 Park Street, Central District',
      phone: '+91 98765 43210',
    },
  });

  // 2. Create Password Hash
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const kitchenPassword = await bcrypt.hash('kitchen123', 10);

  // 3. Create Users
  await prisma.user.upsert({
    where: { email: 'admin@deardesserts.com' },
    update: {},
    create: {
      name: 'Rohan Sharma (Manager)',
      email: 'admin@deardesserts.com',
      password: hashedPassword,
      role: 'ADMIN',
      branchId: branch.id,
      phone: '+91 99999 11111',
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@deardesserts.com' },
    update: {},
    create: {
      name: 'Priya Singh (POS Cashier)',
      email: 'cashier@deardesserts.com',
      password: cashierPassword,
      role: 'CASHIER',
      branchId: branch.id,
      phone: '+91 99999 22222',
    },
  });

  await prisma.user.upsert({
    where: { email: 'kitchen@deardesserts.com' },
    update: {},
    create: {
      name: 'Chef Chef Chef (Head Chef)',
      email: 'kitchen@deardesserts.com',
      password: kitchenPassword,
      role: 'KITCHEN_STAFF',
      branchId: branch.id,
      phone: '+91 99999 33333',
    },
  });

  console.log('✅ Created Users: Admin, Cashier, Kitchen Staff');

  // 4. Create Categories
  const categoriesData = [
    { name: 'Cakes', slug: 'cakes', icon: 'Cake', displayOrder: 1, description: 'Freshly baked decadent dessert cakes' },
    { name: 'Waffles', slug: 'waffles', icon: 'Grid', displayOrder: 2, description: 'Crispy warm waffles with gourmet toppings' },
    { name: 'Savouries', slug: 'savouries', icon: 'Pizza', displayOrder: 3, description: 'Hot cheesy quick snacks' },
    { name: 'Shakes', slug: 'shakes', icon: 'CupSoda', displayOrder: 4, description: 'Thick creamy dessert shakes' },
    { name: 'Ice Creams', slug: 'ice-creams', icon: 'IceCream', displayOrder: 5, description: 'Artisanal scoops and sundaes' },
    { name: 'Combos', slug: 'combos', icon: 'Sparkles', displayOrder: 6, description: 'Curated dessert & snack combinations' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 5. Create Menu Items
  const menuItemsData = [
    { name: 'Warm Chocolate Fudge Cake', categoryId: categories['cakes'].id, price: 180, taxPercent: 5.0, description: 'Gooey melted chocolate cake served warm', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', preparationMinutes: 4 },
    { name: 'Red Velvet Slice', categoryId: categories['cakes'].id, price: 160, taxPercent: 5.0, description: 'Velvety sponge layered with cream cheese frosting', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400', preparationMinutes: 3 },
    { name: 'Belgian Truffle Cake', categoryId: categories['cakes'].id, price: 210, taxPercent: 5.0, description: 'Rich 70% dark Belgian cocoa layer cake', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', preparationMinutes: 5 },
    { name: 'Nutella Overload Waffle', categoryId: categories['waffles'].id, price: 190, taxPercent: 5.0, description: 'Belgian waffle drenched in Nutella & dark chocolate chips', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400', preparationMinutes: 7 },
    { name: 'Lotus Biscoff Crunch Waffle', categoryId: categories['waffles'].id, price: 220, taxPercent: 5.0, description: 'Crispy waffle with Biscoff spread and crushed biscuit bits', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=400', preparationMinutes: 8 },
    { name: 'Cheesy Garlic Breadsticks', categoryId: categories['savouries'].id, price: 140, taxPercent: 5.0, description: 'Warm garlic toast topped with mozzarella & herbs', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400', preparationMinutes: 6 },
    { name: 'Spicy Jalapeño Toastie', categoryId: categories['savouries'].id, price: 130, taxPercent: 5.0, description: 'Grilled sandwich loaded with spicy jalapeños & cheese', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', preparationMinutes: 6 },
    { name: 'Peri Peri Crispy Fries', categoryId: categories['savouries'].id, price: 110, taxPercent: 5.0, description: 'Golden potato fries dusted with zesty peri peri spice', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400', preparationMinutes: 5 },
    { name: 'Belgian Chocolate Thickshake', categoryId: categories['shakes'].id, price: 170, taxPercent: 5.0, description: 'Thick cocoa shake crowned with chocolate curls', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', preparationMinutes: 4 },
    { name: 'Salted Caramel Crunch Shake', categoryId: categories['shakes'].id, price: 180, taxPercent: 5.0, description: 'Caramel ice cream blended with salted praline bits', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=400', preparationMinutes: 4 },
    { name: 'Double Chocolate Sundae', categoryId: categories['ice-creams'].id, price: 160, taxPercent: 5.0, description: 'Two scoops of Belgian dark chocolate ice cream with fudge sauce', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', preparationMinutes: 3 },
    { name: 'Vanilla Bean & Almond Scoop', categoryId: categories['ice-creams'].id, price: 90, taxPercent: 5.0, description: 'Classic Madagascar vanilla scoop with roasted almonds', isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400', preparationMinutes: 2 },
    { name: 'Dessert Bliss Combo', categoryId: categories['combos'].id, price: 320, taxPercent: 5.0, description: 'Nutella Waffle + Belgian Chocolate Thickshake', isAvailable: true, isCombo: true, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400', preparationMinutes: 10 },
  ];

  for (const item of menuItemsData) {
    await prisma.menuItem.create({ data: item });
  }

  console.log('✅ Created 13 Menu Items across 6 Categories');

  // 6. Offers
  await prisma.offer.upsert({
    where: { code: 'DEAR10' },
    update: {},
    create: {
      title: 'Welcome 10% Off',
      code: 'DEAR10',
      description: 'Get 10% instant discount on orders above ₹200',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 200,
    },
  });

  await prisma.offer.upsert({
    where: { code: 'WEEKEND50' },
    update: {},
    create: {
      title: 'Weekend Flat ₹50 Off',
      code: 'WEEKEND50',
      description: 'Flat ₹50 off on orders above ₹450',
      discountType: 'FIXED',
      discountValue: 50,
      minOrderValue: 450,
    },
  });

  // 7. Inventory Items (Ingredients & Packaging)
  const inventoryData = [
    { name: 'Fresh Whole Milk', category: 'INGREDIENT', unit: 'Litres', currentStock: 45, minStockAlert: 10, unitCost: 65, branchId: branch.id },
    { name: 'Brownie Cake Base', category: 'INGREDIENT', unit: 'Kg', currentStock: 18, minStockAlert: 5, unitCost: 350, branchId: branch.id },
    { name: 'Belgian Ice Cream Tub', category: 'INGREDIENT', unit: 'Litres', currentStock: 25, minStockAlert: 8, unitCost: 400, branchId: branch.id },
    { name: 'Chocolate Syrup Bottle', category: 'INGREDIENT', unit: 'Bottles', currentStock: 2, minStockAlert: 5, unitCost: 220, branchId: branch.id }, // LOW STOCK ALERT DEMO!
    { name: 'Oreo Biscuit Crumb', category: 'INGREDIENT', unit: 'Kg', currentStock: 12, minStockAlert: 3, unitCost: 180, branchId: branch.id },
    { name: 'Choco Chip Toppings', category: 'INGREDIENT', unit: 'Kg', currentStock: 8, minStockAlert: 2, unitCost: 290, branchId: branch.id },
    { name: 'Dessert Boxes (Small)', category: 'PACKAGING', unit: 'Pieces', currentStock: 350, minStockAlert: 50, unitCost: 12, branchId: branch.id },
    { name: 'Shake Cups 500ml', category: 'PACKAGING', unit: 'Pieces', currentStock: 40, minStockAlert: 100, unitCost: 8, branchId: branch.id }, // LOW STOCK ALERT DEMO!
    { name: 'Branded Tissue Packs', category: 'PACKAGING', unit: 'Packs', currentStock: 120, minStockAlert: 20, unitCost: 15, branchId: branch.id },
  ];

  for (const inv of inventoryData) {
    await prisma.inventoryItem.create({ data: inv });
  }

  console.log('✅ Created Inventory Items (with Low Stock Demos)');

  // 8. Generate sample orders
  const allMenuItems = await prisma.menuItem.findMany();

  const createSampleOrder = async (
    seq: number,
    status: string,
    method: string,
    itemsToPick: { itemIdx: number; qty: number }[],
    hoursAgo: number
  ) => {
    const orderTime = new Date(Date.now() - hoursAgo * 3600 * 1000);

    let subtotal = 0;
    const orderItems = itemsToPick.map((it) => {
      const mi = allMenuItems[it.itemIdx % allMenuItems.length];
      const tot = mi.price * it.qty;
      subtotal += tot;
      return {
        menuItemId: mi.id,
        itemPrice: mi.price,
        quantity: it.qty,
        totalPrice: tot,
      };
    });

    const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
    const netAmount = subtotal + taxAmount;
    const orderNum = `ORD-10${100 + seq}`;
    const tokenNum = `T-${100 + seq}`;
    const billNum = `DD-10${20 + seq}`;

    await prisma.order.create({
      data: {
        orderNumber: orderNum,
        branchId: branch.id,
        cashierId: cashier.id,
        status,
        customerName: `Customer #${seq}`,
        subtotal,
        taxAmount,
        discountAmount: 0,
        netAmount,
        createdAt: orderTime,
        updatedAt: orderTime,
        items: {
          create: orderItems,
        },
        token: {
          create: {
            tokenNumber: tokenNum,
            dailySeq: seq,
            status,
            createdAt: orderTime,
            readyAt: status === 'READY' || status === 'COMPLETED' ? orderTime : null,
            completedAt: status === 'COMPLETED' ? orderTime : null,
          },
        },
        bill: {
          create: {
            billNumber: billNum,
            subtotal,
            gstAmount: taxAmount,
            discount: 0,
            totalAmount: netAmount,
            paymentMethod: method,
            createdAt: orderTime,
          },
        },
        payments: {
          create: {
            method,
            amount: netAmount,
            status: 'PAID',
            createdAt: orderTime,
          },
        },
      },
    });
  };

  // Active orders for KDS and Token Display
  await createSampleOrder(1, 'NEW', 'UPI', [{ itemIdx: 0, qty: 2 }, { itemIdx: 3, qty: 1 }], 0.1);
  await createSampleOrder(2, 'PREPARING', 'CASH', [{ itemIdx: 1, qty: 1 }, { itemIdx: 8, qty: 2 }], 0.2);
  await createSampleOrder(3, 'PREPARING', 'CARD', [{ itemIdx: 4, qty: 1 }, { itemIdx: 12, qty: 1 }], 0.3);
  await createSampleOrder(4, 'READY', 'UPI', [{ itemIdx: 3, qty: 2 }], 0.4);
  await createSampleOrder(5, 'READY', 'CASH', [{ itemIdx: 0, qty: 1 }, { itemIdx: 5, qty: 1 }], 0.5);

  // Historical completed orders
  for (let i = 6; i <= 25; i++) {
    const hoursAgo = Math.floor(Math.random() * 8) + 1;
    const pMethod = i % 3 === 0 ? 'CASH' : i % 3 === 1 ? 'UPI' : 'CARD';
    await createSampleOrder(
      i,
      'COMPLETED',
      pMethod,
      [
        { itemIdx: (i * 2) % allMenuItems.length, qty: (i % 2) + 1 },
        { itemIdx: (i * 3 + 1) % allMenuItems.length, qty: 1 },
      ],
      hoursAgo
    );
  }

  console.log('✅ Generated active and historical orders, tokens & bills');
  console.log('🎉 Dear Desserts Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
