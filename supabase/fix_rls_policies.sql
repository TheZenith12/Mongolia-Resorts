-- =============================================================
-- FIX: RLS policies for rooms and places (manager access)
-- Supabase SQL Editor-т ажиллуулна уу
-- =============================================================

-- ── 1. ROOMS: manager_assigned_place ашиглан manager-т зөвшөөрөх ────────────
DROP POLICY IF EXISTS "Admin manages rooms" ON rooms;

CREATE POLICY "Admin manages rooms" ON rooms FOR ALL
  USING (
    -- Super admin бүгдийг засаж чадна
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
    OR
    -- Manager зөвхөн өөрт оноогдсон газрын өрөөг засаж чадна
    EXISTS (
      SELECT 1 FROM manager_assigned_place
      WHERE manager_id = auth.uid() AND place_id = rooms.place_id
    )
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
    OR
    EXISTS (
      SELECT 1 FROM manager_assigned_place
      WHERE manager_id = auth.uid() AND place_id = rooms.place_id
    )
  );

-- ── 2. PLACES: manager_assigned_place ашиглан manager UPDATE зөвшөөрөх ──────
DROP POLICY IF EXISTS "Manager can edit own place" ON places;

CREATE POLICY "Manager can edit own place" ON places FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM manager_assigned_place
      WHERE manager_id = auth.uid() AND place_id = places.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM manager_assigned_place
      WHERE manager_id = auth.uid() AND place_id = places.id
    )
  );

-- ── 3. MANAGER_ASSIGNED_PLACE: super_admin INSERT/UPDATE/DELETE ───────────────
-- (Admin API client bypasses RLS, but adding explicit policies for safety)
DROP POLICY IF EXISTS "Super admin manages assignments" ON manager_assigned_place;

CREATE POLICY "Super admin manages assignments" ON manager_assigned_place FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- ── 4. BOOKINGS: manager_assigned_place ашиглан booking харах ────────────────
-- Manager зөвхөн өөрт оноогдсон газрын захиалгуудыг харна
DROP POLICY IF EXISTS "Manager can view assigned place bookings" ON bookings;

CREATE POLICY "Manager can view assigned place bookings" ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM manager_assigned_place
      WHERE manager_id = auth.uid() AND place_id = bookings.place_id
    )
  );

-- ── 5. Verify ─────────────────────────────────────────────────────────────────
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('rooms', 'places', 'manager_assigned_place', 'bookings')
ORDER BY tablename, policyname;
