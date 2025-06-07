
import { Expense, Member, Balance, Debt } from '@/types';

// Calculate individual balances for each member
export const calculateBalances = (expenses: Expense[], members: Member[]): Balance[] => {
  const balances: Record<string, number> = {};
  
  // Initialize balances with zero
  members.forEach(member => {
    balances[member.id] = 0;
  });

  // Calculate balances based on expenses
  expenses.forEach(expense => {
    // Handle settlement expenses differently
    if (expense.isSettlement) {
      // For settlements, the payer reduces their debt and the receiver increases theirs
      const payer = expense.paidBy;
      const receiver = expense.participants.find(p => p !== payer);
      if (receiver) {
        balances[payer] += expense.amount; // Payer gets credit
        balances[receiver] -= expense.amount; // Receiver owes less
      }
      return;
    }
    
    const payer = expense.paidBy;
    
    // Add the full amount to the payer
    balances[payer] += expense.amount;
    
    // For uneven splits
    if (expense.splitType === 'uneven' && expense.shares) {
      // Subtract the specific share from each participant
      Object.entries(expense.shares).forEach(([participantId, share]) => {
        balances[participantId] -= share;
      });
    } 
    // For equal splits
    else {
      const participantsCount = expense.participants.length;
      
      if (participantsCount === 0) return;
      
      const sharePerPerson = expense.amount / participantsCount;
      
      // Subtract equal share from each participant
      expense.participants.forEach(participantId => {
        balances[participantId] -= sharePerPerson;
      });
    }
  });

  // Create the balance objects with names
  return members.map(member => ({
    memberId: member.id,
    memberName: member.name,
    amount: parseFloat(balances[member.id].toFixed(2))
  }));
};

// Calculate who owes whom
export const calculateDebts = (balances: Balance[], members: Member[]): Debt[] => {
  const debts: Debt[] = [];
  const debtors = [...balances].filter(b => b.amount < 0).sort((a, b) => a.amount - b.amount);
  const creditors = [...balances].filter(b => b.amount > 0).sort((a, b) => b.amount - a.amount);
  
  // For each person who has a negative balance (owes money)
  debtors.forEach(debtor => {
    let remainingDebt = Math.abs(debtor.amount);
    
    // While this person still has debt
    while (remainingDebt > 0.01 && creditors.length > 0) {
      const creditor = creditors[0];
      const memberFrom = members.find(m => m.id === debtor.memberId);
      const memberTo = members.find(m => m.id === creditor.memberId);
      
      if (!memberFrom || !memberTo) continue;
      
      // Calculate how much can be paid to the current creditor
      const paymentAmount = Math.min(remainingDebt, creditor.amount);
      
      if (paymentAmount > 0.01) {
        // Create a debt record
        debts.push({
          from: {
            id: memberFrom.id,
            name: memberFrom.name
          },
          to: {
            id: memberTo.id,
            name: memberTo.name
          },
          amount: parseFloat(paymentAmount.toFixed(2))
        });
        
        // Update the remaining amounts
        remainingDebt -= paymentAmount;
        creditor.amount -= paymentAmount;
      }
      
      // If the creditor has been fully paid off, move to the next one
      if (creditor.amount < 0.01) {
        creditors.shift();
      }
    }
  });
  
  return debts;
};
