import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { PendingInvitesList } from '@/components/invites/PendingInvitesList';
import { InviteModal } from '@/components/invites/InviteModal';

const TripInvites = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isAuthenticated) {
    return null;
  }

  const handleBack = () => {
    navigate(-1);
  };

  // TODO: Replace with actual data fetching
  const pendingInvites: any[] = [];
  const isLoading = false;

  return (
    <div className="container mx-auto p-4 max-w-4xl animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            Manage Trip Invites
          </h1>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Invite
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Pending Invites</h2>
        <PendingInvitesList 
          invites={pendingInvites} 
          isLoading={isLoading}
        />
      </div>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        tripId={tripId}
      />
    </div>
  );
};

export default TripInvites;