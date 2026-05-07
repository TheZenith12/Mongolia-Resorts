-- =============================================================
-- SITE SETTINGS TABLE
-- Supabase SQL Editor-т ажиллуулна уу
-- =============================================================

CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default утгуудыг оруулах
INSERT INTO site_settings (key, value) VALUES
  ('site_name',  'Монгол Нутаг'),
  ('site_phone', '+976 9900-0000'),
  ('site_email', 'info@mongolnudag.mn'),
  ('site_url',   'https://mongolnudag.mn'),
  ('fb_url',     ''),
  ('ig_url',     '')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Бүх хэрэглэгч унших эрхтэй (site_name, phone харуулахад хэрэгтэй)
CREATE POLICY "Anyone can read settings" ON site_settings FOR SELECT USING (true);

-- Зөвхөн super_admin засах эрхтэй
CREATE POLICY "Super admin manages settings" ON site_settings FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );
