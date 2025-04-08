
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Balance, Debt, Member } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface SummaryProps {
  balances: Balance[];
  debts: Debt[];
  onSettleUp: (fromId: string, toId: string, amount: number) => void;
}

const Summary = ({ balances, debts, onSettleUp }: SummaryProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('balances');

  const handleSettleUp = (debt: Debt) => {
    onSettleUp(debt.from.id, debt.to.id, debt.amount);
    toast({
      title: 'Debt settled!',
      description: `${debt.from.name} paid ${debt.to.name} $${debt.amount.toFixed(2)}`,
    });
  };

  return (
    <Card className="p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-center">Summary</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="balances" className="pt-4">
          {balances.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              No balances yet. Add expenses to see the balance summary.
            </div>
          ) : (
            <div className="space-y-3">
              {balances.map((balance) => (
                <div 
                  key={balance.memberId} 
                  className={`flex justify-between items-center p-3 rounded-md
                    ${balance.amount > 0 ? 'bg-green-50 border border-green-200' : 
                      balance.amount < 0 ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}
                >
                  <span className="font-medium">{balance.memberName}</span>
                  <span className={`font-bold ${
                    balance.amount > 0 ? 'text-green-600' : 
                    balance.amount < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {balance.amount > 0 ? `+$${balance.amount.toFixed(2)}` : 
                     balance.amount < 0 ? `-$${Math.abs(balance.amount).toFixed(2)}` : 
                     `$${balance.amount.toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="settlements" className="pt-4">
          {debts.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              Everyone is settled up! No payments needed.
            </div>
          ) : (
            <div className="space-y-3">
              {debts.map((debt, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded-md"
                >
                  <div>
                    <span className="font-medium">{debt.from.name}</span>
                    <span className="mx-2 text-muted-foreground">owes</span>
                    <span className="font-medium">{debt.to.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">${debt.amount.toFixed(2)}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-7 border-teal-300 text-teal-700 hover:bg-teal-50"
                      onClick={() => handleSettleUp(debt)}
                    >
                      Settle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default Summary;
