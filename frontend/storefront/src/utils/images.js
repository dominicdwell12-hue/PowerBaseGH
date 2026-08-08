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
  src: img('photo-1550009158-9ebf69173e03', 1000),
  alt: 'Smart speaker, headphones and electronics staged in a modern home',
};

// Ordered most-specific first so "Phones & Tablets" doesn't get caught by a
// looser "electronics" match, and "Appliances" doesn't fall into
// "Home & Living".
const CATEGORY_IMAGE_RULES = [
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
