import { LIGHTING_CATEGORIES } from '../../data/lightingCategories.js';

/**
 * Hand-drawn line icons for the 23 fixture types Arcvan actually sells,
 * used wherever a category has no real photo yet (CategoryCard, CategoryTile).
 * Replaces the old generic lucide-icon guesser (Smartphone/Shirt/Sofa…),
 * which was a leftover from the multi-category starter template and never
 * matched what's actually in /Items.
 *
 * Each icon's bulb element carries `.category-icon-bulb` (see
 * styles/index.css) so it lights up gold on hover/focus wherever it's
 * rendered inside a `.group` — the one interaction idea reused everywhere
 * instead of one-off hover effects per component.
 *
 * Markup is static (authored below, no user input) — dangerouslySetInnerHTML
 * is the pragmatic way to keep 23 hand-drawn icons in one readable file
 * instead of 23 separate component files.
 */
const ICON_MARKUP = {
  chandelier: `<line x1="24" y1="2" x2="24" y2="12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M24 12 C14 12 10 20 12 28" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M24 12 C34 12 38 20 36 28" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/><line x1="24" y1="12" x2="24" y2="26" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle class="category-icon-bulb" cx="12" cy="30" r="2.6"/><circle class="category-icon-bulb" cx="24" cy="28" r="2.6"/><circle class="category-icon-bulb" cx="36" cy="30" r="2.6"/>`,
  pendant: `<line x1="24" y1="3" x2="24" y2="18" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M14 18 L34 18 L30 32 Q24 36 18 32 Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><circle class="category-icon-bulb" cx="24" cy="24" r="3"/>`,
  flush: `<line x1="10" y1="10" x2="38" y2="10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M14 10 Q24 26 34 10" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle class="category-icon-bulb" cx="24" cy="17" r="3"/>`,
  semiflush: `<line x1="10" y1="8" x2="38" y2="8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="24" y1="8" x2="24" y2="14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M15 14 Q24 27 33 14" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle class="category-icon-bulb" cx="24" cy="20" r="3"/>`,
  track: `<line x1="6" y1="8" x2="42" y2="8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M14 8 L10 20 L18 20 Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><path d="M28 8 L24 22 L32 22 Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><path d="M40 8 L38 16 L44 16 Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><circle class="category-icon-bulb" cx="14" cy="17" r="1.8"/><circle class="category-icon-bulb" cx="28" cy="19" r="1.8"/>`,
  recessed: `<rect x="12" y="8" width="24" height="24" rx="2" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="24" cy="20" r="8" stroke="currentColor" stroke-width="1.4" fill="none" stroke-dasharray="2 3"/><circle class="category-icon-bulb" cx="24" cy="20" r="4"/>`,
  island: `<line x1="6" y1="6" x2="42" y2="6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="15" y1="6" x2="15" y2="16" stroke="currentColor" stroke-width="1.4"/><line x1="33" y1="6" x2="33" y2="16" stroke="currentColor" stroke-width="1.4"/><path d="M8 16 L22 16 L19 27 Q15 30 11 27 Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><path d="M26 16 L40 16 L37 27 Q33 30 29 27 Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><circle class="category-icon-bulb" cx="15" cy="21" r="2.4"/><circle class="category-icon-bulb" cx="33" cy="21" r="2.4"/>`,
  cove: `<path d="M6 10 L20 10 L24 16 L44 16" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 22 Q30 12 44 12" stroke="currentColor" stroke-width="1.4" fill="none" stroke-dasharray="1 3" opacity="0.6"/><circle class="category-icon-bulb" cx="22" cy="16.5" r="2"/>`,
  sconce: `<line x1="8" y1="4" x2="8" y2="44" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M8 16 L28 12 L30 26 L8 26 Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><circle class="category-icon-bulb" cx="19" cy="19" r="3"/>`,
  picture: `<rect x="12" y="22" width="24" height="18" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M12 18 Q24 12 36 18" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle class="category-icon-bulb" cx="18" cy="18" r="1.8"/><circle class="category-icon-bulb" cx="24" cy="16.5" r="1.8"/><circle class="category-icon-bulb" cx="30" cy="18" r="1.8"/>`,
  swingarm: `<line x1="8" y1="4" x2="8" y2="44" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M8 20 L24 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="24" cy="14" r="1.6" fill="currentColor"/><path d="M24 14 L36 20" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M30 15 L40 24 L32 27 Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><circle class="category-icon-bulb" cx="35" cy="21" r="2"/>`,
  vanity: `<rect x="10" y="26" width="28" height="16" stroke="currentColor" stroke-width="1.4" fill="none"/><line x1="6" y1="14" x2="42" y2="14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle class="category-icon-bulb" cx="12" cy="14" r="1.8"/><circle class="category-icon-bulb" cx="20" cy="14" r="1.8"/><circle class="category-icon-bulb" cx="28" cy="14" r="1.8"/><circle class="category-icon-bulb" cx="36" cy="14" r="1.8"/>`,
  table: `<line x1="6" y1="40" x2="42" y2="40" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M15 22 L33 22 L29 34 L19 34 Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><line x1="24" y1="34" x2="24" y2="40" stroke="currentColor" stroke-width="1.4"/><circle class="category-icon-bulb" cx="24" cy="28" r="2.6"/>`,
  floor: `<line x1="10" y1="44" x2="38" y2="44" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="24" y1="44" x2="24" y2="20" stroke="currentColor" stroke-width="1.4"/><path d="M15 10 L33 10 L29 20 L19 20 Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><circle class="category-icon-bulb" cx="24" cy="15" r="2.4"/>`,
  torchiere: `<line x1="12" y1="44" x2="36" y2="44" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="24" y1="44" x2="24" y2="18" stroke="currentColor" stroke-width="1.4"/><path d="M15 10 L33 10 L26 18 L22 18 Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><circle class="category-icon-bulb" cx="24" cy="14" r="2"/>`,
  buffet: `<line x1="15" y1="44" x2="33" y2="44" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="24" y1="44" x2="24" y2="16" stroke="currentColor" stroke-width="1.4"/><path d="M19 8 L29 8 L27 16 L21 16 Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><circle class="category-icon-bulb" cx="24" cy="12" r="1.8"/>`,
  desk: `<line x1="6" y1="40" x2="20" y2="40" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="10" y1="40" x2="10" y2="36" stroke="currentColor" stroke-width="1.4"/><path d="M10 36 L22 26" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="22" cy="26" r="1.6" fill="currentColor"/><path d="M22 26 L34 20" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M28 15 L40 20 L30 26 Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><circle class="category-icon-bulb" cx="33" cy="20" r="2"/>`,
  undercabinet: `<rect x="6" y="8" width="36" height="8" stroke="currentColor" stroke-width="1.4" fill="none"/><rect x="10" y="18" width="28" height="3" rx="1.4" stroke="currentColor" stroke-width="1.4" fill="none"/><circle class="category-icon-bulb" cx="16" cy="19.5" r="1.3"/><circle class="category-icon-bulb" cx="24" cy="19.5" r="1.3"/><circle class="category-icon-bulb" cx="32" cy="19.5" r="1.3"/><path d="M12 24 L10 30 M24 24 L24 30 M36 24 L38 30" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="1 2.6"/>`,
  string: `<path d="M4 14 Q14 26 24 14 Q34 26 44 14" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle class="category-icon-bulb" cx="9" cy="18" r="1.8"/><circle class="category-icon-bulb" cx="24" cy="22" r="1.8"/><circle class="category-icon-bulb" cx="39" cy="18" r="1.8"/>`,
  rope: `<path d="M4 30 Q10 14 16 30 Q22 14 28 30 Q34 14 40 30" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle class="category-icon-bulb" cx="10" cy="22" r="1.4"/><circle class="category-icon-bulb" cx="22" cy="22" r="1.4"/><circle class="category-icon-bulb" cx="34" cy="22" r="1.4"/>`,
  strip: `<rect x="6" y="20" width="36" height="6" rx="1" stroke="currentColor" stroke-width="1.4" fill="none"/><line x1="12" y1="20" x2="12" y2="26" stroke="currentColor" stroke-width="1.4"/><line x1="18" y1="20" x2="18" y2="26" stroke="currentColor" stroke-width="1.4"/><line x1="24" y1="20" x2="24" y2="26" stroke="currentColor" stroke-width="1.4"/><line x1="30" y1="20" x2="30" y2="26" stroke="currentColor" stroke-width="1.4"/><line x1="36" y1="20" x2="36" y2="26" stroke="currentColor" stroke-width="1.4"/><circle class="category-icon-bulb" cx="15" cy="23" r="1"/><circle class="category-icon-bulb" cx="27" cy="23" r="1"/><circle class="category-icon-bulb" cx="33" cy="23" r="1"/>`,
  puck: `<ellipse cx="24" cy="22" rx="10" ry="4" stroke="currentColor" stroke-width="1.4" fill="none"/><circle class="category-icon-bulb" cx="24" cy="22" r="4.5"/><path d="M24 10 L24 14 M12 22 L8 22 M40 22 L36 22 M15 13 L18 16 M33 13 L30 16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>`,
  step: `<rect x="18" y="14" width="12" height="8" rx="1" stroke="currentColor" stroke-width="1.4" fill="none"/><circle class="category-icon-bulb" cx="24" cy="18" r="1.8"/><path d="M14 30 L34 30 M12 36 L36 36" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.6"/><path d="M20 24 L14 30 M28 24 L34 30" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="1 2.4" opacity="0.7"/>`,
  nightlight: `<rect x="16" y="8" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.4" fill="none"/><line x1="20" y1="8" x2="20" y2="4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="28" y1="8" x2="28" y2="4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle class="category-icon-bulb" cx="24" cy="14" r="3.4"/>`,
};

