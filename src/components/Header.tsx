
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Settings, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { ReceivedInvitesModal } from '@/components/invites/ReceivedInvitesModal';
import { useReceivedInvites } from '@/hooks/useInvites';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { settings } = useSettings();
  const { user, logout } = useAuth();
  const { tripId } = useParams();
  const [invitesModalOpen, setInvitesModalOpen] = useState(false);
  const { data: receivedInvites } = useReceivedInvites();

  return (
    <header className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-foreground animate-fade-in">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full w-fit mt-2">
          💰 All amounts in {settings.currency.name} ({settings.currency.code})
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          className="hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 transition-all duration-200 relative"
          onClick={() => setInvitesModalOpen(true)}
        >
          <Mail className="h-4 w-4 mr-2" />
          Invites
          {receivedInvites && receivedInvites.length > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs flex items-center justify-center text-white">
              {receivedInvites.length}
            </span>
          )}
        </Button>
        <Link to="/settings">
          <Button variant="outline" size="icon" className="hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 transition-all duration-200">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
        {user && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline" size="icon" className="hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 transition-all duration-200">
                <User className="h-4 w-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-48 bg-gradient-to-br from-card to-secondary/20 border-primary/20">
              <div className="space-y-2">
                <p className="font-medium">👋 {user.user_metadata?.display_name || user.user_metadata?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-destructive/10 to-destructive/20 hover:from-destructive/20 hover:to-destructive/30 border-destructive/30" 
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            </HoverCardContent>
          </HoverCard>
        )}
      </div>
      
      <ReceivedInvitesModal 
        open={invitesModalOpen} 
        onOpenChange={setInvitesModalOpen} 
      />
    </header>
  );
};

export default Header;
