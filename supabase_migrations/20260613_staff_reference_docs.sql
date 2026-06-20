-- Add Global Reference Flag to Staff Files
ALTER TABLE public.staff_files ADD COLUMN IF NOT EXISTS is_reference BOOLEAN DEFAULT false;

-- Update RLS to allow all staff to view reference files
DROP POLICY IF EXISTS "Staff can view reference files" ON public.staff_files;
CREATE POLICY "Staff can view reference files"
  ON public.staff_files
  FOR SELECT
  USING (
    is_reference = true AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
  );

-- Seed Reference Documents
-- Note: Using a NULL user_id for global system files, or we can use a dedicated system user.
-- For simplicity, we'll allow NULL user_id for reference files.
ALTER TABLE public.staff_files ALTER COLUMN user_id DROP NOT NULL;

INSERT INTO public.staff_files (name, path, type, size, is_reference)
VALUES
  ('Product Overview', '/docs/PRODUCT.md', 'text/markdown', 1500, true),
  ('User Manual', '/docs/USER_MANUAL.md', 'text/markdown', 2200, true),
  ('Service Standards', '/docs/SERVICE_STANDARDS.md', 'text/markdown', 1200, true),
  ('Dress Code Policy', '/docs/DRESS_CODE.md', 'text/markdown', 1100, true),
  ('Health & Safety', '/docs/HEALTH_AND_SAFETY.md', 'text/markdown', 1300, true),
  ('Onboarding Checklist', '/docs/ONBOARDING_CHECKLIST.md', 'text/markdown', 1000, true),
  ('Code of Conduct', '/docs/CODE_OF_CONDUCT.md', 'text/markdown', 1600, true)
ON CONFLICT DO NOTHING;
