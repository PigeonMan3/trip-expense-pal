import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PendingInvitesList } from '@/components/invites/PendingInvitesList';
import { TripsList } from '@/components/invites/TripsList';
import { InviteModal } from '@/components/invites/InviteModal';
import { AddPeoplePanel } from '@/components/invites/AddPeoplePanel';
import { usePendingInvites, useTrips } from '@/hooks/useInvites';

const TripInvites = () => {
  const { user, isAuthenticated } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  
  const { data: pendingInvites, isLoading: loadingInvites } = usePendingInvites();
  const { data: trips, isLoading: loadingTrips } = useTrips();

  if (!isAuthenticated) {
    return null;
  }

  const handleOpenAddPeople = (tripId: string) => {
    setSelectedTripId(tripId);
  };

  const handleCloseAddPeople = () => {
    setSelectedTripId(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl animate-fade-in">
      <Header title="Manage Trip Invites" />
      
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Invite
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Pending Invites</h2>
          <PendingInvitesList 
            invites={pendingInvites || []} 
            isLoading={loadingInvites}
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Your Trips</h2>
          <TripsList 
            trips={trips || []} 
            isLoading={loadingTrips}
            onAddPeople={handleOpenAddPeople}
          />
        </div>
      </div>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        trips={trips || []}
      />

      <AddPeoplePanel
        isOpen={!!selectedTripId}
        onClose={handleCloseAddPeople}
        tripId={selectedTripId}
      />
    </div>
  );
};

export default TripInvites;