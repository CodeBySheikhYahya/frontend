-- ============================================
-- STORAGE POLICIES FOR size-charts BUCKET
-- Allow authenticated users to upload, update, delete
-- Allow public to view (read) size charts
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Public can view size charts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload size charts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update size charts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete size charts" ON storage.objects;

-- Public can view (read) size charts
CREATE POLICY "Public can view size charts"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'size-charts');

-- Authenticated users can upload size charts
CREATE POLICY "Authenticated can upload size charts"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'size-charts');

-- Authenticated users can update size charts
CREATE POLICY "Authenticated can update size charts"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'size-charts')
    WITH CHECK (bucket_id = 'size-charts');

-- Authenticated users can delete size charts
CREATE POLICY "Authenticated can delete size charts"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'size-charts');
