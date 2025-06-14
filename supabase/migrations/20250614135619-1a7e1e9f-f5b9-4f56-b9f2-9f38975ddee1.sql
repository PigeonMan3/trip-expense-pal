-- Add pinned column to trips table
ALTER TABLE public.trips 
ADD COLUMN pinned BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance when filtering pinned trips
CREATE INDEX idx_trips_pinned ON public.trips(pinned, created_at DESC);