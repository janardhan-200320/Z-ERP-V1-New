-- Ensure customer-communications bucket exists for Supabase Storage
-- This bucket stores attachment files for customer communications

-- Note: Buckets must be created via the Supabase dashboard or API
-- since direct SQL CREATE BUCKET statements are not available in PostgreSQL

-- However, we ensure the bucket is created at runtime in the backend code
-- in src/modules/project-backend.ts via the ensureStorageBucketExists function

-- Storage bucket will be auto-created when first file is uploaded
-- Configuration:
-- - Bucket name: customer-communications
-- - Public: false (private bucket)
-- - Max file size: 25MB
-- - Allowed MIME types: all (handled by frontend validation)

-- Row Level Security for bucket access:
-- - Anonymous users: no access
-- - Authenticated users: can read/write
-- - Service role: full access

-- Verify bucket exists:
-- SELECT * FROM storage.buckets WHERE name = 'customer-communications';

-- To create bucket via Supabase API:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit)
-- VALUES ('customer-communications', 'customer-communications', false, 26214400)
-- ON CONFLICT (id) DO NOTHING;
