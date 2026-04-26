-- Add the site accent colour preference to site_stats
-- Run this after 009_currently_text_stats.sql (which added the text_value column)
INSERT INTO site_stats (key, text_value) VALUES ('site_accent', 'purple')
ON CONFLICT (key) DO NOTHING;