// Ordered longest/most-specific phrase first so e.g. "Semi-Flush Mounts"
// doesn't get caught by the plainer "flush" -> Flush Mounts rule.
const MATCH_RULES = [
  { key: 'semiflush', test: /semi[\s-]?flush/i },
  { key: 'undercabinet', test: /under[\s-]?cabinet/i },
  { key: 'swingarm', test: /swing[\s-]?arm/i },
  { key: 'chandelier', test: /chandelier/i },
  { key: 'pendant', test: /pendant/i },
  { key: 'flush', test: /flush/i },
  { key: 'track', test: /track/i },
  { key: 'recessed', test: /recess/i },
  { key: 'island', test: /island/i },
  { key: 'cove', test: /cove/i },
  { key: 'sconce', test: /sconce/i },
  { key: 'picture', test: /picture/i },
  { key: 'vanity', test: /vanity/i },
  { key: 'torchiere', test: /torchiere/i },
  { key: 'buffet', test: /buffet/i },
  { key: 'desk', test: /desk/i },
  { key: 'table', test: /table/i },
  { key: 'floor', test: /floor/i },
  { key: 'string', test: /string/i },
  { key: 'rope', test: /rope/i },
  { key: 'strip', test: /strip|tape/i },
  { key: 'puck', test: /puck/i },
  { key: 'step', test: /step/i },
  { key: 'nightlight', test: /night\s?light/i },
];

/** Returns an icon key from an API category name, or null if it isn't a lighting category. */
export function pickLightingIcon(name = '') {
  const rule = MATCH_RULES.find((r) => r.test.test(name));
  return rule?.key ?? null;
}

export function isLightingCategory(name = '') {
  return pickLightingIcon(name) !== null;
}

export default function CategoryIcon({ categoryKey, name, className = 'h-10 w-10' }) {
  const key = categoryKey ?? pickLightingIcon(name);
  const inner = ICON_MARKUP[key];
  if (!inner) return null;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
      // eslint-disable-next-line react/no-danger -- static, hand-authored markup only, see file header
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}

export { LIGHTING_CATEGORIES };
