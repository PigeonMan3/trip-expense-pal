
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  loadTrips, 
  saveExpense,
  updateExpense,
  deleteExpense as deleteExpenseFromDB,
  addMember,
  removeMember,
  loadBudget,
  saveBudget,
  updateBudget
} from '@/utils/supabaseStorage';
import { Member, Expense, Trip, Balance, Debt, Budget } from '@/types';
import { calculateBalances, calculateDebts } from '@/utils/expenseCalculator';
import { Button } from '@/components/ui/button';
import { ChevronLeft, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Home, Receipt, Clock, DollarSign } from "lucide-react";
import BudgetOverview from '@/components/budget/BudgetOverview';
import CategoryExpenses from '@/components/budget/CategoryExpenses';
import Header from '@/components/Header';
import MemberList from '@/components/MemberList';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import ActivityTimeline from '@/components/timeline/ActivityTimeline';
import EditExpenseDialog from '@/components/EditExpenseDialog';
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
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!tripId || !user) {
      navigate('/trips');
      return;
    }

    const loadTripData = async () => {
      const trips = await loadTrips(user.id);
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
      // Set members and expenses from loaded trip data
      setMembers((currentTrip as any).membersData || []);
      setExpenses((currentTrip as any).expensesData || []);
      
      // Load budget
      const tripBudget = await loadBudget(tripId, user.id);
      setBudget(tripBudget);
    };

    loadTripData();
  }, [tripId, isAuthenticated, navigate, toast, user]);

  const handleAddMember = async (name: string) => {
    if (!trip || !tripId) return;
    
    const newMember = await addMember(tripId, name, user?.id);
    if (newMember) {
      setMembers([...members, newMember]);
    }
    
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

  const handleDeleteMember = async (id: string) => {
    const success = await removeMember(id);
    if (success) {
      setMembers(members.filter(member => member.id !== id));
      // Also remove expenses paid by or shared with the deleted member
      setExpenses(expenses.filter(
        expense => expense.paidBy !== id && !expense.participants.includes(id)
      ));
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'tripId'>) => {
    if (!trip || !user) return;
    
    const expenseWithTripId = { ...expense, tripId: trip.id };
    const savedExpense = await saveExpense(expenseWithTripId, trip.id, user.id);
    if (savedExpense) {
      setExpenses([...expenses, savedExpense]);
      toast({
        title: 'Expense added',
        description: `${expense.description} has been added to the trip.`,
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const success = await deleteExpenseFromDB(id);
    if (success) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  const handleSettleUp = async (fromId: string, toId: string, amount: number) => {
    if (!trip || !user) return;
    
    // Create a settlement expense
    const settlementExpense = {
      description: `Settlement from ${members.find(m => m.id === fromId)?.name} to ${members.find(m => m.id === toId)?.name}`,
      amount: amount,
      paidBy: fromId,
      date: new Date().toISOString(),
      category: 'settlement' as const,
      participants: [fromId, toId],
      isSettlement: true,
      splitType: 'equal' as const,
      tripId: trip.id,
    };
    
    const savedExpense = await saveExpense(settlementExpense, trip.id, user.id);
    if (savedExpense) {
      setExpenses([...expenses, savedExpense]);
      toast({
        title: 'Settlement recorded',
        description: `A settlement of ${amount} has been recorded.`,
      });
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleUpdateExpense = async (updatedExpense: Expense) => {
    if (!trip || !user) return;
    
    const success = await updateExpense(updatedExpense);
    if (success) {
      setExpenses(expenses.map(exp => 
        exp.id === updatedExpense.id ? updatedExpense : exp
      ));
      toast({
        title: 'Expense updated',
        description: `${updatedExpense.description} has been updated.`,
      });
    }
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
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Members</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span>Expenses</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>Budget</span>
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

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-4">
          <ActivityTimeline 
            expenses={expenses} 
            members={members}
            onEditExpense={handleEditExpense}
          />
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
              onEditExpense={handleEditExpense}
            />
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="mt-4">
          {selectedCategory ? (
            <CategoryExpenses
              category={selectedCategory}
              expenses={expenses}
              members={members}
              onBack={() => setSelectedCategory(null)}
              onEditExpense={handleEditExpense}
            />
          ) : (
            <BudgetOverview
              budget={budget}
              expenses={expenses}
              onBudgetUpdate={async (updatedBudget) => {
                if (!trip || !user) return;
                if (budget) {
                  await updateBudget(updatedBudget);
                } else {
                  const newBudget = await saveBudget({
                    tripId: trip.id,
                    userId: user.id,
                    totalBudget: updatedBudget.totalBudget,
                    categoryBudgets: updatedBudget.categoryBudgets
                  });
                  if (newBudget) setBudget(newBudget);
                  return;
                }
                setBudget(updatedBudget);
              }}
              onCategorySelect={setSelectedCategory}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Expense Dialog */}
      <EditExpenseDialog
        expense={editingExpense}
        members={members}
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        onUpdateExpense={handleUpdateExpense}
      />
    </div>
  );
};

export default TripDetail;
