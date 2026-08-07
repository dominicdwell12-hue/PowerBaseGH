import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import FormField, { inputClass } from '../../components/common/FormField.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import AddressForm from '../../components/checkout/AddressForm.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import * as userApi from '../../api/userApi.js';
import * as deliveryApi from '../../api/deliveryApi.js';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-800 text-ink-900">Your account</h1>
      <AccountDetailsSection user={user} onSaved={setUser} />
      <ChangePasswordSection onChanged={() => { logout(); navigate('/login'); }} />
      <AddressBookSection queryClient={queryClient} />
    </div>
  );
}

function AccountDetailsSection({ user, onSaved }) {
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [status, setStatus] = useState(null);

  const mutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (updated) => {
      onSaved(updated);
      setStatus({ type: 'success', message: 'Profile updated.' });
    },
    onError: (err) => setStatus({ type: 'error', message: err?.message ?? 'Could not update profile.' }),
  });

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  return (
    <section>
      <h2 className="font-display text-lg font-700 text-ink-900">Account details</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setStatus(null);
          mutation.mutate(form);
        }}
        className="mt-3 grid gap-3 rounded-xl border border-ink-50 bg-white p-4 sm:grid-cols-2"
      >
        <FormField label="First name" htmlFor="firstName">
          <input id="firstName" required className={inputClass} value={form.firstName} onChange={set('firstName')} />
        </FormField>
        <FormField label="Last name" htmlFor="lastName">
          <input id="lastName" required className={inputClass} value={form.lastName} onChange={set('lastName')} />
        </FormField>
        <FormField label="Email" htmlFor="email">
          <input id="email" type="email" required className={inputClass} value={form.email} onChange={set('email')} />
        </FormField>
        <FormField label="Phone" htmlFor="phone">
          <input id="phone" required className={inputClass} value={form.phone} onChange={set('phone')} />
        </FormField>

        <div className="sm:col-span-2">
          {status && (
            <p className={`mb-2 text-sm ${status.type === 'success' ? 'text-forest-600' : 'text-brick-600'}`}>
              {status.message}
            </p>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </section>
  );
}

function ChangePasswordSection({ onChanged }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [status, setStatus] = useState(null);

  const mutation = useMutation({
    mutationFn: userApi.changePassword,
    onSuccess: () => {
      setStatus({ type: 'success', message: 'Password changed. Please sign in again.' });
      setTimeout(onChanged, 1200);
    },
    onError: (err) => setStatus({ type: 'error', message: err?.message ?? 'Could not change password.' }),
  });

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  return (
    <section>
      <h2 className="font-display text-lg font-700 text-ink-900">Change password</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setStatus(null);
          mutation.mutate(form);
        }}
        className="mt-3 space-y-3 rounded-xl border border-ink-50 bg-white p-4"
      >
        <FormField label="Current password" htmlFor="currentPassword">
          <input
            id="currentPassword"
            type="password"
            required
            className={inputClass}
            value={form.currentPassword}
            onChange={set('currentPassword')}
          />
        </FormField>
        <FormField label="New password" htmlFor="newPassword">
          <input
            id="newPassword"
            type="password"
            required
            minLength={8}
            className={inputClass}
            value={form.newPassword}
            onChange={set('newPassword')}
          />
        </FormField>
        <p className="text-xs text-ash">
          At least 8 characters, with one uppercase letter and one number.
        </p>
        {status && (
          <p className={`text-sm ${status.type === 'success' ? 'text-forest-600' : 'text-brick-600'}`}>
            {status.message}
          </p>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Updating…' : 'Change password'}
        </Button>
      </form>
    </section>
  );
}

function AddressBookSection({ queryClient }) {
  const [editingId, setEditingId] = useState(null); // null = none, 'new' = adding, id = editing
  const addressesQuery = useQuery({ queryKey: ['addresses'], queryFn: userApi.listAddresses });
  const zonesQuery = useQuery({ queryKey: ['deliveryZones'], queryFn: deliveryApi.listDeliveryZones });

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => (id ? userApi.updateAddress(id, payload) : userApi.addAddress(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.deleteAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const setDefaultMutation = useMutation({
    mutationFn: userApi.setDefaultAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  if (addressesQuery.isLoading || zonesQuery.isLoading) return <Spinner label="Loading addresses" />;

  const editingAddress =
    editingId && editingId !== 'new' ? addressesQuery.data?.find((a) => a.id === editingId) : null;

  return (
    <section>
      <h2 className="font-display text-lg font-700 text-ink-900">Saved addresses</h2>

      <ul className="mt-3 space-y-2">
        {addressesQuery.data?.map((address) => (
          <li key={address.id} className="rounded-xl border border-ink-50 bg-white p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink-900">
                  {address.label ? `${address.label} — ` : ''}
                  {address.recipientName}
                  {address.isDefault && (
                    <span className="ml-2 rounded-full bg-forest-50 px-2 py-0.5 text-xs text-forest-600">
                      Default
                    </span>
                  )}
                </p>
                <p className="text-ash">
                  {address.street}, {address.city.name} · {address.phone}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
                <button
                  type="button"
                  className="font-medium text-gold-700 hover:underline"
                  onClick={() => setEditingId(address.id)}
                >
                  Edit
                </button>
                {!address.isDefault && (
                  <button
                    type="button"
                    className="font-medium text-ash hover:underline"
                    onClick={() => setDefaultMutation.mutate(address.id)}
                  >
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  className="font-medium text-brick-600 hover:underline"
                  onClick={() => deleteMutation.mutate(address.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            {editingId === address.id && (
              <AddressForm
                zones={zonesQuery.data}
                initialValues={address}
                isSubmitting={saveMutation.isPending}
                onSubmit={(payload) => saveMutation.mutateAsync({ id: address.id, payload })}
                onCancel={() => setEditingId(null)}
              />
            )}
          </li>
        ))}
      </ul>

      {editingId === 'new' ? (
        <AddressForm
          zones={zonesQuery.data}
          isSubmitting={saveMutation.isPending}
          onSubmit={(payload) => saveMutation.mutateAsync({ id: null, payload })}
          onCancel={() => setEditingId(null)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditingId('new')}
          className="mt-3 text-sm font-medium text-gold-700 hover:underline"
        >
          + Add a new address
        </button>
      )}
    </section>
  );
}
