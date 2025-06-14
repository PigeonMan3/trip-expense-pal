import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, User, Mail } from 'lucide-react';
import { TripInvite } from './TripsList';
import { useSendInvite } from '@/hooks/useInvites';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: TripInvite[];
}

export const InviteModal = ({ isOpen, onClose, trips }: InviteModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [placeholderName, setPlaceholderName] = useState('');
  
  const sendInvite = useSendInvite();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTripId) return;
    
    if (isPlaceholder) {
      if (!placeholderName.trim()) return;
      // TODO: Add placeholder logic
      console.log('Creating placeholder:', { name: placeholderName, tripId: selectedTripId });
    } else {
      if (!searchQuery.trim()) return;
      sendInvite.mutate({
        tripId: selectedTripId,
        email: searchQuery,
      });
    }
    
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedTripId('');
    setIsPlaceholder(false);
    setPlaceholderName('');
    onClose();
  };

  const isFormValid = selectedTripId && (
    isPlaceholder ? placeholderName.trim() : searchQuery.trim()
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">New Invite</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trip-select" className="text-foreground">Select Trip</Label>
            <Select value={selectedTripId} onValueChange={setSelectedTripId}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Choose a trip..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="placeholder-mode"
              checked={isPlaceholder}
              onCheckedChange={setIsPlaceholder}
            />
            <Label htmlFor="placeholder-mode" className="text-sm text-foreground">
              Create Placeholder
            </Label>
          </div>

          {isPlaceholder ? (
            <div className="space-y-2">
              <Label htmlFor="placeholder-name" className="text-foreground">
                Placeholder Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="placeholder-name"
                  type="text"
                  placeholder="Enter name..."
                  value={placeholderName}
                  onChange={(e) => setPlaceholderName(e.target.value)}
                  className="pl-10 bg-background border-input"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="user-search" className="text-foreground">
                Search Users
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="user-search"
                  type="text"
                  placeholder="Username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-input"
                />
              </div>
              {/* TODO: Add autocomplete dropdown here */}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-input hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || sendInvite.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[44px] min-h-[44px]"
            >
              {isPlaceholder ? (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Add Placeholder
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};