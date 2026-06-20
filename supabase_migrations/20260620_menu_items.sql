-- Menu categories and items (with image support)

CREATE TABLE IF NOT EXISTS savannah_menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS savannah_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_slug TEXT NOT NULL REFERENCES savannah_menu_categories(slug) ON UPDATE CASCADE,
  menu_title TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER DEFAULT 100,
  image_url TEXT NOT NULL DEFAULT '',
  image_url_2 TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS savannah_menu_items_slug_idx ON savannah_menu_items(menu_slug);
CREATE INDEX IF NOT EXISTS savannah_menu_items_available_idx ON savannah_menu_items(is_available);

ALTER TABLE savannah_menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE savannah_menu_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'savannah_menu_categories' AND policyname = 'Public can view menu categories') THEN
    CREATE POLICY "Public can view menu categories" ON savannah_menu_categories FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'savannah_menu_items' AND policyname = 'Public can view available menu items') THEN
    CREATE POLICY "Public can view available menu items" ON savannah_menu_items FOR SELECT USING (is_available = true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'savannah_menu_categories' AND policyname = 'Staff can manage menu categories') THEN
    CREATE POLICY "Staff can manage menu categories" ON savannah_menu_categories FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'savannah_menu_items' AND policyname = 'Staff can manage menu items') THEN
    CREATE POLICY "Staff can manage menu items" ON savannah_menu_items FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
    );
  END IF;
END $$;

-- Seed categories
INSERT INTO savannah_menu_categories (slug, title, description, image_url, sort_order)
VALUES
  ('mainmenu', 'Main Menu', 'Signature dishes, appetizers, and mains.', '/images/bbq3.jpeg', 1),
  ('steak', 'Steak', 'Classic steakhouse favorites.', '/images/meat-w.jpg', 2),
  ('cocktail', 'Cocktails', 'Signature cocktails from our bar.', '/images/burger-drinks-p.jpg', 3)
ON CONFLICT (slug) DO NOTHING;

-- Seed 10 dummy items (each with at least one image)
INSERT INTO savannah_menu_items (menu_slug, menu_title, name, description, price, sort_order, is_available, image_url, image_url_2)
SELECT v.*
FROM (VALUES
  ('mainmenu', 'Main Menu', 'Grilled Salmon', 'Char-grilled fillet with lemon butter and seasonal greens.', '$24', 10, true, '/images/about-fish.jpeg', '/images/chapsoup.jpeg'),
  ('mainmenu', 'Main Menu', 'Classic Cheeseburger', 'House burger, melted cheese, pickles, and fries.', '$18', 20, true, '/images/burger-drinks-p.jpg', ''),
  ('mainmenu', 'Main Menu', 'Caesar Salad', 'Romaine, parmesan, croutons, and grilled chicken.', '$17', 30, true, '/images/about-bbq.jpeg', ''),
  ('steak', 'Steak', 'Sirloin Steak', 'Lean sirloin with fries and peppercorn sauce.', '$27', 10, true, '/images/meat-w.jpg', '/images/grilling-p.jpg'),
  ('steak', 'Steak', 'Ribeye', 'Marbled ribeye cooked to your liking.', '$34', 20, true, '/images/grilling-3p.jpg', ''),
  ('steak', 'Steak', 'T-Bone', 'Grilled T-bone with garlic butter.', '$36', 30, true, '/images/about-meat.jpeg', ''),
  ('cocktail', 'Cocktails', 'Savannah Gold', 'Bourbon, honey, lemon, and aromatic bitters.', '$13', 10, true, '/images/about-drinks.jpeg', '/images/burger-drinks-p.jpg'),
  ('cocktail', 'Cocktails', 'Classic Martini', 'Gin or vodka with dry vermouth.', '$12', 20, true, '/images/about-drinks.jpeg', ''),
  ('cocktail', 'Cocktails', 'Negroni', 'Gin, Campari, and sweet vermouth.', '$12', 30, true, '/images/bbq-p.jpg', ''),
  ('mainmenu', 'Main Menu', 'Smoked Brisket Plate', 'Slow-smoked brisket with house BBQ sauce.', '$25', 40, true, '/images/bbq2.jpeg', '/images/bbq3.jpeg')
) AS v(menu_slug, menu_title, name, description, price, sort_order, is_available, image_url, image_url_2)
WHERE NOT EXISTS (SELECT 1 FROM savannah_menu_items LIMIT 1);
