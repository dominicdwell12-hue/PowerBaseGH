export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value ?? '');
}

// Accepts Ghanaian mobile numbers in local (0XXXXXXXXX) or +233 format.
export function isValidGhPhone(value) {
  return /^(?:\+233|0)\d{9}$/.test((value ?? '').replace(/\s+/g, ''));
}
