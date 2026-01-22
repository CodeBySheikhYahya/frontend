-- ============================================
-- RLS POLICIES FOR ORDER UPDATES
-- Matches your existing pattern: authenticated users can update
-- Admin check is done in frontend (like categories and product attributes)
-- ============================================

-- Allow authenticated users to update orders
-- Admin check is handled in frontend (same pattern as categories and product attributes)
CREATE POLICY "Authenticated users can update orders"
    ON orders
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
