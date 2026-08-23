import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FormField, { inputClass } from '../../components/common/FormField.jsx';
import PasswordField from '../../components/common/PasswordField.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { isValidEmail } from '../../utils/validators.js';

// axiosClient always rejects with { success, message, errors } (see
// api/axiosClient.js::shapeError) — map that into copy a customer can
// act on, without ever leaking raw backend/technical error text.
function friendlyLoginError(err) {
  const message = err?.message || '';
  if (message === 'Network error') {
    return 'Something went wrong. Please check your connection and try again.';
  }
  if (/invalid email or password/i.test(message) || /deactivated/i.test(message) || /too many/i.test(message)) {
    return message; // these backend messages are already customer-safe and specific
  }
  return message || 'Something went wrong. Please try again.';
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function set(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    };
  }

  function validate() {
    const errors = {};
    if (!form.email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!form.password) {
      errors.password = 'Please enter your password.';
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      // "Remember me" governs how long the browser should keep offering a
      // silent session on return visits. The refresh token itself is an
      // httpOnly cookie the frontend can't touch directly — so we persist
      // the preference for the UI to honor going forward via localStorage,
      // without weakening how the cookie is issued server-side.
      localStorage.setItem('powerbase_remember_me', rememberMe ? '1' : '0');
      await login(form);
      navigate(location.state?.from?.pathname ?? '/', { replace: true });
    } catch (err) {
      setFormError(friendlyLoginError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="font-display text-xl font-800 text-cream">
          PowerBase<span className="text-gold">.</span>Gh
        </p>
        <h1 className="mt-4 font-display text-2xl font-800 text-cream">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-100">Sign in to continue to your account.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            value={form.email}
            onChange={set('email')}
          />
        </FormField>

        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={set('password')}
          error={fieldErrors.password}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-100">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-ink-600 accent-gold"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-gold-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-brick-50/10 px-3 py-2 text-sm text-brick-400">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-100">
        New here?{' '}
        <Link to="/register" className="font-medium text-gold-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
