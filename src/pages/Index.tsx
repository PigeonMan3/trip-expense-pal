
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import MemberList from '@/components/MemberList';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import Summary from '@/components/Summary';
import { Member, Expense, ExpenseCategory, Balance, Debt } from '@/types';
import { loadMembers, saveMembers, loadExpenses, saveExpenses, clearAllData } from '@/utils/localStorage';
import { calculateBalances, calculateDebts } from '@/utils/expenseCalculator';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedMembers = loadMembers();
    const storedExpenses = loadExpenses();
    
    setMembers(storedMembers);
    setExpenses(storedExpenses);
  }, []);

  // Calculate balances and debts whenever members or expenses change
  useEffect(() => {
    if (members.length > 0) {
      const newBalances = calculateBalances(expenses, members);
      setBalances(newBalances);
      
      const newDebts = calculateDebts(newBalances, members);
      setDebts(newDebts);
    } else {
      setBalances([]);
      setDebts([]);
    }
  }, [members, expenses]);

  // Add a new member
  const handleAddMember = (name: string) => {
    const newMember: Member = {
      id: uuidv4(),
      name
    };
    
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    saveMembers(updatedMembers);
    
    toast({
      title: 'Member added',
      description: `${name} has been added to the trip.`
    });
  };

  // Remove a member
  const handleRemoveMember = (id: string) => {
    // Check if member has expenses
    const memberHasExpenses = expenses.some(
      expense => expense.paidBy === id || expense.participants.includes(id)
    );
    
    if (memberHasExpenses) {
      toast({
        title: 'Cannot remove member',
        description: 'This member has associated expenses. Remove those expenses first.',
        variant: 'destructive'
      });
      return;
    }
    
    const updatedMembers = members.filter(member => member.id !== id);
    setMembers(updatedMembers);
    saveMembers(updatedMembers);
    
    toast({
      title: 'Member removed',
      description: `Member has been removed from the trip.`
    });
  };

  // Add a new expense
  const handleAddExpense = (expenseData: {
    description: string;
    amount: number;
    paidBy: string;
    date: string;
    category: ExpenseCategory;
    participants: string[];
    splitType: 'equal' | 'uneven';
    shares?: { [participantId: string]: number };
  }) => {
    const newExpense: Expense = {
      ...expenseData,
      id: uuidv4()
    };
    
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    
    toast({
      title: 'Expense added',
      description: `${expenseData.description} for $${expenseData.amount.toFixed(2)} has been added.`
    });
  };

  // Delete an expense
  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    
    toast({
      title: 'Expense deleted',
      description: 'The expense has been removed.'
    });
  };

  // Handle settling up between members
  const handleSettleUp = (fromId: string, toId: string, amount: number) => {
    const payer = members.find(m => m.id === fromId);
    const receiver = members.find(m => m.id === toId);
    
    if (!payer || !receiver) return;
    
    // Create a settlement expense
    const settlementExpense: Expense = {
      id: uuidv4(),
      description: `Settlement: ${payer.name} paid ${receiver.name}`,
      amount: amount,
      paidBy: fromId,
      date: new Date().toISOString().slice(0, 10),
      category: 'settlement',
      participants: [toId],
      isSettlement: true
    };
    
    const updatedExpenses = [...expenses, settlementExpense];
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
  };

  // Reset all data
  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setMembers([]);
      setExpenses([]);
      clearAllData();
      
      toast({
        title: 'Data reset',
        description: 'All trip data has been cleared.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 px-4 mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-teal-600">TripExpensePal</h1>
          <p className="text-muted-foreground">Track and split expenses with your travel group</p>
        </header>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ExpenseForm 
                  members={members} 
                  onAddExpense={handleAddExpense} 
                />
              </div>
              <div className="lg:col-span-2">
                <Summary 
                  balances={balances} 
                  debts={debts} 
                  onSettleUp={handleSettleUp} 
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="expenses" className="space-y-6 mt-6">
            <ExpenseList 
              expenses={expenses} 
              members={members} 
              onDeleteExpense={handleDeleteExpense} 
            />
          </TabsContent>
          
          <TabsContent value="members" className="space-y-6 mt-6">
            <MemberList 
              members={members} 
              onAddMember={handleAddMember} 
              onRemoveMember={handleRemoveMember} 
            />
          </TabsContent>
        </Tabs>
        
        <Separator className="my-8" />
        
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetAll}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Reset All Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
