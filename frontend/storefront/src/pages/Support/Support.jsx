export default function Support() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-800 text-cream">Support</h1>
      <p className="mt-2 text-ink-100">
        Have a question about an order, delivery, or returns? We're here to help.
      </p>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="font-display text-lg font-700 text-cream">Delivery &amp; pay on delivery</h2>
          <p className="mt-1 text-sm text-ink-100">
            Pay on Delivery is available for Kumasi addresses. Every other city requires
            payment by card or Mobile Money at checkout — this is checked automatically
            based on the delivery address you choose.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-700 text-cream">Returns</h2>
          <p className="mt-1 text-sm text-ink-100">
            If something isn't right with your order, contact us within 7 days of delivery
            and we'll help sort it out.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-700 text-cream">Contact us</h2>
          <p className="mt-1 text-sm text-ink-100">
            Reach us at{' '}
            <a href="mailto:support@arcvangh.com" className="text-gold-700 hover:underline">
              support@arcvangh.com
            </a>{' '}
            for anything not covered here.
          </p>
        </section>
      </div>
    </div>
  );
}
