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

  // 6. Starter products — real fixtures the business is actually sourcing,
  // priced from supplier quotes on file (GHS). Deliberately shipped with NO
  // ProductImage rows: the reference photos for these are wholesaler/
  // marketplace catalog images (visible third-party watermarks, foreign
  // spec sheets) — not ours to publish as our own product photography.
  // The storefront already renders a lit category icon in place of a
  // missing photo (see CategoryIcon.jsx), so these display cleanly until
  // real photos are shot or licensed. Prices are placeholders — update them
  // in the admin dashboard once landed cost + margin is confirmed.
  const STARTER_PRODUCTS = [
    {
      name: 'Butterfly LED Flush Mount Ceiling Light',
      categorySlug: 'flush-mounts',
      price: 155.0,
      sku: 'PB-FL-001',
      brand: null,
      description:
        'Round flush-mount LED ceiling light with a butterfly-pattern acrylic diffuser. ' +
        'Dimmable, low-profile design suited to bedrooms and low-ceiling rooms.',
    },
    {
      name: 'Infinity Loop LED Pendant Light',
      categorySlug: 'pendant-lights',
      price: 300.0,
      sku: 'PB-PD-002',
      brand: null,
      description:
        'Sculptural figure-eight LED pendant in matte white, hung from a slim ceiling canopy. ' +
        'A statement piece for dining tables and kitchen islands.',
    },
    {
      name: 'Triple Globe Gold Ring Chandelier',
      categorySlug: 'chandeliers',
      price: 350.0,
      sku: 'PB-CH-003',
      brand: null,
      description:
        'Gold-finish ring chandelier with three cascading opal glass globes at staggered heights. ' +
        'Warm-white LED, suited to dining rooms and entryways.',
    },
    {
      name: 'Starlight Gold Ring Chandelier',
      categorySlug: 'chandeliers',
      price: 430.0,
      sku: 'PB-CH-004',
      brand: null,
      description:
        'Multi-ring gold chandelier with a built-in star-and-moon ceiling light projector effect. ' +
        'A bold centerpiece for living rooms and dining areas.',
    },
    {
      name: 'Double Ring Crystal Orb Pendant Light',
      categorySlug: 'pendant-lights',
      price: 450.0,
      sku: 'PB-PD-005',
      brand: null,
      description:
        'Two-tier black-and-white LED ring pendant with a crystal orb centerpiece. ' +
        'Modern profile that works well over islands or dining tables.',
    },
    {
      name: 'Twin Crystal Drum Chandelier',
      categorySlug: 'chandeliers',
      price: 480.0,
      sku: 'PB-CH-006',
      brand: null,
      description:
        'Abstract dual-ring chandelier with two crystal-beaded drum shades and crystal flower accents. ' +
        'A softer, glam take on a modern chandelier for dining rooms.',
    },
  ];

  for (const p of STARTER_PRODUCTS) {
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    if (!category) {
      console.warn(`Skipped "${p.name}" — category "${p.categorySlug}" not found`);
      continue;
    }

    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        categoryId: category.id,
        price: p.price,
        brand: p.brand,
        description: p.description,
      },
      create: {
        name: p.name,
        slug: slugify(p.name),
        categoryId: category.id,
        vendorId: 1,
        price: p.price,
        sku: p.sku,
        brand: p.brand,
        description: p.description,
        stockQuantity: 10,
      },
    });
  }
  console.log(`Starter products seeded (${STARTER_PRODUCTS.length}) — no photos yet, prices are placeholders`);

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
