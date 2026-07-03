import { PrismaClient, CheatStatusEnum, Platform, TariffName } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean all tables in dependency order
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
      tgId: process.env.ADMIN_TELEGRAM_IDS?.split(',')[0]?.trim() || '123456789',
      tgUsername: 'admin',
      firstName: 'Главный',
      lastName: 'Администратор',
      balance: 999999,
      referralCode: 'admin',
      referralPercent: 10,
      isAdmin: true,
      roleId: adminRole.id,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      tgId: '111111111',
      tgUsername: 'testuser1',
      firstName: 'Тест',
      lastName: 'Пользователь',
      balance: 1000,
      referralCode: 'user1ref',
      referralPercent: 5,
      isAdmin: false,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      tgId: '222222222',
      tgUsername: 'testuser2',
      firstName: 'Второй',
      lastName: 'Юзер',
      balance: 500,
      referralCode: 'user2ref',
      referralPercent: 5,
      isAdmin: false,
    },
  });
  console.log('Users created:', adminUser.tgUsername, user1.tgUsername, user2.tgUsername);

  // ─── Categories ───────────────────────────────────────────────────────────
  const catPubg = await prisma.category.create({
    data: { name: 'PUBG MOBILE', slug: 'pubg-mobile', description: 'Читы для PUBG MOBILE', sortOrder: 1, icon: 'pubg' },
  });
  const catMl = await prisma.category.create({
    data: { name: 'MOBILE LEGENDS', slug: 'mobile-legends', description: 'Читы для Mobile Legends', sortOrder: 2, icon: 'ml' },
  });
  const catStandoff = await prisma.category.create({
    data: { name: 'СТЭНДОФФ', slug: 'standoff', description: 'Читы для Standoff 2', sortOrder: 3, icon: 'standoff' },
  });
  const catGbox = await prisma.category.create({
    data: { name: 'СЕРТИФИКАТ (GBox)', slug: 'gbox-certificate', description: 'Сертификаты GBox', sortOrder: 4, icon: 'gbox' },
  });
  const catPanel = await prisma.category.create({
    data: { name: 'ПАНЕЛЬ ОТ ЧИТОВ', slug: 'panel', description: 'Панели управления читами', sortOrder: 5, icon: 'panel' },
  });

  // Subcategories
  const subPubgNoRoot = await prisma.category.create({
    data: { name: 'Android • Без Рут', slug: 'pubg-android-no-root', description: 'PUBG на Android без Root', sortOrder: 1, parentId: catPubg.id, icon: 'android' },
  });
  const subPubgRoot = await prisma.category.create({
    data: { name: 'Android • Рут', slug: 'pubg-android-root', description: 'PUBG на Android с Root', sortOrder: 2, parentId: catPubg.id, icon: 'android-root' },
  });
  const subPubgIos = await prisma.category.create({
    data: { name: 'iOS • iPad • iPhone', slug: 'pubg-ios', description: 'PUBG на iOS', sortOrder: 3, parentId: catPubg.id, icon: 'ios' },
  });
  const subMlIos = await prisma.category.create({
    data: { name: 'iOS', slug: 'ml-ios', description: 'Mobile Legends на iOS', sortOrder: 1, parentId: catMl.id, icon: 'ios' },
  });
  const subStandoffRoot = await prisma.category.create({
    data: { name: 'Android • Рут', slug: 'standoff-android-root', description: 'Standoff 2 на Android с Root', sortOrder: 1, parentId: catStandoff.id, icon: 'android-root' },
  });

  console.log('Categories and subcategories created.');

  // ─── Products ─────────────────────────────────────────────────────────────
  // PUBG products (under main PUBG category, platform-specific)
  const zoonMod = await prisma.product.create({
    data: { name: 'Zoon mod', slug: 'zoon-mod', description: 'Премиум чит для PUBG с широким функционалом', categoryId: catPubg.id, platform: Platform.Android_NoRoot, sortOrder: 1 },
  });
  const jarvis = await prisma.product.create({
    data: { name: 'Jarvis', slug: 'jarvis', description: 'Многофункциональный чит для PUBG', categoryId: catPubg.id, platform: Platform.Android_NoRoot, sortOrder: 2 },
  });
  const zMod = await prisma.product.create({
    data: { name: 'Z Mod', slug: 'z-mod', description: 'Продвинутый чит для PUBG', categoryId: catPubg.id, platform: Platform.Android_NoRoot, sortOrder: 3 },
  });
  const zoloCheat = await prisma.product.create({
    data: { name: 'ZoloCheat', slug: 'zolo-cheat', description: 'Профессиональный софт для PUBG', categoryId: catPubg.id, platform: Platform.Android_Root, sortOrder: 4 },
  });

  // ML products
  const fluorite = await prisma.product.create({
    data: { name: 'Fluorite', slug: 'fluorite', description: 'Чит для Mobile Legends с автозапуском и скилл-шотами', categoryId: catMl.id, platform: Platform.iOS, sortOrder: 1 },
  });

  // Standoff products
  const cyrax = await prisma.product.create({
    data: { name: 'Cyrax', slug: 'cyrax', description: 'Чит для Standoff 2 с AIM и ESP', categoryId: catStandoff.id, platform: Platform.Android_Root, sortOrder: 1 },
  });

  // GBox products
  const gboxLite = await prisma.product.create({
    data: { name: 'GBox LITE', slug: 'gbox-lite', description: 'Базовый сертификат GBox', categoryId: catGbox.id, sortOrder: 1 },
  });
  const gboxPremium = await prisma.product.create({
    data: { name: 'GBox PREMIUM', slug: 'gbox-premium', description: 'Премиум сертификат GBox', categoryId: catGbox.id, sortOrder: 2 },
  });

  // Panel products
  const premiumPanel = await prisma.product.create({
    data: { name: 'Premium Panel', slug: 'premium-panel', description: 'Премиум панель управления читами', categoryId: catPanel.id, platform: Platform.Panel, sortOrder: 1 },
  });

  console.log('Products created.');

  // ─── Tariffs ──────────────────────────────────────────────────────────────
  // Zoon mod tariffs
  await prisma.productTariff.createMany({
    data: [
      { productId: zoonMod.id, name: TariffName.DAY_1, days: 1, price: 150 },
      { productId: zoonMod.id, name: TariffName.DAY_3, days: 3, price: 350 },
      { productId: zoonMod.id, name: TariffName.DAY_7, days: 7, price: 600 },
      { productId: zoonMod.id, name: TariffName.DAY_30, days: 30, price: 1500 },
    ],
  });

  // Jarvis tariffs
  await prisma.productTariff.createMany({
    data: [
      { productId: jarvis.id, name: TariffName.DAY_1, days: 1, price: 200 },
      { productId: jarvis.id, name: TariffName.DAY_3, days: 3, price: 450 },
      { productId: jarvis.id, name: TariffName.DAY_7, days: 7, price: 800 },
      { productId: jarvis.id, name: TariffName.DAY_30, days: 30, price: 2000 },
    ],
  });

  // Z Mod tariffs
  await prisma.productTariff.createMany({
    data: [
      { productId: zMod.id, name: TariffName.DAY_1, days: 1, price: 180 },
      { productId: zMod.id, name: TariffName.DAY_3, days: 3, price: 400 },
      { productId: zMod.id, name: TariffName.DAY_7, days: 7, price: 700 },
      { productId: zMod.id, name: TariffName.DAY_30, days: 30, price: 1800 },
    ],
  });

  // ZoloCheat tariffs
  await prisma.productTariff.createMany({
    data: [
      { productId: zoloCheat.id, name: TariffName.DAY_1, days: 1, price: 250 },
      { productId: zoloCheat.id, name: TariffName.DAY_3, days: 3, price: 550 },
      { productId: zoloCheat.id, name: TariffName.DAY_7, days: 7, price: 1000 },
      { productId: zoloCheat.id, name: TariffName.DAY_30, days: 30, price: 2500 },
    ],
  });

  // Fluorite tariffs
  await prisma.productTariff.createMany({
    data: [
      { productId: fluorite.id, name: TariffName.DAY_1, days: 1, price: 200 },
      { productId: fluorite.id, name: TariffName.DAY_3, days: 3, price: 500 },
      { productId: fluorite.id, name: TariffName.DAY_7, days: 7, price: 900 },
      { productId: fluorite.id, name: TariffName.DAY_30, days: 30, price: 2200 },
    ],
  });

  // Cyrax tariffs
  await prisma.productTariff.createMany({
    data: [
      { productId: cyrax.id, name: TariffName.DAY_1, days: 1, price: 180 },
      { productId: cyrax.id, name: TariffName.DAY_3, days: 3, price: 400 },
      { productId: cyrax.id, name: TariffName.DAY_7, days: 7, price: 750 },
      { productId: cyrax.id, name: TariffName.DAY_30, days: 30, price: 1900 },
    ],
  });

  // GBox LITE tariffs
  await prisma.productTariff.createMany({
    data: [
      { productId: gboxLite.id, name: TariffName.DAY_30, days: 30, price: 1500 },
      { productId: gboxLite.id, name: TariffName.DAY_60, days: 60, price: 2500 },
    ],
  });

  // GBox PREMIUM tariffs
  await prisma.productTariff.createMany({
    data: [
      { productId: gboxPremium.id, name: TariffName.DAY_30, days: 30, price: 2500 },
      { productId: gboxPremium.id, name: TariffName.DAY_60, days: 60, price: 4000 },
    ],
  });

  // Premium Panel tariffs
  await prisma.productTariff.createMany({
    data: [
      { productId: premiumPanel.id, name: TariffName.DAY_1, days: 1, price: 300 },
      { productId: premiumPanel.id, name: TariffName.DAY_7, days: 7, price: 1500 },
      { productId: premiumPanel.id, name: TariffName.DAY_30, days: 30, price: 4000 },
    ],
  });

  console.log('Tariffs created.');

  // ─── Cheat Statuses ───────────────────────────────────────────────────────
  const cheatStatuses = [
    { gameName: 'PUBG MOBILE', cheatName: 'Zoon mod', platform: 'Android', status: CheatStatusEnum.SAFE },
    { gameName: 'PUBG MOBILE', cheatName: 'Jarvis', platform: 'Android', status: CheatStatusEnum.SAFE },
    { gameName: 'PUBG MOBILE', cheatName: 'Z Mod', platform: 'Android', status: CheatStatusEnum.RISKY },
    { gameName: 'PUBG MOBILE', cheatName: 'ZoloCheat', platform: 'Android', status: CheatStatusEnum.SAFE },
    { gameName: 'MOBILE LEGENDS', cheatName: 'Fluorite', platform: 'iOS', status: CheatStatusEnum.SAFE },
    { gameName: 'СТЭНДОФФ', cheatName: 'Cyrax', platform: 'Android', status: CheatStatusEnum.SAFE },
    { gameName: 'СЕРТИФИКАТ (GBox)', cheatName: 'GBox LITE', platform: null, status: CheatStatusEnum.SAFE },
    { gameName: 'СЕРТИФИКАТ (GBox)', cheatName: 'GBox PREMIUM', platform: null, status: CheatStatusEnum.SAFE },
    { gameName: 'ПАНЕЛЬ ОТ ЧИТОВ', cheatName: 'Premium Panel', platform: 'Panel', status: CheatStatusEnum.SAFE },
  ];

  for (const cs of cheatStatuses) {
    await prisma.cheatStatus.create({ data: cs });
  }
  console.log('Cheat statuses created.');

  // ─── Payment Methods ──────────────────────────────────────────────────────
  const paymentMethods = [
    { name: 'СБП', code: 'sbp', config: { commission: 0 }, sortOrder: 1 },
    { name: 'Карта РФ', code: 'card_rf', config: { commission: 2 }, sortOrder: 2 },
    { name: 'Карта УКР', code: 'card_ua', config: { commission: 3 }, sortOrder: 3 },
    { name: 'MasterCard', code: 'mastercard', config: { commission: 2.5 }, sortOrder: 4 },
    { name: 'CryptoBot', code: 'cryptobot', config: { commission: 1 }, sortOrder: 5 },
    { name: 'PayPal', code: 'paypal', config: { commission: 4 }, sortOrder: 6 },
    { name: 'Звёзды', code: 'stars', config: { commission: 0 }, sortOrder: 7 },
  ];

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.create({ data: pm });
  }
  console.log('Payment methods created.');

  // ─── News ─────────────────────────────────────────────────────────────────
  await prisma.news.createMany({
    data: [
      {
        title: 'Обновление ассортимента читов',
        content: 'Добавлены новые версии Zoon mod и Jarvis для PUBG MOBILE. Улучшена защита от банов. Обновлены тарифы — действуют скидки при покупке на 30 дней.',
        isPublished: true,
      },
      {
        title: 'Запуск сертификатов GBox',
        content: 'Теперь доступны сертификаты GBox LITE и GBox PREMIUM. Обеспечивают стабильную работу читов на iOS без джейлбрейка. Подробности в нашем Telegram.',
        isPublished: true,
      },
    ],
  });
  console.log('News created.');

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
    { key: 'supportContact', value: '@thebestmods_support' },
    { key: 'minDeposit', value: 100 },
    { key: 'referralPercent', value: 5 },
    { key: 'offer', value: 'Настоящая оферта является официальным предложением интернет-магазина THE BEST MODS. Оплачивая товар, вы соглашаетесь с условиями настоящей оферты.' },
    { key: 'policy', value: 'Политика конфиденциальности: ваши данные не передаются третьим лицам и используются только для обеспечения работы сервиса.' },
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
