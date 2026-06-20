-- Staff Storage
CREATE TABLE staff_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES staff_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE staff_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES staff_folders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Onboarding Tasks
CREATE TABLE onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'customer', 'guest')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES onboarding_tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies (Simplified)
ALTER TABLE staff_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own folders" ON staff_folders FOR ALL USING (auth.uid() = user_id);

ALTER TABLE staff_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own files" ON staff_files FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own onboarding" ON user_onboarding FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can complete their own onboarding" ON user_onboarding FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all logs" ON audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed Data for Onboarding Tasks
INSERT INTO onboarding_tasks (title, description, role, sort_order) VALUES
('Complete Profile', 'Upload your profile photo and set your contact details.', 'employee', 1),
('Watch Training Video', 'Learn the basics of Savannah service standards.', 'employee', 2),
('Upload ID', 'Provide a copy of your identification for HR.', 'employee', 3),
('Set Shift Preferences', 'Let us know when you are available to work.', 'employee', 4),
('Admin Setup', 'Configure system settings and review dashboard metrics.', 'admin', 1);

-- Smart Notifications Trigger
CREATE OR REPLACE FUNCTION notify_on_profile_create()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    NEW.id,
    'Welcome to Savannah!',
    'Your account has been created. Please complete your onboarding tasks.',
    'success'
  );
  
  -- Also log the action
  INSERT INTO audit_logs (user_id, action, target_type, target_id)
  VALUES (NEW.id, 'account_creation', 'profile', NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION notify_on_profile_create();

-- Admin Metric Calculation Function
CREATE OR REPLACE FUNCTION get_onboarding_completion_rate()
RETURNS FLOAT AS $$
DECLARE
  total_staff_count INTEGER;
  completed_count INTEGER;
BEGIN
  SELECT count(*) INTO total_staff_count FROM profiles WHERE role IN ('admin', 'employee');
  IF total_staff_count = 0 THEN RETURN 0; END IF;
  
  SELECT count(DISTINCT user_id) INTO completed_count FROM user_onboarding;
  
  RETURN (completed_count::FLOAT / total_staff_count::FLOAT) * 100;
END;
$$ LANGUAGE plpgsql;



-- Inventory Updates
ALTER TABLE savannah_menus ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 100;

-- Delivery Updates
ALTER TABLE savannah_orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE savannah_orders ADD COLUMN IF NOT EXISTS assigned_driver_id UUID REFERENCES auth.users(id);
ALTER TABLE savannah_orders ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending';

-- Events & Updates
CREATE TABLE IF NOT EXISTS savannah_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL DEFAULT 'Savannah Bar & Grill',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE savannah_events ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'savannah_events' AND policyname = 'Public can view events') THEN
    CREATE POLICY "Public can view events" ON savannah_events FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'savannah_events' AND policyname = 'Admins can manage events') THEN
    CREATE POLICY "Admins can manage events" ON savannah_events FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- Seed Data for Events
INSERT INTO savannah_events (title, description, date, time, image_url)
SELECT 'Grand Launch Party', 'Join us for an exclusive evening of fine dining, live music, and signature cocktails as we celebrate our grand opening.', '2026-07-01', '19:00:00', '/images/bbq3.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM savannah_events WHERE title = 'Grand Launch Party');

INSERT INTO savannah_events (title, description, date, time, image_url)
SELECT 'Live Jazz Night', 'Experience the smooth sounds of the Savannah Jazz Trio while enjoying our wood-fired specialties.', '2026-07-05', '20:00:00', '/images/about-bbq.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM savannah_events WHERE title = 'Live Jazz Night');

INSERT INTO savannah_events (title, description, date, time, image_url)
SELECT 'Wine Tasting Evening', 'A curated selection of vintage labels paired with artisan small plates from our executive chef.', '2026-07-12', '18:30:00', '/images/burger-drinks-p.jpg'
WHERE NOT EXISTS (SELECT 1 FROM savannah_events WHERE title = 'Wine Tasting Evening');
