-- Site stats table for tracking page opens
CREATE TABLE IF NOT EXISTS site_stats (
  key TEXT PRIMARY KEY,
  value BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_stats (key, value) VALUES ('blog_opens', 0) ON CONFLICT DO NOTHING;

ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read stats" ON site_stats FOR SELECT USING (true);

-- Atomic increment function callable by anon
CREATE OR REPLACE FUNCTION increment_stat(stat_key TEXT)
RETURNS BIGINT AS $$
  INSERT INTO site_stats (key, value, updated_at)
  VALUES (stat_key, 1, NOW())
  ON CONFLICT (key) DO UPDATE SET value = site_stats.value + 1, updated_at = NOW()
  RETURNING value;
$$ LANGUAGE SQL SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_stat(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION increment_stat(TEXT) TO authenticated;

-- Add likes column to blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Atomic like / unlike functions
CREATE OR REPLACE FUNCTION increment_post_likes(p_post_id UUID)
RETURNS INTEGER AS $$
DECLARE new_val INTEGER;
BEGIN
  UPDATE blog_posts SET likes = COALESCE(likes, 0) + 1 WHERE id = p_post_id
  RETURNING likes INTO new_val;
  RETURN new_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_likes(p_post_id UUID)
RETURNS INTEGER AS $$
DECLARE new_val INTEGER;
BEGIN
  UPDATE blog_posts SET likes = GREATEST(0, COALESCE(likes, 0) - 1) WHERE id = p_post_id
  RETURNING likes INTO new_val;
  RETURN new_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_likes(UUID) TO anon;
GRANT EXECUTE ON FUNCTION decrement_post_likes(UUID) TO authenticated;
