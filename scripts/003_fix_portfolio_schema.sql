-- Portfolio schema fixes for admin editing
-- Run this in Supabase SQL Editor after 001_create_tables.sql

-- Make sure the profile table matches the current admin UI.
ALTER TABLE profile ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS email TEXT;

-- The avatar field is no longer used by the app.
ALTER TABLE profile DROP COLUMN IF EXISTS avatar_url;

-- Ensure the API roles can access these tables once RLS allows it.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE projects, education, social_links, profile, blog_posts, blog_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE projects, education, social_links, profile, blog_posts, blog_media TO authenticated;

-- Rebuild policies explicitly so inserts/updates work cleanly.
DROP POLICY IF EXISTS "Public read access for projects" ON projects;
DROP POLICY IF EXISTS "Public read access for education" ON education;
DROP POLICY IF EXISTS "Public read access for social_links" ON social_links;
DROP POLICY IF EXISTS "Public read access for profile" ON profile;
DROP POLICY IF EXISTS "Public read access for published posts" ON blog_posts;
DROP POLICY IF EXISTS "Public read access for blog_media" ON blog_media;

DROP POLICY IF EXISTS "Admin full access projects" ON projects;
DROP POLICY IF EXISTS "Admin full access education" ON education;
DROP POLICY IF EXISTS "Admin full access social_links" ON social_links;
DROP POLICY IF EXISTS "Admin full access profile" ON profile;
DROP POLICY IF EXISTS "Admin full access blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin full access blog_media" ON blog_media;

CREATE POLICY "Public read access for projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Public read access for education" ON education
  FOR SELECT USING (true);

CREATE POLICY "Public read access for social_links" ON social_links
  FOR SELECT USING (true);

CREATE POLICY "Public read access for profile" ON profile
  FOR SELECT USING (true);

CREATE POLICY "Public read access for published posts" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Public read access for blog_media" ON blog_media
  FOR SELECT USING (true);

CREATE POLICY "Authenticated manage projects" ON projects
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated manage education" ON education
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated manage social_links" ON social_links
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated manage profile" ON profile
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated manage blog_posts" ON blog_posts
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated manage blog_media" ON blog_media
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
