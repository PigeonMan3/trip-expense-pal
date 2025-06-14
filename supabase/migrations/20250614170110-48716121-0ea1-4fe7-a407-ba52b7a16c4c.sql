-- Add foreign keys to link invitations with profiles table
ALTER TABLE public.invitations 
ADD CONSTRAINT fk_invitations_inviter 
FOREIGN KEY (inviter_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.invitations 
ADD CONSTRAINT fk_invitations_invitee 
FOREIGN KEY (invitee_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;