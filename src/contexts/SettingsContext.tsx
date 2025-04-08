
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Settings, Currency } from '@/types';
import { getSettings, saveSettings } from '@/utils/settings';
import { getDefaultCurrency } from '@/utils/currencies';

interface SettingsContextType {
  settings: Settings;
  updateCurrency: (currency: Currency) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({
    currency: getDefaultCurrency(),
  });

  useEffect(() => {
    // Load settings from localStorage on component mount
    const savedSettings = getSettings();
    setSettings(savedSettings);
  }, []);

  const updateCurrency = (currency: Currency) => {
    const newSettings = { ...settings, currency };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};
