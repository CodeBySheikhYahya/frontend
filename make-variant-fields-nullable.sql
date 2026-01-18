-- Make color_id and size_id nullable in product_variants table
-- This allows variants to use dynamic attributes instead of fixed color/size

ALTER TABLE product_variants 
  ALTER COLUMN color_id DROP NOT NULL,
  ALTER COLUMN size_id DROP NOT NULL;

-- Add a check constraint to ensure at least one identification method exists
-- Either color_id+size_id (legacy) OR dynamic attributes (via product_variant_attributes)
-- Note: This constraint is optional, but helps ensure data integrity

-- Optional: Add comment to document the change
COMMENT ON COLUMN product_variants.color_id IS 'Legacy field - can be null when using dynamic attributes';
COMMENT ON COLUMN product_variants.size_id IS 'Legacy field - can be null when using dynamic attributes';
