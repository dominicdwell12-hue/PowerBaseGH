import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Products' },
  { to: '/categories', label: 'Categories' },
  { to: '/orders', label: 'Orders' },
  { to: '/customers', label: 'Customers' },
  { to: '/delivery-zones', label: 'Delivery zones' },
];

export default function Sidebar() {
  return (
    <nav className="flex h-full w-56 shrink-0 flex-col gap-1 border-r border-ink-50 bg-ink p-4 text-paper">
      <p className="mb-4 px-2 font-display text-lg font-800">
        Arcvan<span className="text-gold">.</span>GH
        <span className="ml-1 block font-tag text-xs font-normal text-ink-100">Admin</span>
      </p>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-gold text-ink-900' : 'text-ink-100 hover:bg-ink-600'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
