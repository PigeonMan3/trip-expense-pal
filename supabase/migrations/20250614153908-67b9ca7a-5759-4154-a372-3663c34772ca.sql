-- Create invitations table for trip invites
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL,
  inviter_id UUID NOT NULL,
  invitee_email TEXT,
  invitee_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_trip FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE,
  CONSTRAINT check_invitee CHECK (invitee_email IS NOT NULL OR invitee_user_id IS NOT NULL)
);

-- Enable Row Level Security
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for invitations
CREATE POLICY "Users can view invitations they sent or received" 
ON public.invitations 
FOR SELECT 
USING (
  auth.uid() = inviter_id OR 
  auth.uid() = invitee_user_id OR
  auth.email() = invitee_email
);

CREATE POLICY "Users can create invitations for their trips" 
ON public.invitations 
FOR INSERT 
WITH CHECK (
  auth.uid() = inviter_id AND
  EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid())
);

CREATE POLICY "Users can update their own sent invitations" 
ON public.invitations 
FOR UPDATE 
USING (auth.uid() = inviter_id);

CREATE POLICY "Users can update invitations sent to them" 
ON public.invitations 
FOR UPDATE 
USING (
  auth.uid() = invitee_user_id OR 
  auth.email() = invitee_email
);

-- Add updated_at trigger
CREATE TRIGGER update_invitations_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add role and status columns to members table for better invite management
ALTER TABLE public.members 
ADD COLUMN role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'dummy'));

-- Add index for better performance
CREATE INDEX idx_invitations_trip_id ON public.invitations(trip_id);
CREATE INDEX idx_invitations_invitee_email ON public.invitations(invitee_email);
CREATE INDEX idx_invitations_invitee_user_id ON public.invitations(invitee_user_id);
CREATE INDEX idx_invitations_status ON public.invitations(status);