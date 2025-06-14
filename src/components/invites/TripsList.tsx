import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { UserPlus, MapPin } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export interface TripInvite {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isOwner: boolean;
  isCoAdmin: boolean;
}

interface TripsListProps {
  trips: TripInvite[];
  isLoading: boolean;
  onAddPeople: (tripId: string) => void;
}

export const TripsList = ({ trips, isLoading, onAddPeople }: TripsListProps) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-3" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No trips to manage</p>
        </CardContent>
      </Card>
    );
  }

  const TripItem = ({ trip }: { trip: TripInvite }) => (
    <Card className="bg-card border-border hover:bg-accent/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{trip.name}</h3>
            {trip.description && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {trip.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{trip.memberCount} members</span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                {trip.isOwner ? 'Owner' : 'Co-Admin'}
              </span>
            </div>
          </div>
          <Button
            onClick={() => onAddPeople(trip.id)}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
            aria-label={`Add people to ${trip.name}`}
          >
            <UserPlus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Add People</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
      <Accordion type="single" collapsible className="space-y-2">
        <AccordionItem value="your-trips" className="border-border">
          <AccordionTrigger className="text-sm font-medium px-4 py-2 bg-card rounded-md">
            Your Trips ({trips.length})
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {trips.map((trip) => (
              <TripItem key={trip.id} trip={trip} />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <div className="space-y-3">
      {trips.map((trip) => (
        <TripItem key={trip.id} trip={trip} />
      ))}
    </div>
  );
};