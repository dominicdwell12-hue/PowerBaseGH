import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="mt-16 border-t border-ink-600 bg-ink-900 text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-2xl font-700">
            Arcvan<span className="text-gold">.</span>GH
          </p>
          <p className="mt-3 max-w-xs text-sm text-ink-100">
            Real products at real prices, delivered across Ghana. Pay on delivery in Kumasi,
            prepay by card or Mobile Money everywhere else.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">Shop</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-100">
            <li><Link to="/products" className="hover:text-cream">All products</Link></li>
            <li><Link to="/products?sort=newest" className="hover:text-cream">New arrivals</Link></li>
            <li><Link to="/wishlist" className="hover:text-cream">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">Customer Care</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-100">
            <li><Link to="/support" className="hover:text-cream">Contact &amp; support</Link></li>
            <li><Link to="/orders" className="hover:text-cream">Track an order</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">Account</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-100">
            {isAuthenticated ? (
              <>
                <li><Link to="/profile" className="hover:text-cream">My account</Link></li>
                <li><Link to="/orders" className="hover:text-cream">My orders</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="hover:text-cream">Sign in</Link></li>
                <li><Link to="/register" className="hover:text-cream">Create an account</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-600 px-4 py-4 text-center text-xs text-ink-100 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Arcvan Ghana Limited.
      </div>
    </footer>
  );
}
