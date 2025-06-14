import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PendingInvite {
  id: string;
  tripName: string;
  inviteeEmail?: string;
  inviteeUsername?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
}

// Fetch pending invites for current user
export const usePendingInvites = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['pendingInvites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          id,
          status,
          created_at,
          invitee_email,
          trips!inner(name),
          profiles(name)
        `)
        .eq('inviter_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map((invite: any) => ({
        id: invite.id,
        tripName: invite.trips.name,
        inviteeEmail: invite.invitee_email,
        inviteeUsername: invite.profiles?.name,
        status: invite.status,
        createdAt: invite.created_at,
      })) || [];
    },
    enabled: !!user,
  });
};

// Search users by name or email
export const useUserSearch = (query: string) => {
  return useQuery({
    queryKey: ['userSearch', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (error) throw error;

      // Return simplified user data for search results
      return data?.map((profile: any) => ({
        id: profile.user_id,
        name: profile.name,
        email: '', // We'll handle email separately
      })) || [];
    },
    enabled: query.length >= 2,
  });
};

// Send invite mutation
export const useSendInvite = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, email, userId }: { 
      tripId: string; 
      email?: string; 
      userId?: string; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('invitations')
        .insert({
          trip_id: tripId,
          inviter_id: user.id,
          invitee_email: email,
          invitee_user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Invite sent",
        description: "The invitation has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['pendingInvites'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send invite",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Cancel invite mutation
export const useCancelInvite = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'cancelled' })
        .eq('id', inviteId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Invite cancelled",
        description: "The invitation has been cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ['pendingInvites'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel invite",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Add placeholder mutation
export const useAddPlaceholder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, name }: { tripId: string; name: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Add a dummy member to the trip
      const { data, error } = await supabase
        .from('members')
        .insert({
          trip_id: tripId,
          name,
          status: 'dummy',
          user_id: null, // No user_id for placeholders
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Placeholder added",
        description: "The placeholder has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add placeholder",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};