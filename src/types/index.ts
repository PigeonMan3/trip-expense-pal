
export interface Member {
  id: string;
  name: string;
  userId?: string; // Optional reference to a user account
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // member id
  date: string;
  category: ExpenseCategory;
  participants: string[]; // member ids
  isSettlement?: boolean;
  shares?: { [participantId: string]: number }; // Optional: for uneven splits
  splitType?: 'equal' | 'uneven'; // To track how the expense is split
  tripId: string; // Reference to the trip this expense belongs to
}

export type ExpenseCategory = 
  | 'food' 
  | 'accommodation' 
  | 'transportation' 
  | 'activities' 
  | 'other'
  | 'settlement';

export interface Balance {
  memberId: string;
  memberName: string;
  amount: number;
}

export interface Debt {
  from: {
    id: string;
    name: string;
  };
  to: {
    id: string;
    name: string;
  };
  amount: number;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Settings {
  currency: Currency;
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  dateCreated: string;
  dateRange?: {
    start: string;
    end?: string;
  };
  ownerId: string; // User who created the trip
  members: string[]; // Member IDs
  isArchived?: boolean;
  pinned?: boolean;
}

export interface Budget {
  id: string;
  tripId: string;
  userId: string;
  totalBudget: number;
  categoryBudgets: { [category: string]: number };
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}
