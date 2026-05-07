-- Availability blocks: manager-ийн гараар блоклосон огнооны хүрээ
-- Supabase SQL Editor дээр ажиллуулна уу

CREATE TABLE IF NOT EXISTS availability_blocks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id   UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  reason     TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_range CHECK (end_date >= start_date)
);

-- Index for fast lookup by place + date range
CREATE INDEX IF NOT EXISTS idx_availability_blocks_place_dates
  ON availability_blocks(place_id, start_date, end_date);

-- RLS
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;

-- Super admin: бүгдийг удирдах
CREATE POLICY "super_admin_all" ON availability_blocks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Manager: өөрийн газрын блокуудыг удирдах
CREATE POLICY "manager_own_place" ON availability_blocks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM manager_assigned_place
      WHERE manager_id = auth.uid() AND place_id = availability_blocks.place_id
    )
  );

-- Public read: захиалах үед блоклосон огноог шалгах
CREATE POLICY "public_read" ON availability_blocks
  FOR SELECT USING (true);
