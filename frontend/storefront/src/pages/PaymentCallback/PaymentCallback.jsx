import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner.jsx';
import Button from '../../components/common/Button.jsx';
import * as paymentApi from '../../api/paymentApi.js';

// Paystack redirects back with ?reference=... (also ?trxref=...),
// Flutterwave with ?tx_ref=...&status=...&transaction_id=... — read
// whichever is present rather than assuming one gateway.
function extractReference(searchParams) {
  return searchParams.get('reference') || searchParams.get('trxref') || searchParams.get('tx_ref');
}

// The reference this app generates is `PBG-{orderNumber}-{8 hex chars}`
// (see payment.service.js::generateReference) — the order number itself
// contains hyphens (ORD-YYYYMMDD-NNNNN), so a naive split('-') would cut
// it short. The random suffix is always exactly 8 hex characters, which
// gives a reliable anchor to pull the order number back out for the
// "track this order" link below.
function extractOrderNumber(reference) {
  const match = /^PBG-(.+)-[0-9a-f]{8}$/i.exec(reference || '');
  return match ? match[1] : null;
}

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', orderNumber: null, message: null });

  useEffect(() => {
    const reference = extractReference(searchParams);

    if (!reference) {
      setState({ status: 'error', orderNumber: null, message: 'No payment reference was provided.' });
      return;
    }

    const orderNumber = extractOrderNumber(reference);

    paymentApi
      .verifyPayment(reference)
      .then((result) => {
        const isPaid = result.payment.status === 'successful';
        setState({
          status: isPaid ? 'success' : 'failed',
          orderNumber,
          message: isPaid ? null : 'The payment gateway reported this payment as unsuccessful.',
        });
      })
      .catch((err) => {
        setState({ status: 'error', orderNumber, message: err?.message ?? 'Could not verify this payment.' });
      });
  }, [searchParams]);

  if (state.status === 'loading') {
    return <Spinner label="Confirming your payment" />;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      {state.status === 'success' ? (
        <>
          <p className="font-tag text-xs uppercase tracking-wide text-forest-600">Payment received</p>
          <h1 className="mt-2 font-display text-2xl font-800 text-ink-900">Thank you!</h1>
          <p className="mt-2 text-ash">Your payment went through and your order is confirmed.</p>
        </>
      ) : (
        <>
          <p className="font-tag text-xs uppercase tracking-wide text-brick-600">Payment not confirmed</p>
          <h1 className="mt-2 font-display text-2xl font-800 text-ink-900">
            {state.status === 'failed' ? 'Payment unsuccessful' : "Couldn't confirm payment"}
          </h1>
          <p className="mt-2 text-ash">
            {state.message ?? 'Something went wrong confirming this payment.'} If you were charged, your order will
            still update automatically once the payment provider notifies us — check order tracking shortly.
          </p>
        </>
      )}

      <div className="mt-6 flex justify-center gap-3">
        {state.orderNumber ? (
          <Button as={Link} to={`/orders/${state.orderNumber}`}>
            Track this order
          </Button>
        ) : (
          <Button onClick={() => navigate('/orders')}>View your orders</Button>
        )}
        <Button variant="outline" as={Link} to="/products">
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
