ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS preferred_domain text DEFAULT NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS language text DEFAULT 'es' NOT NULL;