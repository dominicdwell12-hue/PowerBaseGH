import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart.js';
import { useAuth } from '../../hooks/useAuth.js';
import * as categoryApi from '../../api/categoryApi.js';

// Non-category utility links for the mobile menu — real categories are
// rendered separately below from the live API, as chips.
const MOBILE_UTILITY_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Shop' },
  { to: '/products?sort=newest', label: 'New Arrivals' },
  { to: '/orders', label: 'Track Order' },
  { to: '/support', label: 'Support' },
];

export default function Navbar() {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  // Shares the 'categories' cache key with Home.jsx/CategoryNav.jsx — no
  // extra network request once any of them has fetched it.
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: categoryApi.listCategories });

  function submitSearch(e) {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(query)}`);
    setMobileSearchOpen(false);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-600 bg-ink-900/95 backdrop-blur text-cream">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0 font-display text-xl font-800 tracking-tight">
          Arcvan<span className="text-gold">.</span>GH
        </Link>

        <form role="search" className="hidden flex-1 sm:flex" onSubmit={submitSearch}>
          <div className="relative w-full">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, categories…"
              aria-label="Search products"
              className="w-full rounded-full border border-ink-600 bg-ink-600 py-2.5 pl-4 pr-11 text-sm text-cream
                placeholder:text-ink-100 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center
                justify-center rounded-full text-ink-100 hover:text-gold"
            >
              <Search size={18} aria-hidden="true" />
            </button>
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-5 text-xs">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="flex flex-col items-center gap-0.5 hover:text-gold sm:hidden"
          >
            <Search size={20} aria-hidden="true" />
          </button>
          <NavLink to="/wishlist" className="hidden flex-col items-center gap-0.5 hover:text-gold sm:flex">
            <Heart size={20} aria-hidden="true" />
            Wishlist
          </NavLink>
          <NavLink to="/cart" className="relative flex flex-col items-center gap-0.5 hover:text-gold">
            <span className="relative">
              <ShoppingCart size={20} aria-hidden="true" />
              {itemCount > 0 && (
                <span
                  className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center
                    rounded-full bg-gold text-[10px] font-semibold text-ink-900"
                >
                  {itemCount}
                </span>
              )}
            </span>
            <span className="hidden sm:inline">Cart</span>
          </NavLink>
          <NavLink
            to={isAuthenticated ? '/profile' : '/login'}
            className="hidden flex-col items-center gap-0.5 hover:text-gold sm:flex"
          >
            <User size={20} aria-hidden="true" />
            {isAuthenticated ? 'Account' : 'Sign in'}
          </NavLink>
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col items-center gap-0.5 hover:text-gold sm:hidden"
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </nav>
      </div>

      {mobileSearchOpen && (
        <form role="search" className="border-t border-ink-600 px-4 py-3 sm:hidden" onSubmit={submitSearch}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, categories…"
            aria-label="Search products"
            autoFocus
            className="w-full rounded-full border border-ink-600 bg-ink-600 py-2.5 px-4 text-sm text-cream
              placeholder:text-ink-100 focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </form>
      )}

      {menuOpen && (
        <div className="border-t border-ink-600 px-4 py-4 sm:hidden">
          <nav className="flex flex-col gap-3 text-sm">
            {MOBILE_UTILITY_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `font-medium ${isActive ? 'text-gold' : 'text-cream'}`}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="font-medium text-cream"
            >
              Wishlist
            </NavLink>
            <NavLink
              to={isAuthenticated ? '/profile' : '/login'}
              onClick={() => setMenuOpen(false)}
              className="font-medium text-cream"
            >
              {isAuthenticated ? 'Account' : 'Sign in'}
            </NavLink>
          </nav>

          {!!categoriesQuery.data?.length && (
            <div className="mt-4 border-t border-ink-600 pt-4">
              <p className="text-xs uppercase tracking-wide text-ink-100">Categories</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {categoriesQuery.data.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full border border-ink-600 bg-ink-600 px-3 py-1 text-xs text-cream"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
