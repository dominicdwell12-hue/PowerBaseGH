// The 23 lighting fixture types PowerBase Gh actually stocks (see
// /Items in the shared drive — chandeliers, pendants, floor lamps, strip
// lights, etc.). Categories still come from the live API (categoryApi.js) —
// this file is NOT a data source for the storefront. It exists so
// CategoryIcon.jsx has one canonical list to match an API category's
// `name` against, instead of scattering keyword regexes across
// components. Grouped by how a shopper actually decides ("what part of
// the room"), matching the four sections PowerBase's category filters
// should eventually expose.
//
// If/when these are seeded as real categories in the admin dashboard,
// keep the `key` values in sync with CategoryIcon.jsx's icon map.

export const LIGHTING_CATEGORY_GROUPS = [
  {
    group: 'Ceiling & Overhead',
    blurb: "The light that sets a room's mood before anyone looks up.",
    items: [
      { key: 'chandelier', name: 'Chandeliers' },
      { key: 'pendant', name: 'Pendant Lights' },
      { key: 'flush', name: 'Flush Mounts' },
      { key: 'semiflush', name: 'Semi-Flush Mounts' },
      { key: 'track', name: 'Track Lighting' },
      { key: 'recessed', name: 'Recessed Lights' },
      { key: 'island', name: 'Island Lights' },
      { key: 'cove', name: 'Cove Lighting' },
    ],
  },
  {
    group: 'Wall-Mounted',
    blurb: 'Light that works close to the wall — hallways, art, mirrors.',
    items: [
      { key: 'sconce', name: 'Wall Sconces' },
      { key: 'picture', name: 'Picture Lights' },
      { key: 'swingarm', name: 'Swing-Arm Wall Lights' },
      { key: 'vanity', name: 'Vanity Lights' },
    ],
  },
  {
    group: 'Table & Floor',
    blurb: 'Freestanding light you can move with the furniture.',
    items: [
      { key: 'table', name: 'Table Lamps' },
      { key: 'floor', name: 'Floor Lamps' },
      { key: 'torchiere', name: 'Torchiere Lamps' },
      { key: 'buffet', name: 'Buffet Lamps' },
      { key: 'desk', name: 'Desk Lamps' },
    ],
  },
  {
    group: 'Accent, Task & Path',
    blurb: 'Small, purposeful light — counters, cabinets, stairs, the dark.',
    items: [
      { key: 'undercabinet', name: 'Under-Cabinet Lights' },
      { key: 'string', name: 'String Lights' },
      { key: 'rope', name: 'Rope Lights' },
      { key: 'strip', name: 'Strip / Tape Lights' },
      { key: 'puck', name: 'Puck Lights' },
      { key: 'step', name: 'Step Lights' },
      { key: 'nightlight', name: 'Nightlights' },
    ],
  },
];

// Flattened for quick lookup — [{ key, name }, ...]
export const LIGHTING_CATEGORIES = LIGHTING_CATEGORY_GROUPS.flatMap((g) => g.items);

// Presentational copy only — matched against REAL category names returned
// by categoryApi.listCategories(). This is not a data source: it supplies
// a one-line description for categories we already know about (the seeded
// lighting taxonomy), and any real category name that isn't in this table
// simply renders with no blurb rather than a made-up one. See
// utils/categoryCopy.js for the lookup functions that use this.
const ITEM_BLURBS = {
  Chandeliers: "A dining room's centerpiece, hung low and lit bright.",
  'Pendant Lights': 'One bulb, one drop, endless placement.',
  'Flush Mounts': 'Full brightness for rooms with low ceilings.',
  'Semi-Flush Mounts': 'A little breathing room between fixture and ceiling.',
  'Track Lighting': 'Aim it. Move it. Aim it again.',
  'Recessed Lights': 'Light that disappears into the ceiling.',
  'Island Lights': 'Two or three pendants, evenly spaced over the counter.',
  'Cove Lighting': 'Light hidden in a ledge, glowing off the ceiling.',
  'Wall Sconces': 'Soft light at eye level, no cord in sight.',
  'Picture Lights': 'A private spotlight for the piece that deserves one.',
  'Swing-Arm Wall Lights': 'Reading light that pulls exactly where you need it.',
  'Vanity Lights': 'Even light across the mirror — no shadows on your face.',
  'Table Lamps': 'The lamp that makes a side table a destination.',
  'Floor Lamps': 'Height without a cord across the room.',
  'Torchiere Lamps': 'Light thrown upward, softened by the ceiling.',
  'Buffet Lamps': 'Tall and narrow — made for a console, not a desk.',
  'Desk Lamps': 'Focused light for focused work.',
  'Under-Cabinet Lights': 'The counter, finally lit properly.',
  'String Lights': 'A patio, a porch, a party — instantly warmer.',
  'Rope Lights': 'Flexible light for stairs, shelves, and odd corners.',
  'Strip / Tape Lights': 'Stick-on light for wherever a wire will fit.',
  'Puck Lights': 'Small, round, and surprisingly bright.',
  'Step Lights': "Light low to the ground so you don't have to hunt for the switch.",
  Nightlights: 'Just enough light to find the door at 2am.',
};

const GROUP_BLURBS = {
  'Ceiling & Overhead': "The light that sets a room's mood before anyone looks up.",
  'Wall-Mounted': 'Light that works close to the wall — hallways, art, mirrors.',
  'Table & Floor': 'Freestanding light you can move with the furniture.',
  'Accent, Task & Path': 'Small, purposeful light — counters, cabinets, stairs, the dark.',
};

export function getCategoryBlurb(name = '') {
  return ITEM_BLURBS[name] ?? GROUP_BLURBS[name] ?? null;
}
