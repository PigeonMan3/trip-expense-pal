
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Expense, Member } from '@/types';
import { format, parseISO } from 'date-fns';
import { useSettings } from '@/contexts/SettingsContext';
import { formatAmount } from '@/utils/currencies';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  onDeleteExpense: (id: string) => void;
}

// Helper function to get member name by ID
const getMemberName = (memberId: string, members: Member[]): string => {
  const member = members.find(m => m.id === memberId);
  return member ? member.name : 'Unknown';
};

const getCategoryEmoji = (category: string): string => {
  switch (category) {
    case 'food': return '🍔';
    case 'accommodation': return '🏠';
    case 'transportation': return '🚗';
    case 'activities': return '🎯';
    case 'settlement': return '💸';
    default: return '📦';
  }
};

const ExpenseList = ({ expenses, members, onDeleteExpense }: ExpenseListProps) => {
  const { settings } = useSettings();

  if (expenses.length === 0) {
    return (
      <Card className="p-4 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-center">Expenses</h2>
        <div className="text-center text-muted-foreground p-4">
          No expenses yet. Add your first expense!
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-center">Expenses</h2>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {expenses.map((expense) => (
          <Card key={expense.id} className={`p-3 border animate-fade-in ${expense.isSettlement ? 'border-teal-300 bg-teal-50' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryEmoji(expense.category)}</span>
                  <h3 className="font-semibold">{expense.description}</h3>
                </div>
                
                <div className="text-sm text-muted-foreground mt-1">
                  <p>
                    Paid by <span className="font-medium text-foreground">{getMemberName(expense.paidBy, members)}</span> on {format(parseISO(expense.date), 'MMM d, yyyy')}
                  </p>
                  {!expense.isSettlement && (
                    <p className="mt-1">
                      Split between <span className="font-medium text-foreground">
                        {expense.participants.map(pid => getMemberName(pid, members)).join(', ')}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="font-bold text-md">
                  {formatAmount(expense.amount, settings.currency)}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDeleteExpense(expense.id)}
                  className="h-6 text-xs text-destructive hover:text-destructive mt-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default ExpenseList;
