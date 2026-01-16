-- ============================================
-- DELETE DYNAMIC ATTRIBUTES SYSTEM
-- Run this to remove all tables, policies, and triggers
-- ============================================

-- ============================================
-- 1. DROP RLS POLICIES
-- ============================================

-- Drop policies for product_variant_attributes
DROP POLICY IF EXISTS "Authenticated users can delete product variant attributes" ON product_variant_attributes;
DROP POLICY IF EXISTS "Authenticated users can update product variant attributes" ON product_variant_attributes;
DROP POLICY IF EXISTS "Authenticated users can insert product variant attributes" ON product_variant_attributes;
DROP POLICY IF EXISTS "Public can view product variant attributes" ON product_variant_attributes;

-- Drop policies for category_attributes
DROP POLICY IF EXISTS "Authenticated users can delete category attributes" ON category_attributes;
DROP POLICY IF EXISTS "Authenticated users can update category attributes" ON category_attributes;
DROP POLICY IF EXISTS "Authenticated users can insert category attributes" ON category_attributes;
DROP POLICY IF EXISTS "Public can view category attributes" ON category_attributes;

-- Drop policies for product_attribute_values
DROP POLICY IF EXISTS "Authenticated users can delete product attribute values" ON product_attribute_values;
DROP POLICY IF EXISTS "Authenticated users can update product attribute values" ON product_attribute_values;
DROP POLICY IF EXISTS "Authenticated users can insert product attribute values" ON product_attribute_values;
DROP POLICY IF EXISTS "Public can view product attribute values" ON product_attribute_values;

-- Drop policies for product_attributes
DROP POLICY IF EXISTS "Authenticated users can delete product attributes" ON product_attributes;
DROP POLICY IF EXISTS "Authenticated users can update product attributes" ON product_attributes;
DROP POLICY IF EXISTS "Authenticated users can insert product attributes" ON product_attributes;
DROP POLICY IF EXISTS "Public can view product attributes" ON product_attributes;

-- ============================================
-- 2. DROP TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_product_attributes_timestamp ON product_attributes;

-- ============================================
-- 3. DROP FUNCTIONS
-- ============================================
DROP FUNCTION IF EXISTS update_product_attributes_updated_at();

-- ============================================
-- 4. DROP TABLES (in correct order due to foreign keys)
-- ============================================

-- Drop tables that reference other tables first
DROP TABLE IF EXISTS product_variant_attributes CASCADE;
DROP TABLE IF EXISTS category_attributes CASCADE;
DROP TABLE IF EXISTS product_attribute_values CASCADE;
DROP TABLE IF EXISTS product_attributes CASCADE;

-- ============================================
-- 5. REVERT PRODUCT_VARIANTS TABLE (if you modified it)
-- ============================================
-- If you ran the ALTER TABLE to make color_id and size_id optional,
-- you can revert it back with these (uncomment if needed):
-- ALTER TABLE product_variants 
--     ALTER COLUMN color_id SET NOT NULL,
--     ALTER COLUMN size_id SET NOT NULL;
