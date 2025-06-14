import { useState } from 'react';
import { format } from 'date-fns';
import { Expense, Member } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from '@/components/ui/hover-card';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Clock, Edit, Users, Euro } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface ActivityTimelineProps {
  expenses: Expense[];
  members: Member[];
  onEditExpense?: (expense: Expense) => void;
}

interface ActivityGroup {
  category: string;
  expenses: Expense[];
  total: number;
  time: string;
}

const categoryEmojis: Record<string, string> = {
  food: '🍽️',
  transport: '🚗',
  accommodation: '🏨',
  entertainment: '🎉',
  shopping: '🛍️',
  general: '💸',
  settlement: '🤝'
};

const categoryLabels: Record<string, string> = {
  food: 'Dining',
  transport: 'Transport',
  accommodation: 'Stay',
  entertainment: 'Fun',
  shopping: 'Shopping',
  general: 'General',
  settlement: 'Settlement'
};

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  expenses,
  members,
  onEditExpense
}) => {
  const { settings } = useSettings();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Group expenses by category and time
  const activityGroups: ActivityGroup[] = expenses
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((groups: ActivityGroup[], expense) => {
      const existingGroup = groups.find(
        g => g.category === expense.category &&
        format(new Date(expense.date), 'HH:mm') === format(new Date(g.time), 'HH:mm')
      );

      if (existingGroup) {
        existingGroup.expenses.push(expense);
        existingGroup.total += expense.amount;
      } else {
        groups.push({
          category: expense.category,
          expenses: [expense],
          total: expense.amount,
          time: expense.date
        });
      }
      return groups;
    }, []);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const getMemberName = (memberId: string) => {
    return members.find(m => m.id === memberId)?.name || 'Unknown';
  };

  const formatAmount = (amount: number) => {
    return `${settings.currency.symbol}${amount.toFixed(2)}`;
  };

  const ExpenseCard = ({ expense }: { expense: Expense }) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="group relative cursor-pointer">
          <div className="w-4 h-4 bg-primary rounded-full border-2 border-background group-hover:scale-125 transition-transform duration-200 shadow-md group-hover:shadow-lg">
            <div className="absolute -top-1 -left-1 w-6 h-6 bg-primary/20 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
          </div>
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 min-w-max opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
              {formatAmount(expense.amount)}
            </div>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-gradient-to-br from-card to-secondary/20 border-primary/20">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-foreground">{expense.description}</h4>
            <p className="text-sm text-muted-foreground">
              {format(new Date(expense.date), 'MMM d, HH:mm')}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {formatAmount(expense.amount)}
            </span>
            <Badge variant="secondary" className="bg-primary/10">
              {categoryLabels[expense.category] || expense.category}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Paid by:</span>
              <span className="text-primary">{getMemberName(expense.paidBy)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-3 w-3" />
              <span className="font-medium">Split between:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {expense.participants.map(participantId => (
                <Badge key={participantId} variant="outline" className="text-xs">
                  {getMemberName(participantId)}
                </Badge>
              ))}
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20"
                onClick={() => setSelectedExpense(expense)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Expense</DialogTitle>
              </DialogHeader>
              <div className="p-4 text-center text-muted-foreground">
                Edit functionality would go here
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <div className="space-y-6 p-4">
      {/* Status Bar */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Euro className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {formatAmount(totalSpent)} spent today
                </h3>
                <p className="text-sm text-muted-foreground">
                  {expenses.length} expense{expenses.length !== 1 ? 's' : ''} across {activityGroups.length} activit{activityGroups.length !== 1 ? 'ies' : 'y'}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {activityGroups.length} Activities
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {activityGroups.length === 0 ? (
        <Card className="p-8 text-center border-2 border-dashed border-primary/30">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No expenses yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Add some expenses to see your activity timeline
          </p>
        </Card>
      ) : (
        <div className="relative">
          {/* Desktop: Horizontal Timeline */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 via-primary to-accent/30 transform -translate-y-1/2"></div>
              
              {/* Activity Groups */}
              <div className="flex justify-between items-center space-x-8 py-8">
                {activityGroups.map((group, index) => (
                  <div key={index} className="flex flex-col items-center min-w-max">
                    {/* Activity Header */}
                    <Card className="mb-4 bg-gradient-to-br from-card to-secondary/20 border-primary/20 hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="p-3 text-center">
                        <div className="text-2xl mb-1">
                          {categoryEmojis[group.category] || '💸'}
                        </div>
                        <CardTitle className="text-sm font-semibold">
                          {categoryLabels[group.category] || group.category}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(group.time), 'HH:mm')}
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {formatAmount(group.total)}
                        </div>
                      </CardHeader>
                    </Card>
                    
                    {/* Expenses */}
                    <div className="flex space-x-3">
                      {group.expenses.map((expense) => (
                        <ExpenseCard key={expense.id} expense={expense} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: Vertical Timeline */}
          <div className="md:hidden space-y-6">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary to-accent/30"></div>
              
              {activityGroups.map((group, index) => (
                <div key={index} className="relative flex items-start">
                  {/* Timeline Node */}
                  <div className="absolute left-4 w-4 h-4 bg-primary rounded-full border-2 border-background shadow-md z-10"></div>
                  
                  {/* Activity Content */}
                  <div className="ml-12 w-full">
                    <Card className="bg-gradient-to-br from-card to-secondary/20 border-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {categoryEmojis[group.category] || '💸'}
                            </span>
                            <div>
                              <CardTitle className="text-base">
                                {categoryLabels[group.category] || group.category}
                              </CardTitle>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(group.time), 'HH:mm')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {formatAmount(group.total)}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {group.expenses.length} expense{group.expenses.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {group.expenses.map((expense) => (
                            <div 
                              key={expense.id}
                              className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors duration-200"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">{expense.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  Paid by {getMemberName(expense.paidBy)}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-primary">
                                  {formatAmount(expense.amount)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {expense.participants.length} people
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;