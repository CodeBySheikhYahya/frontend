-- ============================================
-- ADD SIZE CHART COLUMNS TO PRODUCTS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Add size_chart_image_url column (stores the URL of uploaded chart image)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS size_chart_image_url TEXT;

-- Add size_type column (clothing = needs chart, shoes = numbers only, bags = needs chart)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS size_type VARCHAR(20) CHECK (size_type IN ('clothing', 'shoes', 'bags'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_size_type ON products(size_type);

-- Add comment for documentation
COMMENT ON COLUMN products.size_chart_image_url IS 'URL of size chart image (for clothing and bags)';
COMMENT ON COLUMN products.size_type IS 'Type of sizing: clothing (needs chart), shoes (numbers only), bags (needs chart)';
