-- ============================================
-- RLS POLICIES FOR PRODUCT_VARIANTS UPDATES
-- Only adding UPDATE and DELETE policies (INSERT already exists)
-- Admin check is done in frontend (like categories and product attributes)
-- ============================================

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Authenticated users can update product variants" ON product_variants;
DROP POLICY IF EXISTS "Authenticated users can delete product variants" ON product_variants;

-- Allow authenticated users to update product variants
-- Admin check is handled in frontend (same pattern as categories and product attributes)
CREATE POLICY "Authenticated users can update product variants"
    ON product_variants
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete product variants
CREATE POLICY "Authenticated users can delete product variants"
    ON product_variants
    FOR DELETE
    TO authenticated
    USING (true);
