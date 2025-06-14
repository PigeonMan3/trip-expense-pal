-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT;

-- Migrate existing profiles data (populate email from auth.users)
UPDATE public.profiles 
SET 
  email = auth_users.email,
  display_name = COALESCE(profiles.name, 'User'),
  username = CONCAT(
    REGEXP_REPLACE(SPLIT_PART(auth_users.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'),
    '_',
    FLOOR(RANDOM() * 10000)::TEXT
  )
FROM auth.users AS auth_users
WHERE profiles.user_id = auth_users.id
AND profiles.email IS NULL;

-- Add constraints (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_email_unique') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_username_unique') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
  END IF;
END $$;

-- Set NOT NULL constraints after data migration
ALTER TABLE public.profiles 
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN username SET NOT NULL;

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, display_name, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    -- Generate a unique username based on email prefix + random suffix
    CONCAT(
      REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'),
      '_',
      FLOOR(RANDOM() * 10000)::TEXT
    )
  );
  RETURN NEW;
END;
$function$;

-- Enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles are viewable by authenticated users') THEN
    EXECUTE 'CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;