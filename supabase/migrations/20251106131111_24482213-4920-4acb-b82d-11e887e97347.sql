-- Fix avatars storage RLS: switch to userId folder checks
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own avatars (by folder)" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own avatars (by folder)" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own avatars (by folder)" ON storage.objects;
END $$;

CREATE POLICY "Users can upload their own avatars (by folder)"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatars (by folder)"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatars (by folder)"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);