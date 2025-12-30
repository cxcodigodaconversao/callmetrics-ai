-- Add project_name and team_name columns to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS project_name text;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS team_name text;

-- Create indexes for filtering in metrics
CREATE INDEX IF NOT EXISTS idx_videos_project_name ON videos(project_name);
CREATE INDEX IF NOT EXISTS idx_videos_team_name ON videos(team_name);