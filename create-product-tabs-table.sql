-- ============================================
-- PRODUCT TABS CONFIGURATION TABLE
-- Allows admin to configure which tabs appear on product pages
-- ============================================
CREATE TABLE IF NOT EXISTS product_tabs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tab_key VARCHAR(50) NOT NULL UNIQUE, -- e.g., "details", "reviews", "faq"
    display_name VARCHAR(100) NOT NULL, -- e.g., "Product Details", "Rating & Reviews"
    component_type VARCHAR(50) NOT NULL, -- e.g., "details", "reviews", "faq", "custom"
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_required BOOLEAN DEFAULT false, -- Required tabs cannot be disabled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tabs_key ON product_tabs(tab_key);
CREATE INDEX idx_tabs_active ON product_tabs(is_active);
CREATE INDEX idx_tabs_order ON product_tabs(display_order);

-- Enable RLS
ALTER TABLE product_tabs ENABLE ROW LEVEL SECURITY;

-- Public can view active tabs
CREATE POLICY "Public can view active product tabs"
    ON product_tabs
    FOR SELECT
    TO public
    USING (is_active = true);

-- Authenticated users can view all tabs (for admin)
CREATE POLICY "Authenticated can view all product tabs"
    ON product_tabs
    FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can insert/update/delete (admin check in frontend)
CREATE POLICY "Authenticated can manage product tabs"
    ON product_tabs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert default tabs
INSERT INTO product_tabs (tab_key, display_name, component_type, display_order, is_active, is_required) VALUES
    ('details', 'Product Details', 'details', 1, true, true),
    ('reviews', 'Rating & Reviews', 'reviews', 2, true, false),
    ('faq', 'FAQs', 'faq', 3, true, false)
ON CONFLICT (tab_key) DO NOTHING;
