-- Make member user_id nullable to allow trip members who aren't registered users
ALTER TABLE public.members ALTER COLUMN user_id DROP NOT NULL;