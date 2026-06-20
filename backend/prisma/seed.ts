import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPw = await bcrypt.hash('Admin123!', 10);
  const custPw = await bcrypt.hash('Customer123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@arcarius.am' },
    update: {},
    create: { email: 'admin@arcarius.am', password: adminPw, firstName: 'Admin', lastName: 'Arcarius', role: Role.ADMIN },
  });
  await prisma.user.upsert({
    where: { email: 'superadmin@arcarius.am' },
    update: {},
    create: { email: 'superadmin@arcarius.am', password: adminPw, firstName: 'Super', lastName: 'Admin', role: Role.SUPER_ADMIN },
  });
  await prisma.user.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: { email: 'customer1@example.com', password: custPw, firstName: 'Armen', lastName: 'Petrosyan', phone: '+37491000001', role: Role.CUSTOMER },
  });
  await prisma.user.upsert({
    where: { email: 'customer2@example.com' },
    update: {},
    create: { email: 'customer2@example.com', password: custPw, firstName: 'Anna', lastName: 'Grigoryan', phone: '+37491000002', role: Role.CUSTOMER },
  });

  const rates = [
    { fromCurrency: 'USD', toCurrency: 'AMD', buyRate: 398.5, sellRate: 401.0 },
    { fromCurrency: 'EUR', toCurrency: 'AMD', buyRate: 432.0, sellRate: 435.5 },
    { fromCurrency: 'RUB', toCurrency: 'AMD', buyRate: 4.25, sellRate: 4.45 },
    { fromCurrency: 'GBP', toCurrency: 'AMD', buyRate: 502.0, sellRate: 507.0 },
    { fromCurrency: 'AMD', toCurrency: 'USD', buyRate: 0.00249, sellRate: 0.00251 },
    { fromCurrency: 'AMD', toCurrency: 'EUR', buyRate: 0.00229, sellRate: 0.00232 },
    { fromCurrency: 'AMD', toCurrency: 'RUB', buyRate: 0.224, sellRate: 0.235 },
    { fromCurrency: 'AMD', toCurrency: 'GBP', buyRate: 0.00197, sellRate: 0.00199 },
  ];

  for (const r of rates) {
    await prisma.exchangeRate.upsert({
      where: { fromCurrency_toCurrency: { fromCurrency: r.fromCurrency, toCurrency: r.toCurrency } },
      update: r,
      create: r,
    });
  }

  console.log('Seed complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());
