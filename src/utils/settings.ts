
import { Settings, Currency } from '@/types';
import { getDefaultCurrency, getCurrencyByCode } from './currencies';

const SETTINGS_KEY = 'expense_splitter_settings';

export const getSettings = (): Settings => {
  const storedSettings = localStorage.getItem(SETTINGS_KEY);
  
  if (storedSettings) {
    try {
      const parsedSettings = JSON.parse(storedSettings);
      const currencyCode = parsedSettings.currency?.code;
      
      // Ensure we have a valid currency object
      if (currencyCode) {
        return {
          ...parsedSettings,
          currency: getCurrencyByCode(currencyCode)
        };
      }
    } catch (e) {
      console.error('Failed to parse settings:', e);
    }
  }
  
  // Default settings
  return {
    currency: getDefaultCurrency()
  };
};

export const saveSettings = (settings: Settings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const useCurrentCurrency = (): Currency => {
  return getSettings().currency;
};
