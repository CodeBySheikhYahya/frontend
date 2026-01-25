-- ============================================
-- RLS POLICIES FOR PRODUCTS TABLE
-- Adding UPDATE and DELETE policies (INSERT and SELECT already exist)
-- Admin check is done in frontend (like categories)
-- ============================================

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
DROP POLICY IF EXISTS "Authenticated users can view all products" ON products;

-- Authenticated users can view all products (for admin panel - including inactive)
CREATE POLICY "Authenticated users can view all products" ON products
    FOR SELECT 
    TO authenticated
    USING (true);

-- Authenticated users can update products (for admin panel)
CREATE POLICY "Authenticated users can update products" ON products
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated users can delete products (for admin panel)
-- Note: Products with orders cannot be deleted due to ON DELETE RESTRICT constraint
-- This will show an error message if deletion fails
CREATE POLICY "Authenticated users can delete products" ON products
    FOR DELETE 
    TO authenticated
    USING (true);
