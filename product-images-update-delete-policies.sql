-- ============================================
-- product_images: ADD UPDATE and DELETE only
-- Matches your existing RLS:
--   - "Public can view product images" (SELECT) – keep as is
--   - "Authenticated users can insert product images" (INSERT) – keep as is
-- This adds the missing UPDATE and DELETE for authenticated (admin).
-- Run in Supabase SQL Editor
-- ============================================

-- Drop only the policies we are about to create (avoid duplicate)
DROP POLICY IF EXISTS "Authenticated users can update product images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON product_images;

-- Authenticated users can update product images (e.g. set is_primary)
CREATE POLICY "Authenticated users can update product images" ON product_images
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated users can delete product images (admin delete)
CREATE POLICY "Authenticated users can delete product images" ON product_images
    FOR DELETE
    TO authenticated
    USING (true);
