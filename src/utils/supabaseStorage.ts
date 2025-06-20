import { supabase } from '@/integrations/supabase/client';
import { Trip, Expense, Member, Budget, ExpenseCategory } from '@/types';

// Trip operations
export const loadTrips = async (userId: string): Promise<Trip[]> => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        members (
          id,
          name,
          user_id
        ),
        expenses (
          *
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return data?.map(trip => ({
      id: trip.id,
      name: trip.name,
      description: trip.description || '',
      ownerId: trip.user_id,
      members: trip.members?.map((m: any) => m.id) || [],
      dateCreated: trip.created_at,
      pinned: trip.pinned || false,
      membersData: trip.members?.map((m: any) => ({
        id: m.id,
        name: m.name,
        userId: m.user_id
      })) || [],
      expensesData: trip.expenses?.map((e: any) => ({
        id: e.id,
        description: e.description,
        amount: e.amount,
        paidBy: e.paid_by,
        participants: e.participants,
        category: e.category,
        splitType: e.split_type,
        shares: e.shares,
        isSettlement: e.is_settlement,
        date: e.date,
        tripId: trip.id
      })) || []
    })) || [];
  } catch (error) {
    console.error('Error loading trips:', error);
    return [];
  }
};

export const saveTrip = async (trip: Omit<Trip, 'id' | 'dateCreated'>, userId: string): Promise<Trip | null> => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .insert({
        name: trip.name,
        description: trip.description,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;

    // Add members
    if (trip.members.length > 0) {
      const memberInserts = trip.members.map(memberId => ({
        trip_id: data.id,
        user_id: memberId,
        name: 'Member' // You might want to fetch actual names
      }));

      await supabase.from('members').insert(memberInserts);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      ownerId: data.user_id,
      members: trip.members,
      dateCreated: data.created_at,
      pinned: data.pinned || false
    };
  } catch (error) {
    console.error('Error saving trip:', error);
    return null;
  }
};

// Expense operations
export const loadMembersForTrip = async (tripId: string): Promise<Member[]> => {
  const { data, error } = await supabase
    .from('members')
    .select('id, name, user_id')
    .eq('trip_id', tripId);

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }

  return data.map(member => ({
    id: member.id,
    name: member.name,
    userId: member.user_id || undefined,
  }));
};

export const saveExpenseQuick = async (expenseData: Omit<Expense, 'id'>, userId: string): Promise<Expense | null> => {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      trip_id: expenseData.tripId,
      user_id: userId,
      description: expenseData.description,
      amount: expenseData.amount,
      paid_by: expenseData.paidBy,
      participants: expenseData.participants,
      category: expenseData.category,
      split_type: expenseData.splitType || 'equal',
      shares: expenseData.shares,
      is_settlement: expenseData.isSettlement || false,
      date: expenseData.date
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving expense:', error);
    return null;
  }

  return data ? { 
    id: data.id,
    description: data.description,
    amount: data.amount,
    paidBy: data.paid_by,
    participants: data.participants,
    category: data.category as ExpenseCategory,
    splitType: data.split_type as 'equal' | 'uneven',
    shares: data.shares as { [participantId: string]: number } | undefined,
    isSettlement: data.is_settlement,
    date: data.date,
    tripId: data.trip_id
  } : null;
};

export const saveExpense = async (expense: Omit<Expense, 'id'>, tripId: string, userId: string): Promise<Expense | null> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        trip_id: tripId,
        user_id: userId,
        description: expense.description,
        amount: expense.amount,
        paid_by: expense.paidBy,
        participants: expense.participants,
        category: expense.category,
        split_type: expense.splitType,
        shares: expense.shares,
        is_settlement: expense.isSettlement || false,
        date: expense.date
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      description: data.description,
      amount: data.amount,
      paidBy: data.paid_by,
      participants: data.participants,
      category: data.category as any,
      splitType: data.split_type as 'equal' | 'uneven',
      shares: data.shares as { [participantId: string]: number } | undefined,
      isSettlement: data.is_settlement,
      date: data.date,
      tripId: tripId
    };
  } catch (error) {
    console.error('Error saving expense:', error);
    return null;
  }
};

export const updateExpense = async (expense: Expense): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .update({
        description: expense.description,
        amount: expense.amount,
        paid_by: expense.paidBy,
        participants: expense.participants,
        category: expense.category,
        split_type: expense.splitType,
        shares: expense.shares,
        is_settlement: expense.isSettlement || false,
        date: expense.date
      })
      .eq('id', expense.id);

    return !error;
  } catch (error) {
    console.error('Error updating expense:', error);
    return false;
  }
};

export const deleteExpense = async (expenseId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    return !error;
  } catch (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
};

// Member operations
export const addMember = async (tripId: string, name: string, userId?: string): Promise<Member | null> => {
  try {
    const { data, error } = await supabase
      .from('members')
      .insert({
        trip_id: tripId,
        name: name,
        user_id: userId || null
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      userId: data.user_id
    };
  } catch (error) {
    console.error('Error adding member:', error);
    return null;
  }
};

export const removeMember = async (memberId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId);

    return !error;
  } catch (error) {
    console.error('Error removing member:', error);
    return false;
  }
};

// Budget operations
export const loadBudget = async (tripId: string, userId: string): Promise<Budget | null> => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    return {
      id: data.id,
      tripId: data.trip_id,
      userId: data.user_id,
      totalBudget: data.total_budget,
      categoryBudgets: (data.category_budgets as { [category: string]: number }) || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error loading budget:', error);
    return null;
  }
};

export const saveBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget | null> => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        trip_id: budget.tripId,
        user_id: budget.userId,
        total_budget: budget.totalBudget,
        category_budgets: budget.categoryBudgets
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      tripId: data.trip_id,
      userId: data.user_id,
      totalBudget: data.total_budget,
      categoryBudgets: (data.category_budgets as { [category: string]: number }) || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error saving budget:', error);
    return null;
  }
};

export const updateBudget = async (budget: Budget): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('budgets')
      .update({
        total_budget: budget.totalBudget,
        category_budgets: budget.categoryBudgets
      })
      .eq('id', budget.id);

    return !error;
  } catch (error) {
    console.error('Error updating budget:', error);
    return false;
  }
};

// Pin operations
export const toggleTripPinned = async (tripId: string, pinned: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('trips')
      .update({ pinned })
      .eq('id', tripId);

    return !error;
  } catch (error) {
    console.error('Error toggling trip pin status:', error);
    return false;
  }
};