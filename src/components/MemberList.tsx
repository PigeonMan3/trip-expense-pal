
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Search, User, Mail, Check } from 'lucide-react';
import { Member } from '@/types';
import { useSendInvite, useUserSearch, useAddPlaceholder, UserSearchResult } from '@/hooks/useInvites';
import { useToast } from '@/hooks/use-toast';

interface MemberListProps {
  members: Member[];
  onAddMember: (name: string) => void;
  onRemoveMember: (id: string) => void;
  tripId?: string;
}

const MemberList = ({ members, onAddMember, onRemoveMember, tripId }: MemberListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [isPlaceholder, setIsPlaceholder] = useState(true);
  const [placeholderName, setPlaceholderName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const sendInvite = useSendInvite();
  const addPlaceholder = useAddPlaceholder();
  const { data: searchResults = [] } = useUserSearch(searchQuery);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tripId) return;
    
    if (isPlaceholder) {
      if (!placeholderName.trim()) return;
      onAddMember(placeholderName.trim());
      setPlaceholderName('');
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
        return;
      }
      setSearchQuery('');
      setSelectedUser(null);
    }
    
    setShowSuggestions(false);
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

  const isFormValid = tripId && (
    isPlaceholder 
      ? placeholderName.trim() 
      : selectedUser || searchQuery.includes('@')
  );

  return (
    <Card className="p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-center">Trip Members</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="placeholder-mode"
            checked={isPlaceholder}
            onCheckedChange={setIsPlaceholder}
          />
          <Label htmlFor="placeholder-mode" className="text-sm text-foreground">
            Add Placeholder
          </Label>
        </div>

        {isPlaceholder ? (
          <div className="space-y-2">
            <Label htmlFor="placeholder-name" className="text-foreground">
              Name
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

        <Button
          type="submit"
          disabled={!isFormValid || sendInvite.isPending || addPlaceholder.isPending}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
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
      </form>
      
      {members.length === 0 ? (
        <div className="text-center text-muted-foreground p-4">
          No members yet. Add someone to get started!
        </div>
      ) : (
        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between p-2 bg-muted rounded-md animate-fade-in">
              <span className="font-medium">{member.name}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemoveMember(member.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                ✕
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default MemberList;
