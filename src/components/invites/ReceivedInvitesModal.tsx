import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Mail, Check, X } from 'lucide-react';
import { useReceivedInvites, useAcceptInvite, useDeclineInvite } from '@/hooks/useInvites';
import { useToast } from '@/hooks/use-toast';

interface ReceivedInvitesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReceivedInvitesModal = ({ open, onOpenChange }: ReceivedInvitesModalProps) => {
  const { data: invites, isLoading } = useReceivedInvites();
  const acceptInvite = useAcceptInvite();
  const declineInvite = useDeclineInvite();
  const { toast } = useToast();

  const handleAccept = (inviteId: string, tripName: string) => {
    acceptInvite.mutate(inviteId, {
      onSuccess: () => {
        toast({
          title: 'Invitation accepted',
          description: `You've joined "${tripName}"!`,
        });
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to accept invitation.',
        });
      },
    });
  };

  const handleDecline = (inviteId: string, tripName: string) => {
    declineInvite.mutate(inviteId, {
      onSuccess: () => {
        toast({
          title: 'Invitation declined',
          description: `You've declined the invitation to "${tripName}".`,
        });
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to decline invitation.',
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Trip Invitations
          </DialogTitle>
          <DialogDescription>
            Invitations you've received from other users
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto space-y-3">
          {isLoading ? (
            [...Array(2)].map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : invites?.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No pending invitations</p>
              </CardContent>
            </Card>
          ) : (
            invites?.map((invite) => (
              <Card key={invite.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-foreground">{invite.tripName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Invited by {invite.inviterName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(invite.id, invite.tripName)}
                        disabled={acceptInvite.isPending}
                        className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecline(invite.id, invite.tripName)}
                        disabled={declineInvite.isPending}
                        className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};