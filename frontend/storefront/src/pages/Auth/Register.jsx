import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField, { inputClass } from '../../components/common/FormField.jsx';
import PasswordField from '../../components/common/PasswordField.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { isValidEmail, isValidGhPhone } from '../../utils/validators.js';

// Mirrors auth.validation.js::registerSchema server-side — kept in sync
// so the frontend can give instant feedback instead of round-tripping.
function validate(form) {
  const errors = {};

  if (!form.firstName.trim()) errors.firstName = 'Please enter your first name.';
  else if (form.firstName.trim().length < 2) errors.firstName = 'First name must be at least 2 characters.';

  if (!form.lastName.trim()) errors.lastName = 'Please enter your last name.';
  else if (form.lastName.trim().length < 2) errors.lastName = 'Last name must be at least 2 characters.';

  if (!form.email.trim()) errors.email = 'Please enter your email address.';
  else if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address.';

  if (form.phone.trim() && !isValidGhPhone(form.phone)) {
    errors.phone = 'Enter a valid phone number, e.g. 024XXXXXXX.';
  }

  if (!form.password) errors.password = 'Please enter a password.';
  else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.';
  else if (!/[A-Z]/.test(form.password)) errors.password = 'Password must contain at least one uppercase letter.';
  else if (!/[0-9]/.test(form.password)) errors.password = 'Password must contain at least one number.';

  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
  else if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.';

  return errors;
}

function friendlyRegisterError(err) {
  const message = err?.message || '';
  if (message === 'Network error') {
    return 'Something went wrong. Please check your connection and try again.';
  }
  if (/already exists/i.test(message) || /too many/i.test(message)) {
    return message;
  }
  return message || 'Something went wrong. Please try again.';
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function set(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      navigate('/', { replace: true });
    } catch (err) {
      // Surface field-level errors from Zod (e.g. duplicate email is
      // form-level, but validation errors come back as { field, message }).
      if (Array.isArray(err?.errors) && err.errors.length > 0) {
        const mapped = {};
        for (const e2 of err.errors) {
          if (e2.field) mapped[e2.field] = e2.message;
        }
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped);
          setIsSubmitting(false);
          return;
        }
      }
      setFormError(friendlyRegisterError(err));
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
        <h1 className="mt-4 font-display text-2xl font-800 text-cream">Create an account</h1>
        <p className="mt-1 text-sm text-ink-100">Join to track orders, save favorites, and checkout faster.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" htmlFor="firstName" error={fieldErrors.firstName}>
            <input
              id="firstName"
              autoComplete="given-name"
              className={inputClass}
              value={form.firstName}
              onChange={set('firstName')}
            />
          </FormField>
          <FormField label="Last name" htmlFor="lastName" error={fieldErrors.lastName}>
            <input
              id="lastName"
              autoComplete="family-name"
              className={inputClass}
              value={form.lastName}
              onChange={set('lastName')}
            />
          </FormField>
        </div>

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

        <FormField label="Phone number" htmlFor="phone" error={fieldErrors.phone}>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="024XXXXXXX"
            className={inputClass}
            value={form.phone}
            onChange={set('phone')}
          />
        </FormField>

        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={set('password')}
          error={fieldErrors.password}
        />
        {!fieldErrors.password && (
          <p className="-mt-2 text-xs text-ink-100">At least 8 characters, with one uppercase letter and one number.</p>
        )}

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={set('confirmPassword')}
          error={fieldErrors.confirmPassword}
        />

        {formError && (
          <p role="alert" className="rounded-lg bg-brick-50/10 px-3 py-2 text-sm text-brick-400">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-100">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-gold-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
