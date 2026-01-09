import { PrismaClient, UserRole, Language } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const MENU_CATEGORIES = {
  DRINKS: 'DRINKS',
  MAIN_FOODS: 'MAIN_FOODS',
  SNACKS: 'SNACKS',
  CABINET_FOOD: 'CABINET_FOOD',
  CAKES: 'CAKES',
  GIFTS: 'GIFTS',
} as const;

async function main() {
  console.log('Starting database seeding...');

  // Create default admin user
  const adminPlain = 'Admin123!';
  const hashedPassword = await bcrypt.hash(adminPlain, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cafe.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@cafe.com',
      password: hashedPassword,
      fullName: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log(`✓ Created admin user: ${admin.email}`);

  // Create default manager user
  const managerPlain = 'Manager123!';
  const managerPassword = await bcrypt.hash(managerPlain, 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@cafe.com' },
    update: { password: managerPassword },
    create: {
      email: 'manager@cafe.com',
      password: managerPassword,
      fullName: 'Manager User',
      role: UserRole.MANAGER,
      isActive: true,
    },
  });

  console.log(`✓ Created manager user: ${manager.email}`);

  // Create default staff user
  const staffPlain = 'Staff123!';
  const staffPassword = await bcrypt.hash(staffPlain, 10);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@cafe.com' },
    update: { password: staffPassword },
    create: {
      email: 'staff@cafe.com',
      password: staffPassword,
      fullName: 'Staff User',
      role: UserRole.STAFF,
      isActive: true,
    },
  });

  console.log(`✓ Created staff user: ${staff.email}`);

  // Create default kitchen user
  const kitchenPlain = 'Kitchen123!';
  const kitchenPassword = await bcrypt.hash(kitchenPlain, 10);
  const kitchen = await prisma.user.upsert({
    where: { email: 'kitchen@cafe.com' },
    update: { password: kitchenPassword },
    create: {
      email: 'kitchen@cafe.com',
      password: kitchenPassword,
      fullName: 'Kitchen User',
      role: UserRole.KITCHEN,
      isActive: true,
    },
  });

  console.log(`✓ Created kitchen user: ${kitchen.email}`);

  // Create demo (read-only) users
  const demoAdminPlain = 'DemoAdmin123!';
  const demoAdminPassword = await bcrypt.hash(demoAdminPlain, 10);
  const demoAdmin = await prisma.user.upsert({
    where: { email: 'demo-admin@cafe.com' },
    update: {
      password: demoAdminPassword,
      fullName: 'Demo Admin',
      role: UserRole.ADMIN,
      isActive: true,
      isDemo: true,
    },
    create: {
      email: 'demo-admin@cafe.com',
      password: demoAdminPassword,
      fullName: 'Demo Admin',
      role: UserRole.ADMIN,
      isActive: true,
      isDemo: true,
    },
  });

  console.log(`✓ Created demo admin user: ${demoAdmin.email}`);

  const demoStaffPlain = 'DemoStaff123!';
  const demoStaffPassword = await bcrypt.hash(demoStaffPlain, 10);
  const demoStaff = await prisma.user.upsert({
    where: { email: 'demo-staff@cafe.com' },
    update: {
      password: demoStaffPassword,
      fullName: 'Demo Staff',
      role: UserRole.STAFF,
      isActive: true,
      isDemo: true,
    },
    create: {
      email: 'demo-staff@cafe.com',
      password: demoStaffPassword,
      fullName: 'Demo Staff',
      role: UserRole.STAFF,
      isActive: true,
      isDemo: true,
    },
  });

  console.log(`✓ Created demo staff user: ${demoStaff.email}`);

  const demoManagerPlain = 'DemoManager123!';
  const demoManagerPassword = await bcrypt.hash(demoManagerPlain, 10);
  const demoManager = await prisma.user.upsert({
    where: { email: 'demo-manager@cafe.com' },
    update: {
      password: demoManagerPassword,
      fullName: 'Demo Manager',
      role: UserRole.MANAGER,
      isActive: true,
      isDemo: true,
    },
    create: {
      email: 'demo-manager@cafe.com',
      password: demoManagerPassword,
      fullName: 'Demo Manager',
      role: UserRole.MANAGER,
      isActive: true,
      isDemo: true,
    },
  });

  console.log(`✓ Created demo manager user: ${demoManager.email}`);

  const demoKitchenPlain = 'DemoKitchen123!';
  const demoKitchenPassword = await bcrypt.hash(demoKitchenPlain, 10);
  const demoKitchen = await prisma.user.upsert({
    where: { email: 'demo-kitchen@cafe.com' },
    update: {
      password: demoKitchenPassword,
      fullName: 'Demo Kitchen',
      role: UserRole.KITCHEN,
      isActive: true,
      isDemo: true,
    },
    create: {
      email: 'demo-kitchen@cafe.com',
      password: demoKitchenPassword,
      fullName: 'Demo Kitchen',
      role: UserRole.KITCHEN,
      isActive: true,
      isDemo: true,
    },
  });

  console.log(`✓ Created demo kitchen user: ${demoKitchen.email}`);

  // Create default settings
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    await prisma.settings.create({
      data: {
        businessName: 'My Cafe',
        businessNameId: 'Kafe Saya',
        businessAddress: 'Jl. Contoh No. 123, Jakarta, Indonesia',
        businessPhone: '+62-21-12345678',
        businessWhatsApp: '+62-812-3456-7890',
        businessEmail: 'info@mycafe.com',
        themeColor: '#4F46E5',
        defaultLanguage: Language.ENGLISH,
        enableEnglish: true,
        enableIndonesian: true,
        openingHours: JSON.stringify({
          monday: '08:00-22:00',
          tuesday: '08:00-22:00',
          wednesday: '08:00-22:00',
          thursday: '08:00-22:00',
          friday: '08:00-23:00',
          saturday: '08:00-23:00',
          sunday: '09:00-21:00',
        }),
      },
    });
  }

  console.log('✓ Ensured default settings');

  const defaultJobRoles = [
    'Chef',
    'Reception',
    'Wait Staff',
    'Barista',
    'Kitchen Hand',
    'Cleaner',
  ];

  for (const roleName of defaultJobRoles) {
    await prisma.jobRole.upsert({
      where: {
        name: roleName,
      },
      update: {},
      create: {
        name: roleName,
      },
    });
  }

  console.log('✓ Ensured default job roles');

  // Create sample menu items
  const menuItems = [
    // Drinks
    {
      name: 'Espresso',
      nameId: 'Espresso',
      description: 'Strong and bold espresso shot',
      descriptionId: 'Espresso kuat dan berani',
      price: 25000,
      category: MENU_CATEGORIES.DRINKS,
      isAvailable: true,
    },
    {
      name: 'Cappuccino',
      nameId: 'Cappuccino',
      description: 'Classic cappuccino with steamed milk',
      descriptionId: 'Cappuccino klasik dengan susu kukus',
      price: 35000,
      category: MENU_CATEGORIES.DRINKS,
      isAvailable: true,
    },
    {
      name: 'Iced Latte',
      nameId: 'Es Latte',
      description: 'Cold coffee with milk',
      descriptionId: 'Kopi dingin dengan susu',
      price: 32000,
      category: MENU_CATEGORIES.DRINKS,
      isAvailable: true,
    },
    // Main Foods
    {
      name: 'Nasi Goreng',
      nameId: 'Nasi Goreng',
      description: 'Indonesian fried rice with chicken',
      descriptionId: 'Nasi goreng Indonesia dengan ayam',
      price: 45000,
      category: MENU_CATEGORIES.MAIN_FOODS,
      isAvailable: true,
    },
    {
      name: 'Mie Goreng',
      nameId: 'Mie Goreng',
      description: 'Fried noodles with vegetables',
      descriptionId: 'Mie goreng dengan sayuran',
      price: 40000,
      category: MENU_CATEGORIES.MAIN_FOODS,
      isAvailable: true,
    },
    // Snacks
    {
      name: 'French Fries',
      nameId: 'Kentang Goreng',
      description: 'Crispy french fries',
      descriptionId: 'Kentang goreng renyah',
      price: 20000,
      category: MENU_CATEGORIES.SNACKS,
      isAvailable: true,
    },
    {
      name: 'Spring Rolls',
      nameId: 'Lumpia',
      description: 'Vegetable spring rolls',
      descriptionId: 'Lumpia sayuran',
      price: 25000,
      category: MENU_CATEGORIES.SNACKS,
      isAvailable: true,
    },
    // Cabinet Food
    {
      name: 'Chocolate Croissant',
      nameId: 'Croissant Cokelat',
      description: 'Flaky croissant with chocolate filling',
      descriptionId: 'Croissant renyah dengan isi cokelat',
      price: 28000,
      category: MENU_CATEGORIES.CABINET_FOOD,
      stockQty: 15,
      isAvailable: true,
    },
    {
      name: 'Cheese Danish',
      nameId: 'Danish Keju',
      description: 'Sweet pastry with cream cheese',
      descriptionId: 'Pastri manis dengan cream cheese',
      price: 30000,
      category: MENU_CATEGORIES.CABINET_FOOD,
      stockQty: 12,
      isAvailable: true,
    },
    // Cakes
    {
      name: 'Chocolate Birthday Cake',
      nameId: 'Kue Ulang Tahun Cokelat',
      description: 'Rich chocolate cake for celebrations',
      descriptionId: 'Kue cokelat kaya untuk perayaan',
      price: 250000,
      category: MENU_CATEGORIES.CAKES,
      isAvailable: true,
    },
    {
      name: 'Vanilla Birthday Cake',
      nameId: 'Kue Ulang Tahun Vanilla',
      description: 'Classic vanilla cake with buttercream',
      descriptionId: 'Kue vanilla klasik dengan buttercream',
      price: 230000,
      category: MENU_CATEGORIES.CAKES,
      isAvailable: true,
    },
    // Gifts
    {
      name: 'Flower Bouquet',
      nameId: 'Buket Bunga',
      description: 'Beautiful flower bouquet',
      descriptionId: 'Buket bunga cantik',
      price: 150000,
      category: MENU_CATEGORIES.GIFTS,
      isAvailable: true,
    },
    {
      name: 'Gift Hamper',
      nameId: 'Hamper Hadiah',
      description: 'Assorted gift hamper',
      descriptionId: 'Hamper hadiah beragam',
      price: 200000,
      category: MENU_CATEGORIES.GIFTS,
      isAvailable: true,
    },
  ];

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({
      where: {
        name: item.name,
        category: item.category,
      },
    });

    if (!existing) {
      await prisma.menuItem.create({
        data: {
          ...item,
        },
      });
    }
  }

  console.log(`✓ Ensured ${menuItems.length} sample menu items`);

  // Create sample tables
  const tables = [
    { tableNumber: 'T01' },
    { tableNumber: 'T02' },
    { tableNumber: 'T03' },
    { tableNumber: 'T04' },
    { tableNumber: 'T05' },
    { tableNumber: 'T06' },
    { tableNumber: 'T07' },
    { tableNumber: 'T08' },
    { tableNumber: 'T09' },
    { tableNumber: 'T10' },
  ];

  for (const table of tables) {
    await prisma.table.upsert({
      where: { tableNumber: table.tableNumber },
      update: {},
      create: {
        ...table,
      },
    });
  }

  console.log(`✓ Ensured ${tables.length} tables`);

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\nDefault Users:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:   admin@cafe.com / Admin123!');
  console.log('Staff:   staff@cafe.com / Staff123!');
  console.log('Kitchen: kitchen@cafe.com / Kitchen123!');
  console.log('\nRead-only Demo Users:');
  console.log('Demo Admin:   demo-admin@cafe.com / DemoAdmin123!');
  console.log('Demo Staff:   demo-staff@cafe.com / DemoStaff123!');
  console.log('Demo Kitchen: demo-kitchen@cafe.com / DemoKitchen123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
