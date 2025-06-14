import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Expense, Member } from '@/types';
import { format, parseISO } from 'date-fns';
import { useSettings } from '@/contexts/SettingsContext';
import { formatAmount } from '@/utils/currencies';
import { getCategoryDisplayName, getCategoryEmoji } from '@/utils/budgetCalculator';
import { ArrowLeft } from 'lucide-react';

interface CategoryExpensesProps {
  category: string;
  expenses: Expense[];
  members: Member[];
  onBack: () => void;
  onEditExpense: (expense: Expense) => void;
}

// Helper function to get member name by ID
const getMemberName = (memberId: string, members: Member[]): string => {
  const member = members.find(m => m.id === memberId);
  return member ? member.name : 'Unknown';
};

const CategoryExpenses = ({ category, expenses, members, onBack, onEditExpense }: CategoryExpensesProps) => {
  const { settings } = useSettings();
  
  // Filter expenses by category (excluding settlements)
  const categoryExpenses = expenses.filter(
    expense => expense.category === category && !expense.isSettlement
  );

  const totalSpent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Card className="p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryEmoji(category)}</span>
          <h2 className="text-xl font-bold">{getCategoryDisplayName(category)}</h2>
        </div>
      </div>

      <div className="mb-4 p-3 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">Total Spent</p>
        <p className="text-lg font-semibold">{formatAmount(totalSpent, settings.currency)}</p>
      </div>

      {categoryExpenses.length === 0 ? (
        <div className="text-center text-muted-foreground p-8">
          <p>No expenses in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {categoryExpenses.map((expense) => (
            <Card key={expense.id} className="p-3 border animate-fade-in">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{expense.description}</h3>
                  <div className="text-sm text-muted-foreground mt-1">
                    <p>
                      Paid by <span className="font-medium text-foreground">{getMemberName(expense.paidBy, members)}</span> on {format(parseISO(expense.date), 'MMM d, yyyy')}
                    </p>
                    <p className="mt-1">
                      Split between <span className="font-medium text-foreground">
                        {expense.participants.map(pid => getMemberName(pid, members)).join(', ')}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-md">
                    {formatAmount(expense.amount, settings.currency)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEditExpense(expense)}
                    className="h-6 text-xs hover:bg-primary/10"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default CategoryExpenses;