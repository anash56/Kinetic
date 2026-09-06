export const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(Number(value || 0));

export const formatMonth = (date) => new Date(date).toLocaleString('en', { month: 'short', year: '2-digit' });
