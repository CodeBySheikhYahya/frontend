-- ============================================
-- RLS: UPDATE and DELETE for colors and sizes
-- Run this in Supabase SQL Editor so admin can edit/delete.
-- ============================================

-- COLORS: allow authenticated users to update and delete
CREATE POLICY "Authenticated users can update colors"
    ON colors
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete colors"
    ON colors
    FOR DELETE
    TO authenticated
    USING (true);

-- SIZES: allow authenticated users to update and delete
CREATE POLICY "Authenticated users can update sizes"
    ON sizes
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sizes"
    ON sizes
    FOR DELETE
    TO authenticated
    USING (true);
