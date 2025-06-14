import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Budget, BudgetSummary, Expense } from '@/types';
import { calculateBudgetSummary, getCategoryDisplayName, getCategoryEmoji } from '@/utils/budgetCalculator';
import { useSettings } from '@/contexts/SettingsContext';
import { formatAmount } from '@/utils/currencies';
import { Plus, Settings } from 'lucide-react';
import SetBudgetDialog from './SetBudgetDialog';

interface BudgetOverviewProps {
  budget: Budget | null;
  expenses: Expense[];
  onBudgetUpdate: (budget: Budget) => void;
  onCategorySelect?: (category: string) => void;
}

const BudgetOverview = ({ budget, expenses, onBudgetUpdate, onCategorySelect }: BudgetOverviewProps) => {
  const { settings } = useSettings();
  const [isSetBudgetOpen, setIsSetBudgetOpen] = useState(false);
  
  const budgetSummaries = calculateBudgetSummary(budget, expenses);

  if (!budget) {
    return (
      <Card className="p-6 text-center shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Trip Budget</h2>
          <p className="text-muted-foreground">Set a budget to track your spending</p>
        </div>
        <Button onClick={() => setIsSetBudgetOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Set Budget
        </Button>
        
        <SetBudgetDialog
          budget={budget}
          isOpen={isSetBudgetOpen}
          onClose={() => setIsSetBudgetOpen(false)}
          onSave={onBudgetUpdate}
        />
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Trip Budget</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSetBudgetOpen(true)}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Adjust
        </Button>
      </div>

      <div className="space-y-4">
        {budgetSummaries.map((summary) => (
          <div 
            key={summary.category}
            className={`p-4 border rounded-lg ${
              onCategorySelect && summary.category !== 'total' 
                ? 'cursor-pointer hover:bg-accent/50 transition-colors' 
                : ''
            }`}
            onClick={() => summary.category !== 'total' && onCategorySelect?.(summary.category)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getCategoryEmoji(summary.category)}</span>
                <span className="font-medium">{getCategoryDisplayName(summary.category)}</span>
                {summary.isOverBudget && (
                  <Badge variant="destructive" className="text-xs">Over Budget</Badge>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatAmount(summary.spent, settings.currency)} / {formatAmount(summary.budgeted, settings.currency)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatAmount(Math.abs(summary.remaining), settings.currency)} {summary.remaining >= 0 ? 'left' : 'over'}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <Progress 
                value={Math.min(summary.percentage, 100)} 
                className={`h-3 ${summary.isOverBudget ? 'bg-destructive/20' : ''}`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{summary.percentage.toFixed(1)}% used</span>
                {summary.percentage > 100 && (
                  <span className="text-destructive font-medium">
                    {(summary.percentage - 100).toFixed(1)}% over
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <SetBudgetDialog
        budget={budget}
        isOpen={isSetBudgetOpen}
        onClose={() => setIsSetBudgetOpen(false)}
        onSave={onBudgetUpdate}
      />
    </Card>
  );
};

export default BudgetOverview;