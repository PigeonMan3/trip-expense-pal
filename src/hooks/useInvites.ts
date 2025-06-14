import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { PendingInvite } from '@/components/invites/PendingInvitesList';
import { TripInvite } from '@/components/invites/TripsList';

// Mock data and functions for now - replace with actual Supabase calls

const mockPendingInvites: PendingInvite[] = [
  {
    id: '1',
    tripName: 'Tokyo Adventure',
    inviteeEmail: 'john@example.com',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    tripName: 'European Backpacking',
    inviteeUsername: 'sarah_travels',
    status: 'sending',
    createdAt: new Date().toISOString(),
  },
];

const mockTrips: TripInvite[] = [
  {
    id: '1',
    name: 'Tokyo Adventure',
    description: 'Exploring Japan with friends',
    memberCount: 4,
    isOwner: true,
    isCoAdmin: false,
  },
  {
    id: '2',
    name: 'European Backpacking',
    memberCount: 6,
    isOwner: false,
    isCoAdmin: true,
  },
];

// Hooks for pending invites
export const usePendingInvites = () => {
  return useQuery({
    queryKey: ['pendingInvites'],
    queryFn: async (): Promise<PendingInvite[]> => {
      // TODO: Replace with actual Supabase query
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockPendingInvites;
    },
  });
};

export const useCancelInvite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      // TODO: Replace with actual Supabase delete
      await new Promise(resolve => setTimeout(resolve, 500));
      return inviteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingInvites'] });
      toast({
        title: 'Invite cancelled',
        description: 'The invitation has been cancelled successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to cancel the invitation. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Hooks for trips
export const useTrips = () => {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async (): Promise<TripInvite[]> => {
      // TODO: Replace with actual Supabase query
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockTrips;
    },
  });
};

// Hooks for sending invites
export const useSendInvite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tripId, email }: { tripId: string; email: string }) => {
      // TODO: Replace with actual Supabase insert
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { tripId, email };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingInvites'] });
      toast({
        title: 'Invite sent',
        description: 'The invitation has been sent successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send the invitation. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Hooks for adding placeholders
export const useAddPlaceholder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tripId, name }: { tripId: string; name: string }) => {
      // TODO: Replace with actual Supabase insert
      await new Promise(resolve => setTimeout(resolve, 500));
      return { tripId, name };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({
        title: 'Placeholder added',
        description: 'The placeholder has been added successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add the placeholder. Please try again.',
        variant: 'destructive',
      });
    },
  });
};