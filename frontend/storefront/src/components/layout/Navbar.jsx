import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../../hooks/useCart.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function Navbar() {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-ink-DEFAULT text-paper">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0 font-display text-xl font-800 tracking-tight">
          PowerBase<span className="text-gold-DEFAULT">.</span>Gh
        </Link>

        <form
          role="search"
          className="hidden flex-1 items-center sm:flex"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/products?search=${encodeURIComponent(query)}`);
          }}
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, categories"
            aria-label="Search products"
            className="w-full rounded-l-lg border-0 px-3 py-2 text-sm text-ink-900
              placeholder:text-ash focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-r-lg bg-gold-DEFAULT px-4 py-2 text-sm font-semibold
              text-ink-900 hover:bg-gold-700"
          >
            Search
          </button>
        </form>

        <nav className="ml-auto flex items-center gap-4 text-sm">
          <NavLink to="/wishlist" className="hover:text-gold-DEFAULT">
            Wishlist
          </NavLink>
          <NavLink to="/cart" className="relative hover:text-gold-DEFAULT">
            Cart
            {itemCount > 0 && (
              <span
                className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center
                  rounded-full bg-brick-DEFAULT text-[10px] font-semibold"
              >
                {itemCount}
              </span>
            )}
          </NavLink>
          <NavLink
            to={isAuthenticated ? '/profile' : '/login'}
            className="hover:text-gold-DEFAULT"
          >
            {isAuthenticated ? 'Account' : 'Sign in'}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
