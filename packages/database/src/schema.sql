-- Homeschool AI Database Schema
-- Privacy-first, COPPA/FERPA compliant design

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Families table
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_email TEXT NOT NULL UNIQUE,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'family', 'coop')),
  state TEXT, -- For compliance tracking (e.g., 'VA', 'CA')
  privacy_mode TEXT NOT NULL DEFAULT 'local_only' CHECK (privacy_mode IN ('local_only', 'cloud_sync')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Students table (minimal PII)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL, -- First name only, privacy-first
  age INTEGER NOT NULL CHECK (age >= 3 AND age <= 18),
  grade_level INTEGER NOT NULL CHECK (grade_level >= 0 AND grade_level <= 12), -- 0 = PreK
  learning_preferences JSONB DEFAULT '{"visual": 0.33, "audio": 0.33, "text": 0.34}',
  avatar_color TEXT DEFAULT '#3B82F6', -- Instead of photos
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Learning sessions (individual learning activities)
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL, -- Reference to curriculum (e.g., 'math-g3-add-1')
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,
  accuracy DECIMAL(3,2) CHECK (accuracy >= 0 AND accuracy <= 1), -- 0.0 to 1.0
  problems_attempted INTEGER DEFAULT 0,
  problems_correct INTEGER DEFAULT 0,
  struggle_detected BOOLEAN DEFAULT FALSE,
  ai_hints_used INTEGER DEFAULT 0,
  session_data JSONB, -- Store detailed problem-by-problem data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Progress nodes (knowledge graph - what student knows)
CREATE TABLE progress_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  concept TEXT NOT NULL, -- e.g., 'addition_single_digit', 'fractions_equivalent'
  subject TEXT NOT NULL,
  mastery_level DECIMAL(3,2) NOT NULL DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 1),
  last_practiced TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_attempts INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  difficulty_level DECIMAL(3,2) DEFAULT 0.5 CHECK (difficulty_level >= 0 AND difficulty_level <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, concept)
);

-- Compliance tracking (state-specific requirements)
CREATE TABLE compliance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subjects_studied TEXT[], -- Array of subjects: ['math', 'reading', 'science']
  total_minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, log_date)
);

-- AI interactions log (for improving tutor, privacy-aware)
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('hint', 'explanation', 'feedback', 'question')),
  context JSONB, -- Problem context (anonymized)
  ai_response TEXT,
  was_helpful BOOLEAN, -- Student/parent feedback
  model_used TEXT, -- 'local-llama-3.2-1b' or 'bedrock-claude-haiku'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_students_family ON students(family_id);
CREATE INDEX idx_sessions_student ON learning_sessions(student_id);
CREATE INDEX idx_sessions_completed ON learning_sessions(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_progress_student ON progress_nodes(student_id);
CREATE INDEX idx_progress_concept ON progress_nodes(concept);
CREATE INDEX idx_compliance_student_date ON compliance_logs(student_id, log_date);

-- Row Level Security (RLS) - Privacy enforcement
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own family's data
CREATE POLICY "Users can view own family"
  ON families FOR SELECT
  USING (auth.jwt() ->> 'email' = parent_email);

CREATE POLICY "Users can update own family"
  ON families FOR UPDATE
  USING (auth.jwt() ->> 'email' = parent_email);

CREATE POLICY "Users can view own students"
  ON students FOR SELECT
  USING (family_id IN (SELECT id FROM families WHERE parent_email = auth.jwt() ->> 'email'));

CREATE POLICY "Users can manage own students"
  ON students FOR ALL
  USING (family_id IN (SELECT id FROM families WHERE parent_email = auth.jwt() ->> 'email'));

CREATE POLICY "Users can view own sessions"
  ON learning_sessions FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE family_id IN (
      SELECT id FROM families WHERE parent_email = auth.jwt() ->> 'email'
    )
  ));

CREATE POLICY "Users can manage own sessions"
  ON learning_sessions FOR ALL
  USING (student_id IN (
    SELECT id FROM students WHERE family_id IN (
      SELECT id FROM families WHERE parent_email = auth.jwt() ->> 'email'
    )
  ));

CREATE POLICY "Users can view own progress"
  ON progress_nodes FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE family_id IN (
      SELECT id FROM families WHERE parent_email = auth.jwt() ->> 'email'
    )
  ));

CREATE POLICY "Users can manage own progress"
  ON progress_nodes FOR ALL
  USING (student_id IN (
    SELECT id FROM students WHERE family_id IN (
      SELECT id FROM families WHERE parent_email = auth.jwt() ->> 'email'
    )
  ));

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate daily compliance
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
    notes = COALESCE(EXCLUDED.notes, compliance_logs.notes)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View: Family learning summary (for parent dashboard)
CREATE VIEW family_learning_summary AS
SELECT
  s.family_id,
  s.id AS student_id,
  s.first_name,
  s.grade_level,
  COUNT(DISTINCT ls.id) AS total_sessions,
  SUM(ls.time_spent_seconds) / 3600.0 AS total_hours,
  AVG(ls.accuracy) AS avg_accuracy,
  COUNT(DISTINCT DATE(ls.completed_at)) AS days_active,
  MAX(ls.completed_at) AS last_activity
FROM students s
LEFT JOIN learning_sessions ls ON s.id = ls.student_id AND ls.completed_at IS NOT NULL
GROUP BY s.family_id, s.id, s.first_name, s.grade_level;

-- View: Student mastery overview
CREATE VIEW student_mastery_overview AS
SELECT
  s.id AS student_id,
  s.first_name,
  pn.subject,
  COUNT(pn.id) AS concepts_tracked,
  AVG(pn.mastery_level) AS avg_mastery,
  COUNT(CASE WHEN pn.mastery_level >= 0.8 THEN 1 END) AS concepts_mastered,
  COUNT(CASE WHEN pn.mastery_level < 0.5 THEN 1 END) AS concepts_struggling
FROM students s
LEFT JOIN progress_nodes pn ON s.id = pn.student_id
GROUP BY s.id, s.first_name, pn.subject;
