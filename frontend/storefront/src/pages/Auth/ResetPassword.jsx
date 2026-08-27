import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PasswordField from '../../components/common/PasswordField.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';

function validate(form) {
  const errors = {};
  if (!form.newPassword) errors.newPassword = 'Please enter a new password.';
  else if (form.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters.';
  else if (!/[A-Z]/.test(form.newPassword)) errors.newPassword = 'Password must contain at least one uppercase letter.';
  else if (!/[0-9]/.test(form.newPassword)) errors.newPassword = 'Password must contain at least one number.';

  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your new password.';
  else if (form.confirmPassword !== form.newPassword) errors.confirmPassword = 'Passwords do not match.';

  return errors;
}

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const linkIsIncomplete = !token || !email;

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
      await resetPassword({ email, token, ...form });
      setIsDone(true);
    } catch (err) {
      const message = err?.message || '';
      setFormError(
        message === 'Network error'
          ? 'Something went wrong. Please check your connection and try again.'
          : message || 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (linkIsIncomplete) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-800 text-cream">Invalid reset link</h1>
        <p className="mt-2 text-sm text-ink-100">
          This password reset link is missing information. Please request a new one.
        </p>
        <Link to="/forgot-password" className="mt-6 inline-block text-sm font-medium text-gold-700 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-800 text-cream">Password reset successfully</h1>
        <p className="mt-2 text-sm text-ink-100">You can now sign in with your new password.</p>
        <Button as={Link} to="/login" className="mt-6 inline-flex">
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="font-display text-xl font-800 text-cream">
          Arcvan<span className="text-gold">.</span>GH
        </p>
        <h1 className="mt-4 font-display text-2xl font-800 text-cream">Set a new password</h1>
        <p className="mt-1 text-sm text-ink-100">Resetting the password for {email}.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        <PasswordField
          id="newPassword"
          label="New password"
          autoComplete="new-password"
          value={form.newPassword}
          onChange={set('newPassword')}
          error={fieldErrors.newPassword}
        />
        {!fieldErrors.newPassword && (
          <p className="-mt-2 text-xs text-ink-100">At least 8 characters, with one uppercase letter and one number.</p>
        )}

        <PasswordField
          id="confirmPassword"
          label="Confirm new password"
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
          {isSubmitting ? 'Resetting password…' : 'Reset password'}
        </Button>
      </form>
    </div>
  );
}
