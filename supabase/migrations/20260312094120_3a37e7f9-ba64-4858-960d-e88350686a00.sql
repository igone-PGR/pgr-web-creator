ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS vercel_url text DEFAULT NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS vercel_project_id text DEFAULT NULL;