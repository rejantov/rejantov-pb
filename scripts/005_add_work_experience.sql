-- Create work_experience table (referenced by the experience portfolio section)
CREATE TABLE IF NOT EXISTS work_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for work_experience" ON work_experience
  FOR SELECT USING (true);

CREATE POLICY "Authenticated manage work_experience" ON work_experience
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

GRANT SELECT ON TABLE work_experience TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE work_experience TO authenticated;
