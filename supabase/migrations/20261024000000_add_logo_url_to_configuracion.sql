-- Add logo_url column to configuracion for custom user PDF report branding
ALTER TABLE public.configuracion
ADD COLUMN IF NOT EXISTS logo_url TEXT;
