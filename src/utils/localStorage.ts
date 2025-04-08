
import { Expense, Member } from '@/types';

// Local storage keys
const MEMBERS_KEY = 'tripExpensePal-members';
const EXPENSES_KEY = 'tripExpensePal-expenses';

// Load members from local storage
export const loadMembers = (): Member[] => {
  try {
    const storedMembers = localStorage.getItem(MEMBERS_KEY);
    return storedMembers ? JSON.parse(storedMembers) : [];
  } catch (error) {
    console.error('Error loading members from local storage:', error);
    return [];
  }
};

// Save members to local storage
export const saveMembers = (members: Member[]): void => {
  try {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  } catch (error) {
    console.error('Error saving members to local storage:', error);
  }
};

// Load expenses from local storage
export const loadExpenses = (): Expense[] => {
  try {
    const storedExpenses = localStorage.getItem(EXPENSES_KEY);
    return storedExpenses ? JSON.parse(storedExpenses) : [];
  } catch (error) {
    console.error('Error loading expenses from local storage:', error);
    return [];
  }
};

// Save expenses to local storage
export const saveExpenses = (expenses: Expense[]): void => {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expenses to local storage:', error);
  }
};

// Clear all data from local storage
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(MEMBERS_KEY);
    localStorage.removeItem(EXPENSES_KEY);
  } catch (error) {
    console.error('Error clearing data from local storage:', error);
  }
};
