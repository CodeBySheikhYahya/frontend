-- ============================================
-- RLS POLICIES FOR CATEGORIES TABLE
-- ============================================

-- Enable RLS (if not already enabled)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view active categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
DROP POLICY IF EXISTS "Public can view all categories" ON categories;

-- Public can view active categories (for shop page)
CREATE POLICY "Public can view active categories" ON categories
    FOR SELECT 
    USING (is_active = true);

-- Authenticated users can view all categories (for admin panel)
CREATE POLICY "Authenticated users can view all categories" ON categories
    FOR SELECT 
    TO authenticated
    USING (true);

-- Authenticated users can insert categories (for admin panel)
CREATE POLICY "Authenticated users can insert categories" ON categories
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Authenticated users can update categories (for admin panel)
CREATE POLICY "Authenticated users can update categories" ON categories
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated users can delete categories (for admin panel)
CREATE POLICY "Authenticated users can delete categories" ON categories
    FOR DELETE 
    TO authenticated
    USING (true);
