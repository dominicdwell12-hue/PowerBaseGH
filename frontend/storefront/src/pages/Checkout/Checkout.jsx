import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import AddressForm from '../../components/checkout/AddressForm.jsx';
import { useCart } from '../../hooks/useCart.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import * as userApi from '../../api/userApi.js';
import * as deliveryApi from '../../api/deliveryApi.js';
import * as orderApi from '../../api/orderApi.js';
import * as paymentApi from '../../api/paymentApi.js';

// The gateway (provider) is a separate concern from the customer-facing
// paymentMethod: order.paymentMethod is 'card' | 'mobile_money' |
// 'pay_on_delivery' (see order.validation.js), while POST
// /payments/initialize takes provider: 'paystack' | 'flutterwave' (see
// payment.validation.js) and doesn't care which paymentMethod the order
// was placed with. This is the mapping this storefront uses between the
// two — Paystack for card, Flutterwave for Mobile Money — since the API
// doesn't dictate one.
const PROVIDER_BY_METHOD = { card: 'paystack', mobile_money: 'flutterwave' };

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, subtotal, isLoading: cartLoading, hasUnavailableItems } = useCart();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('pay_on_delivery');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const addressesQuery = useQuery({ queryKey: ['addresses'], queryFn: userApi.listAddresses });
  const zonesQuery = useQuery({ queryKey: ['deliveryZones'], queryFn: deliveryApi.listDeliveryZones });

  useEffect(() => {
    if (!selectedAddressId && addressesQuery.data?.length) {
      const defaultAddress = addressesQuery.data.find((a) => a.isDefault) ?? addressesQuery.data[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addressesQuery.data, selectedAddressId]);

  const selectedAddress = addressesQuery.data?.find((a) => a.id === selectedAddressId);

  const podCheckQuery = useQuery({
    queryKey: ['podCheck', selectedAddress?.city?.id],
    queryFn: () => deliveryApi.checkPodEligibility(selectedAddress.city.id),
    enabled: Boolean(selectedAddress),
  });

  // If the selected address's city doesn't support POD, fall back to card.
  useEffect(() => {
    if (podCheckQuery.data && !podCheckQuery.data.payOnDeliveryAvailable && paymentMethod === 'pay_on_delivery') {
      setPaymentMethod('card');
    }
  }, [podCheckQuery.data, paymentMethod]);

  const addAddressMutation = useMutation({
    mutationFn: userApi.addAddress,
    onSuccess: (address) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setSelectedAddressId(address.id);
      setShowAddressForm(false);
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: orderApi.createOrder,
  });

  const initializePaymentMutation = useMutation({
    mutationFn: paymentApi.initializePayment,
  });

  const deliveryFee = podCheckQuery.data?.deliveryFee ?? 0;
  const total = subtotal + deliveryFee;
  const isPlacing = placeOrderMutation.isPending || initializePaymentMutation.isPending;

  async function handlePlaceOrder() {
    setSubmitError(null);
    if (!selectedAddressId) {
      setSubmitError('Choose a delivery address first.');
      return;
    }

    try {
      const order = await placeOrderMutation.mutateAsync({
        addressId: selectedAddressId,
        paymentMethod,
      });

      queryClient.invalidateQueries({ queryKey: ['cart'] });

      if (paymentMethod === 'pay_on_delivery') {
        navigate(`/orders/${order.orderNumber}/confirmation`);
        return;
      }

      const { authorizationUrl } = await initializePaymentMutation.mutateAsync({
        orderId: order.id,
        provider: PROVIDER_BY_METHOD[paymentMethod],
      });
      window.location.assign(authorizationUrl);
    } catch (err) {
      setSubmitError(err?.message ?? 'Could not place your order.');
    }
  }

  if (cartLoading || addressesQuery.isLoading || zonesQuery.isLoading) {
    return <Spinner label="Loading checkout" />;
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-800 text-ink-900">Nothing to check out</h1>
        <p className="mt-3 text-ash">Your cart is empty.</p>
        <Button className="mt-6" onClick={() => navigate('/products')}>
          Start shopping
        </Button>
      </div>
    );
  }

  if (addressesQuery.isError || zonesQuery.isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <ErrorState
          message={addressesQuery.error?.message ?? zonesQuery.error?.message}
          onRetry={() => {
            addressesQuery.refetch();
            zonesQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-800 text-ink-900">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="font-display text-lg font-700 text-ink-900">Delivery address</h2>

            {!addressesQuery.data?.length && !showAddressForm && (
              <p className="mt-2 text-sm text-ash">You don't have any saved addresses yet.</p>
            )}

            <div className="mt-3 space-y-2">
              {addressesQuery.data?.map((address) => (
                <label
                  key={address.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
                    selectedAddressId === address.id ? 'border-gold-DEFAULT' : 'border-ink-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    className="mt-1"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                  />
                  <span className="text-sm">
                    <span className="font-semibold text-ink-900">
                      {address.label ? `${address.label} — ` : ''}
                      {address.recipientName}
                    </span>
                    {address.isDefault && (
                      <span className="ml-2 rounded-full bg-forest-50 px-2 py-0.5 text-xs text-forest-600">
                        Default
                      </span>
                    )}
                    <br />
                    <span className="text-ash">
                      {address.street}, {address.city.name} · {address.phone}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            {showAddressForm ? (
              <AddressForm
                zones={zonesQuery.data}
                isSubmitting={addAddressMutation.isPending}
                onSubmit={(payload) => addAddressMutation.mutateAsync(payload)}
                onCancel={() => setShowAddressForm(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowAddressForm(true)}
                className="mt-3 text-sm font-medium text-gold-700 hover:underline"
              >
                + Add a new address
              </button>
            )}
          </section>

          <section>
            <h2 className="font-display text-lg font-700 text-ink-900">Payment method</h2>
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-3 rounded-xl border border-ink-50 p-3 text-sm">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'pay_on_delivery'}
                  disabled={!podCheckQuery.data?.payOnDeliveryAvailable}
                  onChange={() => setPaymentMethod('pay_on_delivery')}
                />
                <span>
                  Pay on Delivery
                  {selectedAddress && !podCheckQuery.data?.payOnDeliveryAvailable && (
                    <span className="ml-2 text-xs text-ash">
                      (not available in {selectedAddress.city.name} — prepay required)
                    </span>
                  )}
                </span>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-ink-50 p-3 text-sm">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                Card
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-ink-50 p-3 text-sm">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'mobile_money'}
                  onChange={() => setPaymentMethod('mobile_money')}
                />
                Mobile Money
              </label>
            </div>
          </section>
        </div>

        <div className="h-fit rounded-xl border border-ink-50 bg-white p-5">
          <h2 className="font-display text-lg font-700 text-ink-900">Order summary</h2>
          <ul className="mt-3 space-y-1 text-sm text-ash">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-tag">{formatCurrency(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-ink-50 pt-3 text-sm">
            <div className="flex justify-between text-ash">
              <span>Subtotal</span>
              <span className="font-tag text-ink-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ash">
              <span>Delivery fee</span>
              <span className="font-tag text-ink-900">
                {selectedAddress ? formatCurrency(deliveryFee) : '—'}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold text-ink-900">
              <span>Total</span>
              <span className="font-tag">{formatCurrency(total)}</span>
            </div>
          </div>

          {submitError && <p className="mt-3 text-sm text-brick-600">{submitError}</p>}

          <Button
            className="mt-4 w-full"
            disabled={isPlacing || hasUnavailableItems || !selectedAddressId}
            onClick={handlePlaceOrder}
          >
            {isPlacing ? 'Placing order…' : 'Place order'}
          </Button>
        </div>
      </div>
    </div>
  );
}
