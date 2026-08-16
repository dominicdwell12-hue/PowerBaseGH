// Curated, hotlinkable marketing photography for sections that don't have
// real inventory/Cloudinary-backed images yet (hero, category tiles, promo
// banners). Real product photos still come exclusively from the product
// API — nothing here is used for actual product data.
//
// Source is a public image CDN that accepts width/quality query params, so
// every image below is requested at a sane, responsive size instead of a
// full-resolution original.
function img(id, width = 800) {
  return `https://images.unsplash.com/${id}?q=80&w=${width}&auto=format&fit=crop`;
}

export const HERO_IMAGE = {
  src: img('photo-1524484485831-a92ffc0de03f', 1000),
  alt: 'Modern pendant chandelier lighting fixture in a stylish living space',
};

// Small floating accent shown layered over the hero panel on large screens,
// echoing the "staged product vignette" look — omitted gracefully on
// failure/small screens rather than being load-bearing for the layout.
export const HERO_ACCENT_IMAGE = {
  src: img('photo-1513506003901-1e6a229e2d15', 500),
  alt: 'Warm-toned table lamp glowing on a side table',
};

// Ordered most-specific first so "Phones & Tablets" doesn't get caught by a
// looser "electronics" match, and "Appliances" doesn't fall into
// "Home & Living". Lighting rules come first since it's the real catalog
// (see /Items) — most of these categories won't have a real photo uploaded
// yet, so this is what shows until the admin adds one.
const CATEGORY_IMAGE_RULES = [
  {
    test: /chandelier/i,
    src: img('photo-1543198126-42967f3f9c2c'),
    alt: 'Crystal chandelier hanging in a dining room',
  },
  {
    test: /pendant|island light/i,
    src: img('photo-1524484485831-a92ffc0de03f'),
    alt: 'Modern pendant lights hanging over a kitchen island',
  },
  {
    test: /flush/i,
    src: img('photo-1565538810643-b5bdb714032a'),
    alt: 'Flush-mount ceiling light fixture',
  },
  {
    test: /track|recessed|cove/i,
    src: img('photo-1513506003901-1e6a229e2d15'),
    alt: 'Recessed and track lighting in a modern ceiling',
  },
  {
    test: /sconce|picture light|vanity/i,
    src: img('photo-1615529182904-14819c35db37'),
    alt: 'Wall sconce lighting fixture mounted beside a mirror',
  },
  {
    test: /swing[\s-]?arm|desk lamp/i,
    src: img('photo-1507473885765-e6ed057f782c'),
    alt: 'Articulated desk lamp on a work surface',
  },
  {
    test: /table lamp|buffet lamp/i,
    src: img('photo-1513506003901-1e6a229e2d15'),
    alt: 'Table lamp glowing warmly on a side table',
  },
  {
    test: /floor lamp|torchiere/i,
    src: img('photo-1540932239986-30128078f3c5'),
    alt: 'Tall floor lamp beside a sofa',
  },
  {
    test: /under[\s-]?cabinet|strip|tape|puck/i,
    src: img('photo-1556911220-bff31c812dba'),
    alt: 'LED strip lighting under kitchen cabinets',
  },
  {
    test: /string light|rope light/i,
    src: img('photo-1482849297070-f4fae2173efe'),
    alt: 'String lights glowing outdoors at dusk',
  },
  {
    test: /step light|nightlight/i,
    src: img('photo-1519710164239-da123dc03ef4'),
    alt: 'Warm low-level light illuminating a staircase',
  },
  {
    test: /phone|tablet|mobile/i,
    src: img('photo-1580910051074-3eb694886505'),
    alt: 'Stack of smartphones and tablets',
  },
  {
    test: /appliance|fridge|refrigerator|washer|microwave/i,
    src: img('photo-1584568694244-14fbdf83bd30'),
    alt: 'Kitchen appliances including a fridge and microwave',
  },
  {
    test: /electronic|gadget|computer|laptop/i,
    src: img('photo-1498049794561-7780e7231661'),
    alt: 'Earbuds, smartphone and smartwatch laid out together',
  },
  {
    test: /fashion|cloth|wear|apparel|shoe/i,
    src: img('photo-1445205170230-053b83016050'),
    alt: 'Clothing hanging on a rack',
  },
  {
    test: /beauty|health|skincare|cosmetic/i,
    src: img('photo-1522335789203-aabd1fc54bc9'),
    alt: 'Skincare and beauty products arranged on a table',
  },
  {
    test: /home|living|furniture|kitchen/i,
    src: img('photo-1567016432779-094069958ea5'),
    alt: 'Sofa, floor lamp and plant in a living room',
  },
];

const FALLBACK_CATEGORY_IMAGE = {
  src: img('photo-1472851294608-062f824d29cc'),
  alt: 'Assorted products on a shelf',
};

export function getCategoryImage(name = '') {
  const rule = CATEGORY_IMAGE_RULES.find((r) => r.test.test(name));
  if (!rule) return { ...FALLBACK_CATEGORY_IMAGE, alt: `${name} category` };
  return rule;
}

export const PROMO_IMAGES = {
  deals: {
    src: img('photo-1607344645866-009c320b63e0', 700),
    alt: 'Shopping bags and gift boxes representing seasonal deals',
  },
  newArrivals: {
    src: img('photo-1483985988355-763728e1935b', 700),
    alt: 'Neatly folded new clothing arrivals',
  },
};
