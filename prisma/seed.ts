import { PrismaClient, Platform, TariffName } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean all tables in dependency order
  await prisma.reviewLike.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.referralTransaction.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.favoriteProduct.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.balanceTransaction.deleteMany();
  await prisma.productKey.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productTariff.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.adminRole.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.cheatStatus.deleteMany();
  await prisma.news.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.systemSetting.deleteMany();

  console.log('All tables cleaned.');

  // ─── Admin Role ───────────────────────────────────────────────────────────
  const adminRole = await prisma.adminRole.create({
    data: {
      name: 'Главный администратор',
      permissions: [
        'users:read', 'users:write', 'users:block',
        'products:read', 'products:write',
        'categories:read', 'categories:write',
        'orders:read', 'orders:write',
        'payments:read', 'payments:write',
        'news:read', 'news:write',
        'banners:read', 'banners:write',
        'settings:read', 'settings:write',
        'audit:read',
        'cheats:read', 'cheats:write',
      ],
    },
  });
  console.log('Admin role created:', adminRole.name);

  // ─── Users ────────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.create({
    data: {
      tgUsername: 'admin',
      firstName: 'Системный',
      lastName: 'Администратор',
      balance: 0,
      referralCode: 'admin',
      referralPercent: 10,
      isAdmin: true,
      roleId: adminRole.id,
    },
  });
  console.log('Admin user created:', adminUser.tgUsername);

  // ─── Categories ───────────────────────────────────────────────────────────
  const catPopular = await prisma.category.create({
    data: { name: 'Популярное', slug: 'popular', description: 'Популярные товары', sortOrder: 1, icon: 'popular' },
  });
  const catNew = await prisma.category.create({
    data: { name: 'Новинки', slug: 'new', description: 'Новые товары', sortOrder: 2, icon: 'new' },
  });

  console.log('Categories created.');

  // ─── Products ─────────────────────────────────────────────────────────────
  const product1 = await prisma.product.create({
    data: { name: 'Sample Product 1', slug: 'sample-product-1', description: 'Описание товара 1', categoryId: catPopular.id, sortOrder: 1 },
  });
  const product2 = await prisma.product.create({
    data: { name: 'Sample Product 2', slug: 'sample-product-2', description: 'Описание товара 2', categoryId: catPopular.id, sortOrder: 2 },
  });
  const product3 = await prisma.product.create({
    data: { name: 'Sample Product 3', slug: 'sample-product-3', description: 'Описание товара 3', categoryId: catNew.id, sortOrder: 1 },
  });

  console.log('Products created.');

  // ─── Tariffs ──────────────────────────────────────────────────────────────
  await prisma.productTariff.createMany({
    data: [
      { productId: product1.id, name: TariffName.DAY_1, days: 1, price: 100 },
      { productId: product1.id, name: TariffName.DAY_7, days: 7, price: 500 },
      { productId: product2.id, name: TariffName.DAY_1, days: 1, price: 150 },
      { productId: product2.id, name: TariffName.DAY_7, days: 7, price: 700 },
      { productId: product3.id, name: TariffName.DAY_1, days: 1, price: 200 },
      { productId: product3.id, name: TariffName.DAY_30, days: 30, price: 2000 },
    ],
  });

  console.log('Tariffs created.');

  // ─── Payment Methods ──────────────────────────────────────────────────────
  const paymentMethods = [
    { name: 'FreeKassa', code: 'freekassa', isActive: true, config: {} },
    { name: 'Карта РФ', code: 'card_rf', isActive: true, config: {} },
    { name: 'Карта УКР', code: 'card_ua', isActive: true, config: {} },
    { name: 'MasterCard', code: 'mastercard', isActive: true, config: {} },
    { name: 'CryptoBot', code: 'cryptobot', isActive: true, config: {} },
    { name: 'PayPal', code: 'paypal', isActive: true, config: {} },
  ];

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.create({ data: pm });
  }
  console.log('Payment methods created.');

  // ─── News ─────────────────────────────────────────────────────────────────
  console.log('News table ready (add via admin panel).');

  // ─── Banners ──────────────────────────────────────────────────────────────
  await prisma.banner.createMany({
    data: [
      {
        title: 'Премиум читы для PUBG',
        imageUrl: '/banners/pubg-banner.jpg',
        linkUrl: '/category/pubg-mobile',
        sortOrder: 1,
        isActive: true,
      },
      {
        title: 'Сертификаты GBox',
        imageUrl: '/banners/gbox-banner.jpg',
        linkUrl: '/category/gbox-certificate',
        sortOrder: 2,
        isActive: true,
      },
    ],
  });
  console.log('Banners created.');

  // ─── System Settings ──────────────────────────────────────────────────────
  const systemSettings = [
    { key: 'siteName', value: 'THE BEST MODS' },
    { key: 'supportContact', value: '@thebestmodz_support' },
    { key: 'minDeposit', value: 100 },
    { key: 'referralPercent', value: 5 },
    { key: 'offer', value: 'Настоящая оферта является официальным предложением интернет-магазина THE BEST MODS. Оплачивая товар, вы соглашаетесь с условиями настоящей оферты.' },
    { key: 'policy', value: 'Политика конфиденциальности: ваши данные не передаются третьим лицам и используются только для обеспечения работы сервиса.' },
    { key: 'card_ua_number', value: '4441111032086963' },
    { key: 'card_ua_bank', value: 'МоноБанк' },
    { key: 'card_ua_name', value: 'Назаренко Денис' },
    { key: 'card_mastercard_number', value: '5522099379504574' },
    { key: 'card_mastercard_name', value: 'Huseynov Subhan Zaur' },
    { key: 'paypal_email', value: 'npro87401@gmail.com' },
    { key: 'paypal_name', value: 'Maksim Kantya' },
  ];

  for (const s of systemSettings) {
    await prisma.systemSetting.create({ data: s });
  }
  console.log('System settings created.');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
