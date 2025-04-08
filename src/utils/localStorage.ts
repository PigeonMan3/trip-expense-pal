
import { Expense, Member, Trip } from '@/types';

// Local storage keys
const MEMBERS_KEY = 'tripExpensePal-members';
const EXPENSES_KEY = 'tripExpensePal-expenses';
const TRIPS_KEY = 'tripExpensePal-trips';

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

// Load trips from local storage
export const loadTrips = (): Trip[] => {
  try {
    const storedTrips = localStorage.getItem(TRIPS_KEY);
    return storedTrips ? JSON.parse(storedTrips) : [];
  } catch (error) {
    console.error('Error loading trips from local storage:', error);
    return [];
  }
};

// Save trips to local storage
export const saveTrips = (trips: Trip[]): void => {
  try {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  } catch (error) {
    console.error('Error saving trips to local storage:', error);
  }
};

// Get members for a specific trip
export const getTripMembers = (tripId: string): Member[] => {
  const allMembers = loadMembers();
  const trip = loadTrips().find(t => t.id === tripId);
  
  if (!trip) return [];
  
  return allMembers.filter(member => trip.members.includes(member.id));
};

// Get expenses for a specific trip
export const getTripExpenses = (tripId: string): Expense[] => {
  const allExpenses = loadExpenses();
  return allExpenses.filter(expense => expense.tripId === tripId);
};

// Clear all data from local storage
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(MEMBERS_KEY);
    localStorage.removeItem(EXPENSES_KEY);
    localStorage.removeItem(TRIPS_KEY);
  } catch (error) {
    console.error('Error clearing data from local storage:', error);
  }
};
