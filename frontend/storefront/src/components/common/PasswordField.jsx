import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import FormField, { inputClass } from './FormField.jsx';

// Shared password input for Login/Register/Reset — same look everywhere,
// with a show/hide toggle so people can check what they typed before
// submitting (especially useful on mobile keyboards).
export default function PasswordField({ id, label, value, onChange, error, autoComplete, minLength }) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField label={label} htmlFor={id} error={error}>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          className={`${inputClass} pr-10`}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-100 hover:text-cream"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </FormField>
  );
}
