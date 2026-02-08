-- ============================================
-- RLS POLICIES FOR product_specifications TABLE
-- Allow authenticated users (admin) to INSERT, UPDATE, DELETE
-- Public can already SELECT (exists in schema)
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Authenticated users can insert product specifications" ON product_specifications;
DROP POLICY IF EXISTS "Authenticated users can update product specifications" ON product_specifications;
DROP POLICY IF EXISTS "Authenticated users can delete product specifications" ON product_specifications;

-- Authenticated users can insert product specifications (admin)
CREATE POLICY "Authenticated users can insert product specifications"
    ON product_specifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated users can update product specifications (admin)
CREATE POLICY "Authenticated users can update product specifications"
    ON product_specifications
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated users can delete product specifications (admin)
CREATE POLICY "Authenticated users can delete product specifications"
    ON product_specifications
    FOR DELETE
    TO authenticated
    USING (true);
