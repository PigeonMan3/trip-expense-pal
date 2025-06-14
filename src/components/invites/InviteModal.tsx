import { useState, useMemo } from 'react';
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, User, Mail, Check, ChevronsUpDown } from 'lucide-react';
import { useSendInvite, useUserSearch, useAddPlaceholder } from '@/hooks/useInvites';
import { cn } from '@/lib/utils';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId?: string;
}

export const InviteModal = ({ isOpen, onClose, tripId }: InviteModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<{id: string; name: string; email: string} | null>(null);
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [placeholderName, setPlaceholderName] = useState('');
  const [isUserSelectOpen, setIsUserSelectOpen] = useState(false);
  
  const sendInvite = useSendInvite();
  const addPlaceholder = useAddPlaceholder();
  const { data: userSearchResults } = useUserSearch(searchQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tripId) return;
    
    if (isPlaceholder) {
      if (!placeholderName.trim()) return;
      addPlaceholder.mutate({
        tripId,
        name: placeholderName.trim(),
      });
    } else {
      if (!selectedUser && !searchQuery.includes('@')) return;
      
      // If a user is selected, invite by user ID, otherwise by email
      if (selectedUser) {
        sendInvite.mutate({
          tripId,
          userId: selectedUser.id,
        });
      } else if (searchQuery.includes('@')) {
        sendInvite.mutate({
          tripId,
          email: searchQuery,
        });
      }
    }
    
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedUser(null);
    setIsPlaceholder(false);
    setPlaceholderName('');
    setIsUserSelectOpen(false);
    onClose();
  };

  const isFormValid = tripId && (
    isPlaceholder ? placeholderName.trim() : (selectedUser || searchQuery.includes('@'))
  );

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!userSearchResults) return [];
    return userSearchResults.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [userSearchResults, searchQuery]);

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
            <div className="space-y-2">
              <Label htmlFor="user-search" className="text-foreground">
                Search Users or Enter Email
              </Label>
              <Popover open={isUserSelectOpen} onOpenChange={setIsUserSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isUserSelectOpen}
                    className="w-full justify-between bg-background border-input"
                  >
                    <div className="flex items-center">
                      <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="truncate">
                        {selectedUser ? selectedUser.name : searchQuery || "Search users or enter email..."}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search users or type email..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      {searchQuery.includes('@') && !selectedUser && (
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setSelectedUser(null);
                              setIsUserSelectOpen(false);
                            }}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Invite {searchQuery}</span>
                          </CommandItem>
                        </CommandGroup>
                      )}
                      {filteredUsers.length > 0 && (
                        <CommandGroup heading="Users">
                          {filteredUsers.map((user) => (
                            <CommandItem
                              key={user.id}
                              onSelect={() => {
                                setSelectedUser(user);
                                setSearchQuery(user.name);
                                setIsUserSelectOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <User className="mr-2 h-4 w-4" />
                              <span>{user.name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                      {!searchQuery.includes('@') && filteredUsers.length === 0 && searchQuery.length > 0 && (
                        <CommandEmpty>No users found.</CommandEmpty>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
              disabled={!isFormValid || sendInvite.isPending || addPlaceholder.isPending}
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