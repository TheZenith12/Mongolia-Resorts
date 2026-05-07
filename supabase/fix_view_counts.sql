-- view_count засварлах скрипт
-- Supabase SQL Editor дээр нэг удаа ажиллуулна уу

-- 1. site_stats хүснэгтэд total_views нэмэх (байгаа бол алгасна)
INSERT INTO site_stats (key, value)
VALUES ('total_views', 0), ('total_users', 0)
ON CONFLICT (key) DO NOTHING;

-- 2. site_stats дахь total_views-ийг places.view_count-ийн нийлбэрээр синхрончлох
UPDATE site_stats
SET value = (SELECT COALESCE(SUM(view_count), 0) FROM places),
    updated_at = NOW()
WHERE key = 'total_views';

-- 3. increment_view_count функц байгаа эсэхийг шалгаж, байхгүй бол үүсгэх
CREATE OR REPLACE FUNCTION increment_view_count(place_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE places SET view_count = view_count + 1 WHERE id = place_id;
  UPDATE site_stats SET value = value + 1, updated_at = NOW() WHERE key = 'total_views';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. site_stats-д public read policy нэмэх (байгаа бол алгасна)
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_site_stats" ON site_stats;
CREATE POLICY "public_read_site_stats" ON site_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_role_write_site_stats" ON site_stats;
CREATE POLICY "service_role_write_site_stats" ON site_stats FOR ALL USING (true);
