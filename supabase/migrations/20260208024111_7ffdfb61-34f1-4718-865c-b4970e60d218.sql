-- Create leads table for contact form submissions
CREATE TABLE public.leads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    source TEXT NOT NULL CHECK (source IN ('start', 'growth')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert leads (public contact form)
CREATE POLICY "Anyone can submit leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view leads
CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete leads
CREATE POLICY "Admins can delete leads"
ON public.leads
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update leads
CREATE POLICY "Admins can update leads"
ON public.leads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));