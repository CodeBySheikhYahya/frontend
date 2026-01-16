-- ============================================
-- DYNAMIC PRODUCT ATTRIBUTES SYSTEM
-- Allows any product type with flexible attributes
-- ============================================

-- ============================================
-- 1. PRODUCT ATTRIBUTES TABLE
-- Stores attribute definitions (Color, Size, Capacity, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS product_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g., "Color", "Size", "Capacity", "Storage"
    display_name VARCHAR(100) NOT NULL, -- e.g., "Color", "Size", "Bag Capacity"
    attribute_type VARCHAR(50) NOT NULL DEFAULT 'select', -- 'select', 'text', 'number', 'color'
    is_predefined BOOLEAN DEFAULT false, -- true for pre-built, false for custom
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attributes_name ON product_attributes(name);
CREATE INDEX idx_attributes_type ON product_attributes(attribute_type);
CREATE INDEX idx_attributes_predefined ON product_attributes(is_predefined);

-- ============================================
-- 2. PRODUCT ATTRIBUTE VALUES TABLE
-- Stores the actual values for each attribute
-- ============================================
CREATE TABLE IF NOT EXISTS product_attribute_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attribute_id UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL, -- e.g., "Small", "256GB", "Leather", "#FF0000"
    display_value VARCHAR(255), -- Optional: different display text
    hex_code VARCHAR(7), -- For color attributes
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(attribute_id, value) -- Prevent duplicate values for same attribute
);

CREATE INDEX idx_attribute_values_attribute ON product_attribute_values(attribute_id);
CREATE INDEX idx_attribute_values_value ON product_attribute_values(value);
CREATE INDEX idx_attribute_values_active ON product_attribute_values(is_active);

-- ============================================
-- 3. CATEGORY ATTRIBUTES TABLE
-- Links which attributes each category uses
-- ============================================
CREATE TABLE IF NOT EXISTS category_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    attribute_id UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true, -- Must this attribute be filled?
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, attribute_id) -- One attribute per category only once
);

CREATE INDEX idx_category_attributes_category ON category_attributes(category_id);
CREATE INDEX idx_category_attributes_attribute ON category_attributes(attribute_id);

-- ============================================
-- 4. PRODUCT VARIANT ATTRIBUTES TABLE
-- Stores which attribute values each variant has
-- Replaces the fixed color_id + size_id structure
-- ============================================
CREATE TABLE IF NOT EXISTS product_variant_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_id UUID NOT NULL REFERENCES product_attributes(id) ON DELETE RESTRICT,
    attribute_value_id UUID NOT NULL REFERENCES product_attribute_values(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(variant_id, attribute_id) -- One value per attribute per variant
);

CREATE INDEX idx_variant_attributes_variant ON product_variant_attributes(variant_id);
CREATE INDEX idx_variant_attributes_attribute ON product_variant_attributes(attribute_id);
CREATE INDEX idx_variant_attributes_value ON product_variant_attributes(attribute_value_id);

-- ============================================
-- 5. MODIFY PRODUCT_VARIANTS TABLE
-- Make color_id and size_id optional (for backward compatibility)
-- ============================================
-- Note: Run this only if you want to keep old structure working
-- ALTER TABLE product_variants 
--     ALTER COLUMN color_id DROP NOT NULL,
--     ALTER COLUMN size_id DROP NOT NULL;

-- ============================================
-- 6. NO PRE-BUILT ATTRIBUTES
-- Admins will create attributes customly for each product type
-- Clothing already uses colors and sizes tables (existing structure)
-- For bags, perfumes, etc. - admins will add custom attributes
-- ============================================

-- ============================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_attributes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. RLS POLICIES FOR PRODUCT_ATTRIBUTES
-- ============================================

-- Public can view all attributes
CREATE POLICY "Public can view product attributes"
    ON product_attributes
    FOR SELECT
    TO public
    USING (true);

-- Authenticated users (admins) can insert attributes
CREATE POLICY "Authenticated users can insert product attributes"
    ON product_attributes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated users (admins) can update attributes
CREATE POLICY "Authenticated users can update product attributes"
    ON product_attributes
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated users (admins) can delete attributes
CREATE POLICY "Authenticated users can delete product attributes"
    ON product_attributes
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- 9. RLS POLICIES FOR PRODUCT_ATTRIBUTE_VALUES
-- ============================================

-- Public can view all attribute values
CREATE POLICY "Public can view product attribute values"
    ON product_attribute_values
    FOR SELECT
    TO public
    USING (true);

-- Authenticated users (admins) can insert attribute values
CREATE POLICY "Authenticated users can insert product attribute values"
    ON product_attribute_values
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated users (admins) can update attribute values
CREATE POLICY "Authenticated users can update product attribute values"
    ON product_attribute_values
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated users (admins) can delete attribute values
CREATE POLICY "Authenticated users can delete product attribute values"
    ON product_attribute_values
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- 10. RLS POLICIES FOR CATEGORY_ATTRIBUTES
-- ============================================

-- Public can view category attributes
CREATE POLICY "Public can view category attributes"
    ON category_attributes
    FOR SELECT
    TO public
    USING (true);

-- Authenticated users (admins) can insert category attributes
CREATE POLICY "Authenticated users can insert category attributes"
    ON category_attributes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated users (admins) can update category attributes
CREATE POLICY "Authenticated users can update category attributes"
    ON category_attributes
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated users (admins) can delete category attributes
CREATE POLICY "Authenticated users can delete category attributes"
    ON category_attributes
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- 11. RLS POLICIES FOR PRODUCT_VARIANT_ATTRIBUTES
-- ============================================

-- Public can view variant attributes
CREATE POLICY "Public can view product variant attributes"
    ON product_variant_attributes
    FOR SELECT
    TO public
    USING (true);

-- Authenticated users (admins) can insert variant attributes
CREATE POLICY "Authenticated users can insert product variant attributes"
    ON product_variant_attributes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated users (admins) can update variant attributes
CREATE POLICY "Authenticated users can update product variant attributes"
    ON product_variant_attributes
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated users (admins) can delete variant attributes
CREATE POLICY "Authenticated users can delete product variant attributes"
    ON product_variant_attributes
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- 12. TRIGGER TO UPDATE UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_product_attributes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_attributes_timestamp
    BEFORE UPDATE ON product_attributes
    FOR EACH ROW
    EXECUTE FUNCTION update_product_attributes_updated_at();
