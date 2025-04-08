
export interface Member {
  id: string;
  name: string;
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
