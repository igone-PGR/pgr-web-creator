
-- Table to store completed projects (after Stripe payment)
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  description TEXT NOT NULL,
  sector TEXT NOT NULL,
  slogan TEXT,
  logo TEXT,
  address TEXT,
  instagram TEXT,
  facebook TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  business_hours TEXT,
  services_list JSONB DEFAULT '[]',
  photos TEXT[] DEFAULT '{}',
  color_scheme TEXT NOT NULL DEFAULT 'Coral',
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  generated_content JSONB,
  stripe_session_id TEXT,
  stripe_payment_status TEXT DEFAULT 'pending',
  trello_card_id TEXT,
  paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS - only edge functions with service role can access
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- No permissive policies for anon: all access goes through edge functions with service_role key
