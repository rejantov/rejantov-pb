-- Add categories array to blog posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';
