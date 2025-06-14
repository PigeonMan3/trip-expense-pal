import { useState, useRef, useEffect } from 'react';
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
import { Search, User, Mail, Check } from 'lucide-react';
import { useSendInvite, useUserSearch, UserSearchResult } from '@/hooks/useInvites';
import { useToast } from '@/hooks/use-toast';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId?: string;
}

export const InviteModal = ({ isOpen, onClose, tripId }: InviteModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [placeholderName, setPlaceholderName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const sendInvite = useSendInvite();
  const { data: searchResults = [] } = useUserSearch(searchQuery);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedUser(null);
      setShowSuggestions(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tripId) return;
    
    if (isPlaceholder) {
      if (!placeholderName.trim()) return;
      // Use useAddPlaceholder hook for placeholders
      console.log('Creating placeholder:', { name: placeholderName, tripId });
    } else {
      if (selectedUser) {
        sendInvite.mutate({
          tripId,
          userId: selectedUser.id,
        }, {
          onSuccess: () => {
            toast({
              title: 'Invite sent!',
              description: `Invitation sent to ${selectedUser.name}`,
            });
          },
          onError: () => {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to send invitation',
            });
          },
        });
      } else if (searchQuery.includes('@')) {
        // If it's an email, send invite by email
        sendInvite.mutate({
          tripId,
          email: searchQuery,
        }, {
          onSuccess: () => {
            toast({
              title: 'Invite sent!',
              description: `Invitation sent to ${searchQuery}`,
            });
          },
          onError: () => {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to send invitation',
            });
          },
        });
      } else {
        return; // No valid user or email
      }
    }
    
    handleClose();
  };

  const handleUserSelect = (user: UserSearchResult) => {
    setSelectedUser(user);
    setSearchQuery(user.name);
    setShowSuggestions(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedUser(null);
    setShowSuggestions(value.length >= 2 && !isPlaceholder);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedUser(null);
    setIsPlaceholder(false);
    setPlaceholderName('');
    setShowSuggestions(false);
    onClose();
  };

  const isFormValid = tripId && (
    isPlaceholder 
      ? placeholderName.trim() 
      : selectedUser || searchQuery.includes('@')
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">New Invite</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="space-y-2 relative">
              <Label htmlFor="user-search" className="text-foreground">
                Search Users
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {selectedUser && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                <Input
                  ref={inputRef}
                  id="user-search"
                  type="text"
                  placeholder="Search by name or enter email..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(searchQuery.length >= 2)}
                  className="pl-10 pr-10 bg-background border-input"
                />
              </div>
              
              {showSuggestions && searchResults.length > 0 && (
                <div className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleUserSelect(user)}
                      className="w-full px-4 py-2 text-left hover:bg-accent focus:bg-accent focus:outline-none"
                    >
                      <div className="font-medium text-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground">@{user.username}</div>
                      {user.email && (
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
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