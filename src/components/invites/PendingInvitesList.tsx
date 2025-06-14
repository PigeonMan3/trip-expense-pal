import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { X, Mail } from 'lucide-react';
import { useCancelInvite } from '@/hooks/useInvites';
import { useIsMobile } from '@/hooks/use-mobile';

export interface PendingInvite {
  id: string;
  tripName: string;
  inviteeEmail?: string;
  inviteeUsername?: string;
  status: 'pending' | 'sending';
  createdAt: string;
}

interface PendingInvitesListProps {
  invites: PendingInvite[];
  isLoading: boolean;
}

export const PendingInvitesList = ({ invites, isLoading }: PendingInvitesListProps) => {
  const isMobile = useIsMobile();
  const cancelInvite = useCancelInvite();

  const handleCancel = (inviteId: string) => {
    cancelInvite.mutate(inviteId);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No pending invites</p>
        </CardContent>
      </Card>
    );
  }

  const InviteItem = ({ invite }: { invite: PendingInvite }) => (
    <Card className="bg-card border-border hover:bg-accent/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{invite.tripName}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {invite.inviteeUsername || invite.inviteeEmail}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(invite.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCancel(invite.id)}
            disabled={invite.status === 'sending' || cancelInvite.isPending}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            aria-label="Cancel invite"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {invite.status === 'sending' && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
            </div>
            <span className="text-xs text-muted-foreground">Sending...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
      <Accordion type="single" collapsible className="space-y-2">
        <AccordionItem value="pending-invites" className="border-border">
          <AccordionTrigger className="text-sm font-medium px-4 py-2 bg-card rounded-md">
            Pending Invites ({invites.length})
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {invites.map((invite) => (
              <InviteItem key={invite.id} invite={invite} />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <div className="space-y-3">
      {invites.map((invite) => (
        <InviteItem key={invite.id} invite={invite} />
      ))}
    </div>
  );
};