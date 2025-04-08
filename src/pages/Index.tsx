
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MemberList from '@/components/MemberList';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import Summary from '@/components/Summary';
import Header from '@/components/Header';
import { Member, Expense, Balance, Debt } from '@/types';
import { calculateBalances, calculateDebts } from '@/utils/expenseCalculator';
import { loadMembers, saveMembers, loadExpenses, saveExpenses } from '@/utils/localStorage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Home, Receipt } from "lucide-react";

const Index = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  useEffect(() => {
    const storedMembers = loadMembers() || [];
    setMembers(storedMembers);

    const storedExpenses = loadExpenses() || [];
    setExpenses(storedExpenses);
  }, []);

  useEffect(() => {
    saveMembers(members);
    saveExpenses(expenses);
  }, [members, expenses]);

  const handleAddMember = (name: string) => {
    const newMember: Member = { id: uuidv4(), name };
    setMembers([...members, newMember]);
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
    // Also remove expenses paid by or shared with the deleted member
    setExpenses(expenses.filter(
      expense => expense.paidBy !== id && !expense.participants.includes(id)
    ));
  };

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { id: uuidv4(), ...expense };
    setExpenses([...expenses, newExpense]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const handleSettleUp = (fromId: string, toId: string, amount: number) => {
    // Create a settlement expense
    const settlementExpense: Expense = {
      id: uuidv4(),
      description: `Settlement from ${members.find(m => m.id === fromId)?.name} to ${members.find(m => m.id === toId)?.name}`,
      amount: amount,
      paidBy: fromId,
      date: new Date().toISOString(),
      category: 'settlement',
      participants: [fromId, toId],
      isSettlement: true,
      splitType: 'equal',
    };
    setExpenses([...expenses, settlementExpense]);
  };

  const balances: Balance[] = calculateBalances(expenses, members);
  const debts: Debt[] = calculateDebts(balances, members);
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Header title="Trip Expense Splitter" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="w-full flex justify-center">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Members</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span>Expenses</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Summary 
              balances={balances} 
              debts={debts} 
              onSettleUp={handleSettleUp} 
            />
            <ExpenseForm 
              members={members} 
              onAddExpense={handleAddExpense} 
            />
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-4">
          <div className="grid grid-cols-1">
            <MemberList 
              members={members} 
              onAddMember={handleAddMember} 
              onRemoveMember={handleDeleteMember} 
            />
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-4">
          <div className="grid grid-cols-1">
            <ExpenseList 
              expenses={expenses} 
              members={members} 
              onDeleteExpense={handleDeleteExpense} 
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Index;
