-- Add text_value column to site_stats for non-numeric values (e.g. "currently" sidebar)
ALTER TABLE site_stats ADD COLUMN IF NOT EXISTS text_value TEXT;

-- Allow authenticated admins to upsert stats
DROP POLICY IF EXISTS "Authenticated write stats" ON site_stats;
CREATE POLICY "Authenticated write stats" ON site_stats
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default "currently" entries (will not overwrite existing ones)
INSERT INTO site_stats (key, text_value) VALUES
  ('currently_playing',   'League (ofc)'),
  ('currently_reading',   'TBD'),
  ('currently_listening', 'Lo-fi'),
  ('currently_mood',      'vibing')
ON CONFLICT (key) DO NOTHING;
