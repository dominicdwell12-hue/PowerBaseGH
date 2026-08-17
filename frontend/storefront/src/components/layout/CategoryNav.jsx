import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu, ChevronDown } from 'lucide-react';
import * as categoryApi from '../../api/categoryApi.js';

// Utility links that aren't categories — kept separate from the dynamic
// category links below so this file never has to guess at category names.
const UTILITY_LINKS = [
  { to: '/products?sort=newest', label: 'New Arrivals' },
  { to: '/orders', label: 'Track Order' },
  { to: '/support', label: 'Support' },
];

export default function CategoryNav() {
  const [open, setOpen] = useState(false);
  // Shares the same 'categories' cache key Home.jsx already uses — this
  // won't trigger a second network request once either has fetched it.
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: categoryApi.listCategories });
  const topLevel = categoriesQuery.data ?? [];

  return (
    <div className="relative hidden border-b border-ink-600 bg-ink-900 md:block">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-gold px-3 py-1.5 font-medium text-ink-900"
        >
          <Menu size={16} aria-hidden="true" />
          All Categories
          <ChevronDown size={14} aria-hidden="true" />
        </button>

        {/* Primary nav = the real top-level categories, however many exist
            — not a hardcoded list of names, so this never drifts out of
            sync with what's actually in the database. */}
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `font-medium ${isActive ? 'text-gold' : 'text-ink-100 hover:text-gold'}`}
          >
            Home
          </NavLink>

          {topLevel.map((category) => (
            <NavLink
              key={category.id}
              to={`/products?category=${category.slug}`}
              className={({ isActive }) => `font-medium ${isActive ? 'text-gold' : 'text-ink-100 hover:text-gold'}`}
            >
              {category.name}
            </NavLink>
          ))}

          {UTILITY_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) => `font-medium ${isActive ? 'text-gold' : 'text-ink-100 hover:text-gold'}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {open && (
        <div className="absolute left-4 top-full z-30 w-72 rounded-b-xl border border-t-0 border-ink-600 bg-ink-600 shadow-lg sm:left-6 lg:left-8">
          <ul className="py-2">
            {topLevel.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/products?category=${category.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-2 text-sm font-medium text-cream hover:bg-ink-400/30"
                >
                  {category.name}
                </Link>
                {category.children?.length > 0 && (
                  <ul className="pb-1">
                    {category.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          to={`/products?category=${child.slug}`}
                          onClick={() => setOpen(false)}
                          className="block px-6 py-1.5 text-sm text-ink-100 hover:bg-ink-400/30 hover:text-cream"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            {!topLevel.length && <li className="px-4 py-2 text-sm text-ink-100">No categories yet</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
