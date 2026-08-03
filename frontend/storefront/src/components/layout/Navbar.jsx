import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../hooks/useCart.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function Navbar() {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0 font-display text-xl font-800 tracking-tight">
          PowerBase<span className="text-gold">.</span>Gh
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
            placeholder="Search for products, categories…"
            aria-label="Search products"
            className="w-full rounded-l-lg border-0 px-3 py-2 text-sm text-ink-900
              placeholder:text-ash focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="rounded-r-lg bg-gold px-4 py-2 text-sm font-semibold
              text-ink-900 hover:bg-gold-700"
          >
            Search
          </button>
        </form>

        <nav className="ml-auto flex items-center gap-5 text-xs">
          <NavLink to="/wishlist" className="flex flex-col items-center gap-0.5 hover:text-gold">
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
            Cart
          </NavLink>
          <NavLink
            to={isAuthenticated ? '/profile' : '/login'}
            className="flex flex-col items-center gap-0.5 hover:text-gold"
          >
            <User size={20} aria-hidden="true" />
            {isAuthenticated ? 'Account' : 'Sign in'}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
