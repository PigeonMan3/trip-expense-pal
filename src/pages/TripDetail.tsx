
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  loadTrips, 
  loadMembers, 
  loadExpenses,
  saveMembers,
  saveExpenses,
  getTripMembers,
  getTripExpenses
} from '@/utils/localStorage';
import { Member, Expense, Trip, Balance, Debt } from '@/types';
import { calculateBalances, calculateDebts } from '@/utils/expenseCalculator';
import { Button } from '@/components/ui/button';
import { ChevronLeft, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Home, Receipt } from "lucide-react";
import Header from '@/components/Header';
import MemberList from '@/components/MemberList';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import Summary from '@/components/Summary';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const TripDetail = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!tripId) {
      navigate('/trips');
      return;
    }

    const trips = loadTrips();
    const currentTrip = trips.find(t => t.id === tripId);
    
    if (!currentTrip) {
      toast({
        variant: 'destructive',
        title: 'Trip not found',
        description: 'The requested trip does not exist or has been deleted.',
      });
      navigate('/trips');
      return;
    }

    setTrip(currentTrip);
    setMembers(getTripMembers(tripId));
    setExpenses(getTripExpenses(tripId));
  }, [tripId, isAuthenticated, navigate, toast]);

  const handleAddMember = (name: string) => {
    if (!trip) return;
    
    const newMember: Member = { 
      id: uuidv4(), 
      name,
      userId: user?.id // Link member to current user if appropriate
    };
    
    const allMembers = loadMembers();
    const updatedMembers = [...allMembers, newMember];
    saveMembers(updatedMembers);
    
    // Update trip members list
    const allTrips = loadTrips();
    const updatedTrip = { ...trip, members: [...trip.members, newMember.id] };
    const updatedTrips = allTrips.map(t => t.id === trip.id ? updatedTrip : t);
    
    // Save to localStorage
    setTrip(updatedTrip);
    setMembers([...members, newMember]);
    
    localStorage.setItem('tripExpensePal-trips', JSON.stringify(updatedTrips));
    
    setNewMemberName('');
    setIsAddMemberDialogOpen(false);
  };

  const handleAddMemberFromDialog = () => {
    if (newMemberName.trim()) {
      handleAddMember(newMemberName.trim());
      toast({
        title: 'Member added',
        description: `${newMemberName} has been added to the trip.`,
      });
    }
  };

  const handleDeleteMember = (id: string) => {
    if (!trip) return;
    
    // Remove member from list
    const updatedMembers = members.filter(member => member.id !== id);
    setMembers(updatedMembers);
    
    // Update all members in localStorage
    const allMembers = loadMembers();
    const filteredMembers = allMembers.filter(m => m.id !== id);
    saveMembers(filteredMembers);
    
    // Update trip members list
    const updatedTrip = { 
      ...trip, 
      members: trip.members.filter(memberId => memberId !== id)
    };
    
    const allTrips = loadTrips();
    const updatedTrips = allTrips.map(t => t.id === trip.id ? updatedTrip : t);
    localStorage.setItem('tripExpensePal-trips', JSON.stringify(updatedTrips));
    
    setTrip(updatedTrip);
    
    // Also remove expenses paid by or shared with the deleted member
    const updatedExpenses = expenses.filter(
      expense => expense.paidBy !== id && !expense.participants.includes(id)
    );
    
    setExpenses(updatedExpenses);
    
    // Update all expenses in localStorage
    const allExpenses = loadExpenses();
    const filteredExpenses = allExpenses.filter(
      e => !(e.tripId === trip.id && (e.paidBy === id || e.participants.includes(id)))
    );
    
    saveExpenses(filteredExpenses);
  };

  const handleAddExpense = (expense: Omit<Expense, 'id' | 'tripId'>) => {
    if (!trip) return;
    
    const newExpense: Expense = { 
      id: uuidv4(), 
      ...expense,
      tripId: trip.id
    };
    
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    
    // Save to localStorage
    const allExpenses = loadExpenses();
    saveExpenses([...allExpenses, newExpense]);
    
    toast({
      title: 'Expense added',
      description: `${expense.description} has been added to the trip.`,
    });
  };

  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    
    // Update localStorage
    const allExpenses = loadExpenses();
    const filteredExpenses = allExpenses.filter(e => e.id !== id);
    saveExpenses(filteredExpenses);
  };

  const handleSettleUp = (fromId: string, toId: string, amount: number) => {
    if (!trip) return;
    
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
      tripId: trip.id,
      splitType: 'equal',
    };
    
    const updatedExpenses = [...expenses, settlementExpense];
    setExpenses(updatedExpenses);
    
    // Save to localStorage
    const allExpenses = loadExpenses();
    saveExpenses([...allExpenses, settlementExpense]);
    
    toast({
      title: 'Settlement recorded',
      description: `A settlement of ${amount} has been recorded.`,
    });
  };

  const balances: Balance[] = calculateBalances(expenses, members);
  const debts: Debt[] = calculateDebts(balances, members);

  if (!trip) {
    return <div className="container mx-auto p-4">Loading trip details...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link to="/trips">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Header title={trip.name} />
        </div>
        {trip.description && (
          <p className="text-muted-foreground mb-4">{trip.description}</p>
        )}
      </div>
      
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Trip Members</h2>
              <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Add Member</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Trip Member</DialogTitle>
                    <DialogDescription>
                      Add a new member to share expenses with.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <label htmlFor="memberName" className="text-sm font-medium">Member Name</label>
                    <Input
                      id="memberName"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Name"
                      className="mt-1"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddMemberFromDialog}>Add Member</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
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
};

export default TripDetail;
