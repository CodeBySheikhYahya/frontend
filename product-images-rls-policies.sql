-- ============================================
-- RLS POLICIES FOR product_images TABLE
-- Required so admin can delete (and manage) product images
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable RLS on product_images (if not already)
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (avoid duplicate errors)
DROP POLICY IF EXISTS "Authenticated users can view product_images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can insert product_images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can update product_images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can delete product_images" ON product_images;

-- Authenticated users can view all product images (admin panel)
CREATE POLICY "Authenticated users can view product_images" ON product_images
    FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can insert product images (admin upload)
CREATE POLICY "Authenticated users can insert product_images" ON product_images
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated users can update product images (e.g. set is_primary)
CREATE POLICY "Authenticated users can update product_images" ON product_images
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated users can delete product images (admin delete)
CREATE POLICY "Authenticated users can delete product_images" ON product_images
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- If your admin panel uses ANON key (no login),
-- uncomment the block below so anon can manage product_images:
-- ============================================
/*
DROP POLICY IF EXISTS "Anon can view product_images" ON product_images;
DROP POLICY IF EXISTS "Anon can insert product_images" ON product_images;
DROP POLICY IF EXISTS "Anon can update product_images" ON product_images;
DROP POLICY IF EXISTS "Anon can delete product_images" ON product_images;

CREATE POLICY "Anon can view product_images" ON product_images FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert product_images" ON product_images FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update product_images" ON product_images FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete product_images" ON product_images FOR DELETE TO anon USING (true);
*/
