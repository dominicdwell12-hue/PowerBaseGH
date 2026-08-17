// Seeds the minimum data the app needs to function on a fresh database:
// roles, the single MVP vendor, an admin account, and delivery zones
// (with Kumasi flagged for Pay-on-Delivery per the business rules).
//
// Run with: npm run seed

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Roles
  const customerRole = await prisma.role.upsert({
    where: { name: 'customer' },
    update: {},
    create: { name: 'customer' },
  });
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });
  console.log('Roles seeded');

  // 2. Single MVP vendor (multi-vendor ready, unused for now)
  await prisma.vendor.upsert({
    where: { slug: 'powerbase-gh' },
    update: {},
    create: {
      name: 'PowerBase Gh',
      slug: 'powerbase-gh',
      status: 'active',
    },
  });
  console.log('Default vendor seeded');

  // 3. Admin account — change this password immediately after first login.
  const adminPasswordHash = await bcrypt.hash('ChangeMe123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@powerbase.gh' },
    update: {},
    create: {
      firstName: 'PowerBase',
      lastName: 'Admin',
      email: 'admin@powerbase.gh',
      passwordHash: adminPasswordHash,
      roleId: adminRole.id,
      isActive: true,
    },
  });
  console.log('Admin account seeded (email: admin@powerbase.gh / password: ChangeMe123!)');

  // 4. Delivery zones — Kumasi is the only Pay-on-Delivery city per the
  // business rules; every other city requires prepayment.
  const zones = [
    { cityName: 'Kumasi', region: 'Ashanti', payOnDeliveryEnabled: true, deliveryFee: 15.0, estimatedDays: '1-2 days' },
    { cityName: 'Accra', region: 'Greater Accra', payOnDeliveryEnabled: false, deliveryFee: 30.0, estimatedDays: '2-4 days' },
    { cityName: 'Tamale', region: 'Northern', payOnDeliveryEnabled: false, deliveryFee: 35.0, estimatedDays: '3-5 days' },
    { cityName: 'Takoradi', region: 'Western', payOnDeliveryEnabled: false, deliveryFee: 30.0, estimatedDays: '3-5 days' },
    { cityName: 'Cape Coast', region: 'Central', payOnDeliveryEnabled: false, deliveryFee: 28.0, estimatedDays: '2-4 days' },
  ];

  for (const zone of zones) {
    await prisma.deliveryZone.upsert({
      where: { cityName: zone.cityName },
      update: zone,
      create: zone,
    });
  }
  console.log('Delivery zones seeded (Kumasi = Pay on Delivery enabled)');

  // 5. Lighting catalog — the real taxonomy (see
  // frontend/storefront/src/data/lightingCategories.js, which this must be
  // kept in sync with). Modeled as 4 parent categories the storefront can
  // browse by "part of the room", each with its real fixture types as
  // subcategories — using the self-relation already defined on Category
  // (parentId/children) rather than inventing a separate grouping concept.
  function slugify(name) {
    return name
      .toLowerCase()
      .replace(/\//g, ' ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  const LIGHTING_TAXONOMY = [
    {
      group: 'Ceiling & Overhead',
      items: [
        'Chandeliers',
        'Pendant Lights',
        'Flush Mounts',
        'Semi-Flush Mounts',
        'Track Lighting',
        'Recessed Lights',
        'Island Lights',
        'Cove Lighting',
      ],
    },
    {
      group: 'Wall-Mounted',
      items: ['Wall Sconces', 'Picture Lights', 'Swing-Arm Wall Lights', 'Vanity Lights'],
    },
    {
      group: 'Table & Floor',
      items: ['Table Lamps', 'Floor Lamps', 'Torchiere Lamps', 'Buffet Lamps', 'Desk Lamps'],
    },
    {
      group: 'Accent, Task & Path',
      items: [
        'Under-Cabinet Lights',
        'String Lights',
        'Rope Lights',
        'Strip / Tape Lights',
        'Puck Lights',
        'Step Lights',
        'Nightlights',
      ],
    },
  ];

  for (const { group, items } of LIGHTING_TAXONOMY) {
    const parent = await prisma.category.upsert({
      where: { slug: slugify(group) },
      update: { name: group },
      create: { name: group, slug: slugify(group) },
    });

    for (const itemName of items) {
      const slug = slugify(itemName);
      await prisma.category.upsert({
        where: { slug },
        update: { name: itemName, parentId: parent.id },
        create: { name: itemName, slug, parentId: parent.id },
      });
    }
  }
  console.log('Lighting categories seeded (4 groups, 23 fixture types)');

  console.log('Seeding complete.');
}

main()
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
