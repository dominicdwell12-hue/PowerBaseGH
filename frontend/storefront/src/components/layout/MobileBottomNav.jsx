import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Heart, User, ShoppingBag } from 'lucide-react';
import { useCart } from '../../hooks/useCart.js';
import { useWishlist } from '../../hooks/useWishlist.js';
import { useAuth } from '../../hooks/useAuth.js';

// Only ever links to routes that already exist in AppRoutes.jsx — no dead
// links. "Categories" reuses the home page's own category section rather
// than a route that doesn't exist, since there's no standalone /categories
// page in this app.
const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/products', label: 'Shop', icon: ShoppingBag },
  { to: '/#categories', label: 'Categories', icon: LayoutGrid },
  { to: '/wishlist', label: 'Wishlist', icon: Heart, requiresAuth: true, badgeKey: 'wishlist' },
  { to: '/profile', label: 'Account', icon: User, requiresAuth: true },
];

export default function MobileBottomNav() {
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const wishlistCount = isAuthenticated ? wishlistItems.length : 0;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-600 bg-ink-900/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, requiresAuth, badgeKey }) => {
          const resolvedTo = requiresAuth && !isAuthenticated ? '/login' : to;
          const badgeCount = badgeKey === 'wishlist' ? wishlistCount : badgeKey === 'cart' ? itemCount : 0;

          return (
            <NavLink
              key={label}
              to={resolvedTo}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-gold' : 'text-ink-100'
                }`
              }
            >
              <span className="relative">
                <Icon size={20} aria-hidden="true" />
                {badgeCount > 0 && (
                  <span
                    className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center
                      rounded-full bg-gold px-0.5 text-[9px] font-bold text-ink-900"
                  >
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </span>
              {label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
