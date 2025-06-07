import { supabase } from '@/integrations/supabase/client';
import { Trip, Expense, Member } from '@/types';

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
      dateCreated: data.created_at
    };
  } catch (error) {
    console.error('Error saving trip:', error);
    return null;
  }
};

// Expense operations
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