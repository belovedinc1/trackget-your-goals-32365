-- Make avatars bucket private for better security
UPDATE storage.buckets 
SET public = false 
WHERE id = 'avatars';

-- Add file size and type restrictions to avatars bucket
UPDATE storage.buckets 
SET file_size_limit = 2097152, -- 2MB limit
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
WHERE id = 'avatars';

-- Add file size and type restrictions to receipts bucket  
UPDATE storage.buckets 
SET file_size_limit = 5242880, -- 5MB limit
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
WHERE id = 'receipts';