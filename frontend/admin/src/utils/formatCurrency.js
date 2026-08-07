const formatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  currencyDisplay: 'narrowSymbol',
});

export function formatCurrency(amount) {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(value)) return formatter.format(0);
  return formatter.format(value);
}
