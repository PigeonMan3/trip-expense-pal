import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Budget, ExpenseCategory } from '@/types';
import { getCategoryDisplayName, getCategoryEmoji } from '@/utils/budgetCalculator';
import { useSettings } from '@/contexts/SettingsContext';

interface SetBudgetDialogProps {
  budget: Budget | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Budget) => void;
}

const SetBudgetDialog = ({ budget, isOpen, onClose, onSave }: SetBudgetDialogProps) => {
  const { settings } = useSettings();
  const [totalBudget, setTotalBudget] = useState('');
  const [categoryBudgets, setCategoryBudgets] = useState<{ [key: string]: string }>({});
  
  const categories: ExpenseCategory[] = ['food', 'accommodation', 'transportation', 'activities', 'other'];

  useEffect(() => {
    if (isOpen) {
      setTotalBudget(budget?.totalBudget?.toString() || '');
      const catBudgets: { [key: string]: string } = {};
      categories.forEach(category => {
        catBudgets[category] = budget?.categoryBudgets[category]?.toString() || '';
      });
      setCategoryBudgets(catBudgets);
    }
  }, [isOpen, budget]);

  const handleSave = () => {
    const total = parseFloat(totalBudget) || 0;
    const catBudgetNumbers: { [key: string]: number } = {};
    
    categories.forEach(category => {
      const value = parseFloat(categoryBudgets[category]) || 0;
      if (value > 0) {
        catBudgetNumbers[category] = value;
      }
    });

    const newBudget: Budget = {
      id: budget?.id || '',
      tripId: budget?.tripId || '',
      userId: budget?.userId || '',
      totalBudget: total,
      categoryBudgets: catBudgetNumbers,
      createdAt: budget?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newBudget);
    onClose();
  };

  const handleCategoryBudgetChange = (category: string, value: string) => {
    setCategoryBudgets(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const totalCategoryBudgets = categories.reduce((sum, category) => {
    return sum + (parseFloat(categoryBudgets[category]) || 0);
  }, 0);

  const totalBudgetValue = parseFloat(totalBudget) || 0;
  const isOverAllocated = totalCategoryBudgets > totalBudgetValue && totalBudgetValue > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{budget ? 'Adjust Budget' : 'Set Trip Budget'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Total Budget */}
          <div>
            <Label htmlFor="totalBudget" className="text-sm font-medium">
              Total Trip Budget ({settings.currency.symbol})
            </Label>
            <Input
              id="totalBudget"
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              placeholder="0.00"
              className="mt-1"
            />
          </div>

          {/* Category Budgets */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Category Budgets (Optional)
            </Label>
            <div className="space-y-3">
              {categories.map(category => (
                <div key={category} className="flex items-center gap-3">
                  <span className="text-lg">{getCategoryEmoji(category)}</span>
                  <div className="flex-1">
                    <Label htmlFor={category} className="text-sm">
                      {getCategoryDisplayName(category)}
                    </Label>
                    <Input
                      id={category}
                      type="number"
                      value={categoryBudgets[category]}
                      onChange={(e) => handleCategoryBudgetChange(category, e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Budget allocation warning */}
            {isOverAllocated && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  Category budgets ({settings.currency.symbol}{totalCategoryBudgets.toFixed(2)}) 
                  exceed total budget ({settings.currency.symbol}{totalBudgetValue.toFixed(2)})
                </p>
              </div>
            )}
            
            {totalCategoryBudgets > 0 && !isOverAllocated && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Allocated: {settings.currency.symbol}{totalCategoryBudgets.toFixed(2)} of {settings.currency.symbol}{totalBudgetValue.toFixed(2)}
                  {totalBudgetValue > totalCategoryBudgets && (
                    <span className="text-primary ml-1">
                      ({settings.currency.symbol}{(totalBudgetValue - totalCategoryBudgets).toFixed(2)} unallocated)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!totalBudget || parseFloat(totalBudget) <= 0}
          >
            {budget ? 'Update Budget' : 'Set Budget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SetBudgetDialog;