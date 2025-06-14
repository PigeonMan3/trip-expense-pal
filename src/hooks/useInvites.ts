import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PendingInvite {
  id: string;
  tripName: string;
  inviteeEmail?: string;
  inviteeUsername?: string;
  status: 'pending' | 'sending';
  createdAt: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  username: string;
}

// Fetch pending invites for a specific trip
export const usePendingInvites = (tripId?: string) => {
  return useQuery({
    queryKey: ['pendingInvites', tripId],
    queryFn: async () => {
      if (!tripId) return [];
      
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          id,
          invitee_email,
          status,
          created_at,
          trip:trips(name),
          invitee:profiles(name)
        `)
        .eq('trip_id', tripId)
        .eq('status', 'pending');

      if (error) throw error;

      return data.map((invite: any) => ({
        id: invite.id,
        tripName: invite.trip?.name || 'Unknown Trip',
        inviteeEmail: invite.invitee_email,
        inviteeUsername: invite.invitee?.name,
        status: invite.status,
        createdAt: invite.created_at,
      })) as PendingInvite[];
    },
    enabled: !!tripId,
  });
};

// Search users by name, username, or email
export const useUserSearch = (searchQuery: string) => {
  return useQuery({
    queryKey: ['userSearch', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, display_name, username, email')
        .or(`name.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .neq('user_id', user.user?.id)
        .limit(10);

      if (error) throw error;

      return data.map((profile: any) => ({
        id: profile.user_id,
        name: profile.display_name || profile.name,
        email: profile.email,
        username: profile.username,
      })) as UserSearchResult[];
    },
    enabled: searchQuery.length >= 2,
  });
};

// Send invitation
export const useSendInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, email, userId }: { 
      tripId: string; 
      email?: string; 
      userId?: string;
    }) => {
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          trip_id: tripId,
          inviter_id: (await supabase.auth.getUser()).data.user?.id,
          invitee_email: email,
          invitee_user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingInvites', variables.tripId] });
    },
  });
};

// Cancel invitation
export const useCancelInvite = () => {
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
      queryClient.invalidateQueries({ queryKey: ['pendingInvites'] });
    },
  });
};

// Fetch received invitations for current user
export const useReceivedInvites = () => {
  return useQuery({
    queryKey: ['receivedInvites'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          id,
          status,
          created_at,
          trip:trips(id, name),
          inviter:profiles!inviter_id(name)
        `)
        .or(`invitee_email.eq.${user.user.email},invitee_user_id.eq.${user.user.id}`)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching received invites:', error);
        throw error;
      }

      return data.map((invite: any) => ({
        id: invite.id,
        tripId: invite.trip?.id,
        tripName: invite.trip?.name || 'Unknown Trip',
        inviterName: invite.inviter?.name || 'Unknown User',
        status: invite.status,
        createdAt: invite.created_at,
      }));
    },
  });
};

// Accept invitation
export const useAcceptInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivedInvites'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};

// Decline invitation
export const useDeclineInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivedInvites'] });
    },
  });
};

// Add placeholder
export const useAddPlaceholder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, name }: { tripId: string; name: string }) => {
      const { data, error } = await supabase
        .from('members')
        .insert({
          trip_id: tripId,
          name,
          status: 'dummy',
          user_id: null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};