import { useState } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * Drop-in <img> replacement that never shows a broken-image icon.
 * If `src` is missing or the request errors, it renders `fallback`
 * (or a plain icon-on-brand-background) instead — sized by the
 * parent, so it never causes layout shift.
 */
export default function ImageWithFallback({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  fallback = null,
  loading = 'lazy',
  fetchPriority,
  sizes,
  fallbackIconSize = 32,
}) {
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;

  if (showFallback) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-ink-50 ${containerClassName}`}
      >
        {fallback ?? <ImageOff size={fallbackIconSize} className="text-ink-400" aria-hidden="true" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      sizes={sizes}
      onError={() => setErrored(true)}
      className={className}
    />
  );
}
