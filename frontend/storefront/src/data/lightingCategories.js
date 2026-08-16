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
