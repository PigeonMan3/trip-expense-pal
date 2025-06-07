
import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { settings } = useSettings();
  const { user, logout } = useAuth();

  return (
    <header className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          All amounts in {settings.currency.name} ({settings.currency.code})
        </p>
      </div>
      <div className="flex items-center gap-2">
        {user && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-48">
              <div className="space-y-2">
                <p className="font-medium">{user.user_metadata?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            </HoverCardContent>
          </HoverCard>
        )}
        <Link to="/settings">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
