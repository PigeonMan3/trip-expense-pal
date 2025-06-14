import { Expense, Budget, BudgetSummary, ExpenseCategory } from '@/types';

export const calculateBudgetSummary = (
  budget: Budget | null,
  expenses: Expense[]
): BudgetSummary[] => {
  if (!budget) return [];

  const categories: ExpenseCategory[] = ['food', 'accommodation', 'transportation', 'activities', 'other'];
  
  // Calculate spending by category (excluding settlements)
  const spendingByCategory = expenses.reduce((acc, expense) => {
    if (expense.isSettlement) return acc;
    
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as { [category: string]: number });

  // Calculate total spending
  const totalSpent = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);

  const summaries: BudgetSummary[] = [];

  // Add total budget summary
  summaries.push({
    category: 'total',
    budgeted: budget.totalBudget,
    spent: totalSpent,
    remaining: budget.totalBudget - totalSpent,
    percentage: budget.totalBudget > 0 ? (totalSpent / budget.totalBudget) * 100 : 0,
    isOverBudget: totalSpent > budget.totalBudget
  });

  // Add category summaries
  categories.forEach(category => {
    const budgeted = budget.categoryBudgets[category] || 0;
    const spent = spendingByCategory[category] || 0;
    
    if (budgeted > 0) {
      summaries.push({
        category,
        budgeted,
        spent,
        remaining: budgeted - spent,
        percentage: budgeted > 0 ? (spent / budgeted) * 100 : 0,
        isOverBudget: spent > budgeted
      });
    }
  });

  return summaries;
};

export const getCategoryDisplayName = (category: string): string => {
  switch (category) {
    case 'total': return 'Total Budget';
    case 'food': return 'Food & Dining';
    case 'accommodation': return 'Accommodation';
    case 'transportation': return 'Transportation';
    case 'activities': return 'Activities';
    case 'other': return 'Other';
    default: return category;
  }
};

export const getCategoryEmoji = (category: string): string => {
  switch (category) {
    case 'total': return '💰';
    case 'food': return '🍔';
    case 'accommodation': return '🏠';
    case 'transportation': return '🚗';
    case 'activities': return '🎯';
    case 'other': return '📦';
    default: return '📦';
  }
};