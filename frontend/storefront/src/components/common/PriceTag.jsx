import { formatCurrency } from '../../utils/formatCurrency.js';

/**
 * The signature element referenced in the design token system: a die-cut
 * "market tag" badge (see .price-tag in styles/index.css) used everywhere
 * a price or discount appears, so pricing reads consistently across the
 * whole storefront — product cards, product detail, cart, checkout.
 */
export default function PriceTag({ price, compareAtPrice, size = 'md' }) {
  const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(price);
  const textSize = size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`price-tag ${textSize}`}>{formatCurrency(price)}</span>
      {hasDiscount && (
        <span className="font-tag text-xs text-ash line-through">
          {formatCurrency(compareAtPrice)}
        </span>
      )}
    </span>
  );
}
