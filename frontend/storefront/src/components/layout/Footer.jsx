export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-100 bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
        <div>
          <p className="font-display text-lg font-700">
            PowerBase<span className="text-gold">.</span>Gh
          </p>
          <p className="mt-2 max-w-xs text-sm text-ink-100">
            Everyday products, delivered across Ghana. Pay on delivery in Kumasi,
            prepay everywhere else.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gold">Shop</p>
          <ul className="mt-2 space-y-1 text-sm text-ink-100">
            <li>All products</li>
            <li>Categories</li>
            <li>Track an order</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-gold">Support</p>
          <ul className="mt-2 space-y-1 text-sm text-ink-100">
            <li>Delivery zones &amp; pay on delivery</li>
            <li>Returns</li>
            <li>Contact us</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-600 px-4 py-4 text-center text-xs text-ink-100 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} PowerBase Gh.
      </div>
    </footer>
  );
}
