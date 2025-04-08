
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

const Index = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* First column */}
        <div className="space-y-4">
          <MemberList 
            members={members} 
            onAddMember={handleAddMember} 
            onRemoveMember={handleDeleteMember} 
          />
        </div>
        
        {/* Second column */}
        <div className="space-y-4">
          <ExpenseForm 
            members={members} 
            onAddExpense={handleAddExpense} 
          />
          <Summary 
            balances={balances} 
            debts={debts} 
            onSettleUp={handleSettleUp} 
          />
        </div>
        
        {/* Third column */}
        <div>
          <ExpenseList 
            expenses={expenses} 
            members={members} 
            onDeleteExpense={handleDeleteExpense} 
          />
        </div>
      </div>
    </div>
  );
}

export default Index;
