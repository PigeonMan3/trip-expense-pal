import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Search, User, Mail, X } from 'lucide-react';
import { useAddPlaceholder } from '@/hooks/useInvites';

interface AddPeoplePanelProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string | null;
}

export const AddPeoplePanel = ({ isOpen, onClose, tripId }: AddPeoplePanelProps) => {
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [placeholderName, setPlaceholderName] = useState('');
  
  const addPlaceholder = useAddPlaceholder();

  const handleAddUser = () => {
    if (!userSearchQuery.trim() || !tripId) return;
    
    // TODO: Implement user invite logic
    console.log('Adding user:', { email: userSearchQuery, tripId });
    
    setUserSearchQuery('');
    onClose();
  };

  const handleAddPlaceholder = () => {
    if (!placeholderName.trim() || !tripId) return;
    
    addPlaceholder.mutate({
      tripId,
      name: placeholderName.trim(),
    });
    
    setPlaceholderName('');
    onClose();
  };

  const handleClose = () => {
    setUserSearchQuery('');
    setPlaceholderName('');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-foreground">Add People</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="users" className="data-[state=active]:bg-background">
              Real Users
            </TabsTrigger>
            <TabsTrigger value="placeholders" className="data-[state=active]:bg-background">
              Placeholders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="user-search-panel" className="text-foreground">
                Search Users
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="user-search-panel"
                  type="text"
                  placeholder="Username or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-input"
                />
              </div>
              {/* TODO: Add autocomplete results here */}
              
              <Button
                onClick={handleAddUser}
                disabled={!userSearchQuery.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px]"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Invite
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="placeholders" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="placeholder-name-panel" className="text-foreground">
                Placeholder Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="placeholder-name-panel"
                  type="text"
                  placeholder="Enter name..."
                  value={placeholderName}
                  onChange={(e) => setPlaceholderName(e.target.value)}
                  className="pl-10 bg-background border-input"
                />
              </div>
              
              <Button
                onClick={handleAddPlaceholder}
                disabled={!placeholderName.trim() || addPlaceholder.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px]"
              >
                <User className="h-4 w-4 mr-2" />
                Add Placeholder
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-secondary/20 rounded-md border border-border">
          <h4 className="text-sm font-medium text-foreground mb-2">Quick Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Real users will receive invite notifications</li>
            <li>• Placeholders can be converted later</li>
            <li>• All members can split expenses equally</li>
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
};