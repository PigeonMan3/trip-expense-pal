import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Profile {
  name: string;
  display_name: string;
  username: string;
  email: string;
}

export const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, display_name, username, email')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setDisplayName(data.display_name || data.name || '');
      setUsername(data.username || '');
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load profile information.',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateUsername = (username: string): boolean => {
    // Username should be 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    if (!validateUsername(username)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Username',
        description: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores.',
      });
      return;
    }

    if (!displayName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Display Name Required',
        description: 'Please enter a display name.',
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          username: username.toLowerCase().trim(),
        })
        .eq('user_id', user.id);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            variant: 'destructive',
            title: 'Username Taken',
            description: 'This username is already taken. Please choose another one.',
          });
          return;
        }
        throw error;
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });

      // Reload profile to get updated data
      await loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Failed to load profile information.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Manage your display name and username. Your username is used for invitations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Your email cannot be changed here. Contact support if needed.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How others will see your name"
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground">
            This is how your name appears to other users.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="your_username"
            maxLength={20}
          />
          <p className="text-xs text-muted-foreground">
            Used for invitations. 3-20 characters, letters, numbers, and underscores only.
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};