-- GMAT Hub Database Schema
-- Run this in Supabase Dashboard → SQL Editor

-- ============================================================
-- SECTIONS (Math, Verbal, Data Insights)
-- ============================================================
CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,       -- 'math' | 'verbal' | 'di'
  title TEXT NOT NULL,
  description TEXT,
  order_idx INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TOPICS (each card on a page)
-- ============================================================
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  section_id INT REFERENCES sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  order_idx INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EQUATIONS (Key Concepts tab)
-- ============================================================
CREATE TABLE IF NOT EXISTS equations (
  id SERIAL PRIMARY KEY,
  topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  formula TEXT,                    -- LaTeX string ($$...$$)
  note TEXT,
  detail TEXT,                     -- HTML string with structured detail
  order_idx INT DEFAULT 0
);

-- ============================================================
-- RULES (Rules tab)
-- ============================================================
CREATE TABLE IF NOT EXISTS rules (
  id SERIAL PRIMARY KEY,
  topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_idx INT DEFAULT 0
);

-- ============================================================
-- METHODS (Key Methods tab)
-- ============================================================
CREATE TABLE IF NOT EXISTS methods (
  id SERIAL PRIMARY KEY,
  topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  when_to_use TEXT,
  steps JSONB DEFAULT '[]',        -- array of step strings
  tip TEXT,
  order_idx INT DEFAULT 0
);

-- ============================================================
-- QUESTIONS (Typical Questions tab — 2-layer expand)
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
  subtype TEXT NOT NULL,           -- e.g. "Rate-Time: Catch-Up Problem"
  q_text TEXT NOT NULL,            -- full question with (A)-(E) choices
  question_type TEXT,              -- what GMAT tests (1 sentence)
  signals TEXT,                    -- what in the question tells you the approach
  trap TEXT,                       -- common wrong answer & why
  method TEXT,                     -- which method/rule to reach for
  steps JSONB DEFAULT '[]',        -- array of step strings
  difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy','Medium','Hard')),
  order_idx INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRACTICE ITEMS (Practice tab)
-- ============================================================
CREATE TABLE IF NOT EXISTS practice_items (
  id SERIAL PRIMARY KEY,
  topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT,              -- e.g. 'Computation', 'DS-style', 'Word Problem'
  answer TEXT,
  order_idx INT DEFAULT 0
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_topics_section ON topics(section_id, order_idx);
CREATE INDEX IF NOT EXISTS idx_equations_topic ON equations(topic_id, order_idx);
CREATE INDEX IF NOT EXISTS idx_rules_topic ON rules(topic_id, order_idx);
CREATE INDEX IF NOT EXISTS idx_methods_topic ON methods(topic_id, order_idx);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id, order_idx);
CREATE INDEX IF NOT EXISTS idx_practice_topic ON practice_items(topic_id, order_idx);

-- ============================================================
-- SEED SECTIONS
-- ============================================================
INSERT INTO sections (slug, title, description, order_idx) VALUES
  ('math',   'Math / Quantitative', 'Arithmetic, Algebra, Geometry, Statistics, and Word Problems', 1),
  ('verbal', 'Verbal',              'Critical Reasoning and Reading Comprehension', 2),
  ('di',     'Data Insights',       'Data Sufficiency, Multi-Source Reasoning, Table Analysis, Graphics, Two-Part', 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- RLS: Allow public read, service role write
-- ============================================================
ALTER TABLE sections      ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics        ENABLE ROW LEVEL SECURITY;
ALTER TABLE equations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE methods       ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_items ENABLE ROW LEVEL SECURITY;

-- Public read access (anon key can SELECT)
CREATE POLICY "public_read_sections"       ON sections       FOR SELECT USING (true);
CREATE POLICY "public_read_topics"         ON topics         FOR SELECT USING (true);
CREATE POLICY "public_read_equations"      ON equations      FOR SELECT USING (true);
CREATE POLICY "public_read_rules"          ON rules          FOR SELECT USING (true);
CREATE POLICY "public_read_methods"        ON methods        FOR SELECT USING (true);
CREATE POLICY "public_read_questions"      ON questions      FOR SELECT USING (true);
CREATE POLICY "public_read_practice"       ON practice_items FOR SELECT USING (true);

-- Service role bypasses RLS automatically (no extra policy needed)
