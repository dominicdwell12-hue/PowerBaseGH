import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField, { inputClass } from '../../components/common/FormField.jsx';
import Button from '../../components/common/Button.jsx';
import { useAdminAuth } from '../../hooks/useAdminAuth.js';

export default function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
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
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.message ?? 'Could not sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-DEFAULT px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6">
        <p className="font-display text-lg font-800 text-ink-900">
          PowerBase<span className="text-gold-700">.</span>Gh
          <span className="ml-2 font-tag text-xs font-normal text-ash">Admin</span>
        </p>
        <h1 className="mt-4 font-display text-xl font-700 text-ink-900">Sign in</h1>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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

          {error && <p className="text-sm text-brick-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
