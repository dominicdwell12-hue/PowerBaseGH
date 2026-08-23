import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FormField, { inputClass } from '../../components/common/FormField.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
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
      await login(form);
      navigate(location.state?.from?.pathname ?? '/', { replace: true });
    } catch (err) {
      setError(err?.message ?? 'Could not sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-800 text-cream">Sign in</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            required
            className={inputClass}
            value={form.email}
            onChange={set('email')}
          />
        </FormField>
        <FormField label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            required
            className={inputClass}
            value={form.password}
            onChange={set('password')}
          />
        </FormField>

        {error && <p className="text-sm text-brick-400">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-100">
        New here?{' '}
        <Link to="/register" className="font-medium text-gold-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
