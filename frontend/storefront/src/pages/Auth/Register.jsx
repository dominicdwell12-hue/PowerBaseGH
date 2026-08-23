import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField, { inputClass } from '../../components/common/FormField.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.message ?? 'Could not create your account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-800 text-cream">Create an account</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" htmlFor="firstName">
            <input id="firstName" required className={inputClass} value={form.firstName} onChange={set('firstName')} />
          </FormField>
          <FormField label="Last name" htmlFor="lastName">
            <input id="lastName" required className={inputClass} value={form.lastName} onChange={set('lastName')} />
          </FormField>
        </div>
        <FormField label="Email" htmlFor="email">
          <input id="email" type="email" required className={inputClass} value={form.email} onChange={set('email')} />
        </FormField>
        <FormField label="Phone" htmlFor="phone">
          <input id="phone" placeholder="0XXXXXXXXX" className={inputClass} value={form.phone} onChange={set('phone')} />
        </FormField>
        <FormField label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            required
            minLength={8}
            className={inputClass}
            value={form.password}
            onChange={set('password')}
          />
        </FormField>
        <p className="text-xs text-ink-100">At least 8 characters, with one uppercase letter and one number.</p>

        {error && <p className="text-sm text-brick-400">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-100">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-gold-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
