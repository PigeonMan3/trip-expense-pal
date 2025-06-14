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

// Search users by name
export const useUserSearch = (searchQuery: string) => {
  return useQuery({
    queryKey: ['userSearch', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name')
        .or(`name.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      return data.map((profile: any) => ({
        id: profile.user_id,
        name: profile.name,
        email: '',
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