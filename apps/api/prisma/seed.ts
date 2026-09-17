import { PrismaClient, OrgType, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@hirebridgehr.com';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe@12345';

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Super Admin',
      emailVerified: true,
      isSuperAdmin: true,
    },
  });
  console.log(`✅ Super Admin: ${superAdmin.email}`);

  // Demo organization
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-corp' },
    update: {},
    create: {
      name: 'Demo Corp',
      type: OrgType.CORPORATE,
      slug: 'demo-corp',
      industry: 'Technology',
    },
  });
  console.log(`✅ Demo org: ${org.name}`);

  // Demo owner user
  const ownerEmail = 'owner@democorp.com';
  const ownerHash = await bcrypt.hash('Owner@12345', 12);
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      passwordHash: ownerHash,
      name: 'Demo Owner',
      emailVerified: true,
    },
  });

  await prisma.organizationUser.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: owner.id } },
    update: { role: Role.OWNER },
    create: { organizationId: org.id, userId: owner.id, role: Role.OWNER },
  });
  console.log(`✅ Owner: ${owner.email} (password: Owner@12345)`);

  // Plans
  const plans = [
    { name: 'Free', priceMonthly: 0, features: { jobs: 3, candidates: 50 } },
    { name: 'Starter', priceMonthly: 999, features: { jobs: 10, candidates: 500 } },
    { name: 'Growth', priceMonthly: 2999, features: { jobs: 50, candidates: 5000 } },
  ];
  for (const p of plans) {
    const exists = await prisma.plan.findFirst({ where: { name: p.name } });
    if (!exists) await prisma.plan.create({ data: p });
  }
  console.log('✅ Plans created');

  console.log('🎉 Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
