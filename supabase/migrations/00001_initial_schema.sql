-- Homeschool AI Platform - Initial Database Schema
-- This migration creates all necessary tables, RLS policies, and functions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- FAMILIES TABLE
-- ==============================================
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_email TEXT UNIQUE NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'family', 'coop')),
  state TEXT, -- US state for compliance requirements
  privacy_mode TEXT NOT NULL DEFAULT 'cloud_sync' CHECK (privacy_mode IN ('local_only', 'cloud_sync')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- STUDENTS TABLE
-- ==============================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL, -- First name only (privacy)
  age INTEGER NOT NULL CHECK (age >= 4 AND age <= 18),
  grade_level INTEGER NOT NULL CHECK (grade_level >= 0 AND grade_level <= 12), -- 0 = kindergarten
  learning_preferences JSONB DEFAULT '{"visual": 0.5, "audio": 0.5, "text": 0.5}'::jsonb,
  avatar_color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- LEARNING SESSIONS TABLE
-- ==============================================
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL, -- References curriculum YAML lesson ID
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,
  accuracy DECIMAL(3,2), -- 0.00 to 1.00
  problems_attempted INTEGER DEFAULT 0,
  problems_correct INTEGER DEFAULT 0,
  struggle_detected BOOLEAN DEFAULT false,
  ai_hints_used INTEGER DEFAULT 0,
  session_data JSONB, -- Flexible storage for additional metrics
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_sessions_student ON learning_sessions(student_id);
CREATE INDEX idx_learning_sessions_lesson ON learning_sessions(lesson_id);
CREATE INDEX idx_learning_sessions_started ON learning_sessions(started_at);

-- ==============================================
-- PROGRESS NODES TABLE
-- ==============================================
CREATE TABLE progress_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  concept TEXT NOT NULL, -- e.g., "addition_single_digit"
  subject TEXT NOT NULL,
  mastery_level DECIMAL(3,2) NOT NULL DEFAULT 0.0 CHECK (mastery_level >= 0 AND mastery_level <= 1), -- 0.00 to 1.00
  last_practiced TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_attempts INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  difficulty_level DECIMAL(3,2) DEFAULT 0.5, -- Adaptive difficulty
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, concept)
);

CREATE INDEX idx_progress_nodes_student ON progress_nodes(student_id);
CREATE INDEX idx_progress_nodes_concept ON progress_nodes(concept);

-- ==============================================
-- COMPLIANCE LOGS TABLE
-- ==============================================
CREATE TABLE compliance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  subjects_studied TEXT[] NOT NULL,
  total_minutes INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, log_date)
);

CREATE INDEX idx_compliance_logs_student ON compliance_logs(student_id);
CREATE INDEX idx_compliance_logs_date ON compliance_logs(log_date);

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_logs ENABLE ROW LEVEL SECURITY;

-- Families: Users can only access their own family
CREATE POLICY "Users can view own family"
  ON families FOR SELECT
  USING (auth.uid()::text = parent_email);

CREATE POLICY "Users can update own family"
  ON families FOR UPDATE
  USING (auth.uid()::text = parent_email);

CREATE POLICY "Users can insert own family"
  ON families FOR INSERT
  WITH CHECK (auth.uid()::text = parent_email);

-- Students: Users can only access students in their family
CREATE POLICY "Users can view own students"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = students.family_id
      AND families.parent_email = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own students"
  ON students FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = students.family_id
      AND families.parent_email = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own students"
  ON students FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = students.family_id
      AND families.parent_email = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own students"
  ON students FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM families
      WHERE families.id = students.family_id
      AND families.parent_email = auth.uid()::text
    )
  );

-- Learning Sessions: Users can only access sessions for their students
CREATE POLICY "Users can view own learning sessions"
  ON learning_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      JOIN families ON students.family_id = families.id
      WHERE students.id = learning_sessions.student_id
      AND families.parent_email = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own learning sessions"
  ON learning_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      JOIN families ON students.family_id = families.id
      WHERE students.id = learning_sessions.student_id
      AND families.parent_email = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own learning sessions"
  ON learning_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM students
      JOIN families ON students.family_id = families.id
      WHERE students.id = learning_sessions.student_id
      AND families.parent_email = auth.uid()::text
    )
  );

-- Progress Nodes: Users can only access progress for their students
CREATE POLICY "Users can view own progress nodes"
  ON progress_nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      JOIN families ON students.family_id = families.id
      WHERE students.id = progress_nodes.student_id
      AND families.parent_email = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own progress nodes"
  ON progress_nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      JOIN families ON students.family_id = families.id
      WHERE students.id = progress_nodes.student_id
      AND families.parent_email = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own progress nodes"
  ON progress_nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM students
      JOIN families ON students.family_id = families.id
      WHERE students.id = progress_nodes.student_id
      AND families.parent_email = auth.uid()::text
    )
  );

-- Compliance Logs: Users can only access logs for their students
CREATE POLICY "Users can view own compliance logs"
  ON compliance_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      JOIN families ON students.family_id = families.id
      WHERE students.id = compliance_logs.student_id
      AND families.parent_email = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own compliance logs"
  ON compliance_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      JOIN families ON students.family_id = families.id
      WHERE students.id = compliance_logs.student_id
      AND families.parent_email = auth.uid()::text
    )
  );

-- ==============================================
-- FUNCTIONS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_nodes_updated_at BEFORE UPDATE ON progress_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log daily compliance
CREATE OR REPLACE FUNCTION log_daily_compliance(
  p_student_id UUID,
  p_subjects TEXT[],
  p_minutes INTEGER,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO compliance_logs (student_id, log_date, subjects_studied, total_minutes, notes)
  VALUES (p_student_id, CURRENT_DATE, p_subjects, p_minutes, p_notes)
  ON CONFLICT (student_id, log_date)
  DO UPDATE SET
    subjects_studied = array(SELECT DISTINCT unnest(compliance_logs.subjects_studied || EXCLUDED.subjects_studied)),
    total_minutes = compliance_logs.total_minutes + EXCLUDED.total_minutes,
    notes = CASE
      WHEN EXCLUDED.notes IS NOT NULL THEN COALESCE(compliance_logs.notes, '') || E'\n' || EXCLUDED.notes
      ELSE compliance_logs.notes
    END
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- VIEWS
-- ==============================================

-- View: Family Learning Summary
CREATE OR REPLACE VIEW family_learning_summary AS
SELECT
  f.id AS family_id,
  f.parent_email,
  COUNT(DISTINCT s.id) AS total_students,
  COUNT(ls.id) AS total_sessions,
  SUM(ls.time_spent_seconds) / 3600 AS total_hours,
  AVG(ls.accuracy) AS avg_accuracy
FROM families f
LEFT JOIN students s ON s.family_id = f.id
LEFT JOIN learning_sessions ls ON ls.student_id = s.id
GROUP BY f.id, f.parent_email;

-- View: Student Mastery Overview
CREATE OR REPLACE VIEW student_mastery_overview AS
SELECT
  s.id AS student_id,
  s.first_name,
  s.grade_level,
  pn.subject,
  COUNT(pn.id) AS concepts_tracked,
  AVG(pn.mastery_level) AS avg_mastery,
  SUM(CASE WHEN pn.mastery_level >= 0.8 THEN 1 ELSE 0 END) AS mastered_concepts
FROM students s
LEFT JOIN progress_nodes pn ON pn.student_id = s.id
GROUP BY s.id, s.first_name, s.grade_level, pn.subject;

-- Grant access to authenticated users
GRANT SELECT ON family_learning_summary TO authenticated;
GRANT SELECT ON student_mastery_overview TO authenticated;
