
import { Currency } from '@/types';

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
];

export const getDefaultCurrency = (): Currency => {
  return currencies[0]; // US Dollar as default
};

export const formatAmount = (amount: number, currency: Currency): string => {
  return `${currency.symbol}${amount.toFixed(2)}`;
};

export const getCurrencyByCode = (code: string): Currency => {
  const currency = currencies.find(c => c.code === code);
  return currency || getDefaultCurrency();
};
