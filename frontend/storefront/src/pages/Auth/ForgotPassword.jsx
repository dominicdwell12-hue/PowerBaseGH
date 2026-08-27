import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField, { inputClass } from '../../components/common/FormField.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { isValidEmail } from '../../utils/validators.js';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email.trim());
      // Backend intentionally responds the same way whether or not the
      // email is registered — the UI mirrors that here too.
      setIsSent(true);
    } catch (err) {
      const message = err?.message || '';
      setError(
        message === 'Network error'
          ? 'Something went wrong. Please check your connection and try again.'
          : message || 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSent) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center sm:px-6">
        <p className="font-display text-xl font-800 text-cream">
          Arcvan<span className="text-gold">.</span>GH
        </p>
        <h1 className="mt-6 font-display text-2xl font-800 text-cream">Check your email</h1>
        <p className="mt-2 text-sm text-ink-100">
          If an account exists for <span className="text-cream">{email}</span>, we've sent a link to reset your
          password. The link expires in 30 minutes.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-gold-700 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="font-display text-xl font-800 text-cream">
          Arcvan<span className="text-gold">.</span>GH
        </p>
        <h1 className="mt-4 font-display text-2xl font-800 text-cream">Forgot your password?</h1>
        <p className="mt-1 text-sm text-ink-100">
          Enter the email on your account and we'll send you a link to reset it.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        <FormField label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
          />
        </FormField>

        {error && (
          <p role="alert" className="rounded-lg bg-brick-50/10 px-3 py-2 text-sm text-brick-400">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending reset link…' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-100">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-gold-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
