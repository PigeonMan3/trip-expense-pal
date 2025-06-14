
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Calendar, AlertTriangle, Pin, Plus } from 'lucide-react';
import { Trip, Member, Expense } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { calculateDebts, calculateBalances } from '@/utils/expenseCalculator';

interface TripListProps {
  trips: (Trip & { 
    membersData?: Member[]; 
    expensesData?: Expense[]; 
  })[];
  onAddTrip: (trip: Trip) => void;
  onTogglePin: (tripId: string, pinned: boolean) => void;
}

const TripList: React.FC<TripListProps> = ({ trips, onAddTrip, onTogglePin }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newTripDescription, setNewTripDescription] = useState('');

  const getUnsettledDebtsCount = (trip: Trip & { membersData?: Member[]; expensesData?: Expense[]; }) => {
    if (!trip.membersData || !trip.expensesData || trip.membersData.length === 0) return 0;
    
    const balances = calculateBalances(trip.expensesData, trip.membersData);
    const debts = calculateDebts(balances, trip.membersData);
    
    return debts.length;
  };

  const handleAddTrip = () => {
    if (!newTripName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Trip name required',
        description: 'Please enter a name for your trip.',
      });
      return;
    }

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'You must be logged in to create a trip.',
      });
      return;
    }

    const newTrip: Trip = {
      id: uuidv4(),
      name: newTripName.trim(),
      description: newTripDescription.trim() || undefined,
      dateCreated: new Date().toISOString(),
      ownerId: user.id,
      members: [],
    };

    onAddTrip(newTrip);
    setNewTripName('');
    setNewTripDescription('');
    setIsDialogOpen(false);
    
    toast({
      title: 'Trip created',
      description: `"${newTripName}" has been created successfully.`,
    });
  };

  // Sort trips: pinned first, then by creation date
  const sortedTrips = [...trips].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
  });

  const handleTogglePin = (e: React.MouseEvent, tripId: string, currentPinned: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    onTogglePin(tripId, !currentPinned);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">
          ✈️ Your Adventures
        </h2>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-secondary/50 to-secondary/80 hover:from-secondary/70 hover:to-secondary/90 border-secondary"
          >
            <Plus className="h-4 w-4" />
            Quick Expense
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                ✨ New Trip
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Trip</DialogTitle>
                <DialogDescription>
                  Add a new trip to track expenses with friends.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="tripName" className="text-sm font-medium">Trip Name</label>
                  <Input
                    id="tripName"
                    placeholder="Summer Vacation"
                    value={newTripName}
                    onChange={(e) => setNewTripName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="tripDescription" className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    id="tripDescription"
                    placeholder="Trip details..."
                    value={newTripDescription}
                    onChange={(e) => setNewTripDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddTrip}>Create Trip</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-primary/30 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 animate-fade-in">
          <div className="text-6xl mb-4">🧳</div>
          <p className="text-lg text-muted-foreground mb-2">No adventures yet!</p>
          <p className="text-sm text-muted-foreground">Create your first trip to start tracking expenses with friends.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTrips.map((trip, index) => (
            <Link key={trip.id} to={`/trips/${trip.id}`} className="block group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card/80 border-primary/20 hover:border-primary/40 animate-fade-in group-hover:shadow-primary/25" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-foreground group-hover:text-primary transition-colors duration-300 flex-1">
                      {trip.name}
                    </CardTitle>
                    <button
                      onClick={(e) => handleTogglePin(e, trip.id, trip.pinned || false)}
                      className={`ml-2 p-1 rounded-full transition-colors ${
                        trip.pinned 
                          ? 'text-primary bg-primary/10 hover:bg-primary/20' 
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                      }`}
                      title={trip.pinned ? 'Unpin trip' : 'Pin trip'}
                    >
                      <Pin className={`h-4 w-4 ${trip.pinned ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  {trip.description && (
                    <CardDescription className="line-clamp-2">{trip.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center text-sm text-muted-foreground bg-secondary/50 rounded-lg p-2">
                    <Calendar className="mr-2 h-4 w-4 text-primary" />
                    <span>Created {format(new Date(trip.dateCreated), 'MMM d, yyyy')}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
                        👥 {trip.members.length} {trip.members.length === 1 ? 'member' : 'members'}
                      </p>
                      {getUnsettledDebtsCount(trip) > 0 && (
                        <p className="text-sm text-destructive bg-destructive/10 px-3 py-1 rounded-full flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {getUnsettledDebtsCount(trip)} unsettled
                        </p>
                      )}
                    </div>
                    <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</div>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripList;
