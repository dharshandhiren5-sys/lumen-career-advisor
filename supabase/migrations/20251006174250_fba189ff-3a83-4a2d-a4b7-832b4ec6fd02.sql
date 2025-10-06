-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('student', 'graduate', 'mentor', 'admin');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quiz results table
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create skills taxonomy table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create jobs ontology table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT UNIQUE NOT NULL,
  required_skills TEXT[] NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create certifications table
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  url TEXT,
  skill_tags TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create internships table
CREATE TABLE internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  url TEXT,
  job_role TEXT NOT NULL,
  required_skills TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create graduate profiles table
CREATE TABLE graduate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resume_text TEXT,
  extracted_skills TEXT[] DEFAULT '{}',
  job_matches JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create mentor feedback table
CREATE TABLE mentor_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  graduate_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert sample admin user (dharshandhiren@gmail.com / 12345678)
INSERT INTO users (email, password, name, role) VALUES
('dharshandhiren@gmail.com', '12345678', 'Admin User', 'admin');

-- Insert sample skills
INSERT INTO skills (name, domain) VALUES
('Python', 'Programming'),
('SQL', 'Database'),
('Java', 'Programming'),
('React', 'Frontend'),
('Node.js', 'Backend'),
('AWS', 'Cloud'),
('Cybersecurity', 'Security'),
('Machine Learning', 'AI'),
('Statistics', 'Data Science'),
('HTML', 'Frontend'),
('CSS', 'Frontend'),
('Communication', 'Soft Skills'),
('Problem Solving', 'Soft Skills'),
('Git', 'Version Control'),
('Cloud Basics', 'Cloud');

-- Insert sample jobs
INSERT INTO jobs (title, required_skills, description) VALUES
('Data Analyst', ARRAY['Python', 'SQL', 'Statistics'], 'Analyze data and generate insights'),
('Full Stack Developer', ARRAY['React', 'Node.js', 'HTML', 'CSS', 'Git'], 'Build web applications'),
('Cloud Engineer', ARRAY['AWS', 'Cloud Basics', 'Python'], 'Manage cloud infrastructure'),
('Cybersecurity Analyst', ARRAY['Cybersecurity', 'Problem Solving'], 'Protect systems from threats'),
('ML Engineer', ARRAY['Python', 'Machine Learning', 'Statistics'], 'Build AI models');

-- Insert sample certifications
INSERT INTO certifications (title, platform, url, skill_tags) VALUES
('Python for Data Science', 'Coursera', 'https://coursera.org/python-ds', ARRAY['Python', 'Statistics']),
('AWS Cloud Practitioner', 'Coursera', 'https://coursera.org/aws', ARRAY['AWS', 'Cloud Basics']),
('Full Stack Development', 'Udemy', 'https://udemy.com/fullstack', ARRAY['React', 'Node.js']),
('Machine Learning Basics', 'NPTEL', 'https://nptel.ac.in/ml', ARRAY['Machine Learning', 'Python']),
('Cybersecurity Fundamentals', 'Coursera', 'https://coursera.org/security', ARRAY['Cybersecurity']);

-- Insert sample internships
INSERT INTO internships (title, platform, url, job_role, required_skills) VALUES
('Data Analysis Intern', 'LinkedIn', 'https://linkedin.com/jobs/1', 'Data Analyst', ARRAY['Python', 'SQL']),
('Web Development Intern', 'Internshala', 'https://internshala.com/jobs/2', 'Full Stack Developer', ARRAY['React', 'Node.js']),
('Cloud Computing Intern', 'Naukri', 'https://naukri.com/jobs/3', 'Cloud Engineer', ARRAY['AWS', 'Cloud Basics']),
('Security Analyst Intern', 'LinkedIn', 'https://linkedin.com/jobs/4', 'Cybersecurity Analyst', ARRAY['Cybersecurity']),
('AI Research Intern', 'Internshala', 'https://internshala.com/jobs/5', 'ML Engineer', ARRAY['Machine Learning', 'Python']);

-- Insert sample quiz questions
INSERT INTO quiz_questions (subject, question, options, correct_answer) VALUES
('Physics', 'What is the SI unit of force?', '["Newton", "Joule", "Watt", "Pascal"]', 'Newton'),
('Physics', 'What is the speed of light?', '["3×10^8 m/s", "3×10^6 m/s", "3×10^10 m/s", "3×10^7 m/s"]', '3×10^8 m/s'),
('Chemistry', 'What is the atomic number of Carbon?', '["6", "12", "8", "14"]', '6'),
('Chemistry', 'What is H2O?', '["Water", "Hydrogen", "Oxygen", "Peroxide"]', 'Water'),
('Biology', 'What is the powerhouse of the cell?', '["Mitochondria", "Nucleus", "Ribosome", "Chloroplast"]', 'Mitochondria'),
('Maths', 'What is 15 × 8?', '["120", "125", "115", "130"]', '120'),
('Computer Science', 'What does CPU stand for?', '["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Central Processor Universal"]', 'Central Processing Unit');

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access since we're not using Supabase auth)
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Public insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update users" ON users FOR UPDATE USING (true);

CREATE POLICY "Public read quiz_questions" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "Public read quiz_results" ON quiz_results FOR SELECT USING (true);
CREATE POLICY "Public insert quiz_results" ON quiz_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public insert skills" ON skills FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update skills" ON skills FOR UPDATE USING (true);
CREATE POLICY "Public delete skills" ON skills FOR DELETE USING (true);

CREATE POLICY "Public read jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Public insert jobs" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update jobs" ON jobs FOR UPDATE USING (true);
CREATE POLICY "Public delete jobs" ON jobs FOR DELETE USING (true);

CREATE POLICY "Public read certifications" ON certifications FOR SELECT USING (true);
CREATE POLICY "Public insert certifications" ON certifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update certifications" ON certifications FOR UPDATE USING (true);
CREATE POLICY "Public delete certifications" ON certifications FOR DELETE USING (true);

CREATE POLICY "Public read internships" ON internships FOR SELECT USING (true);
CREATE POLICY "Public insert internships" ON internships FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update internships" ON internships FOR UPDATE USING (true);
CREATE POLICY "Public delete internships" ON internships FOR DELETE USING (true);

CREATE POLICY "Public read graduate_profiles" ON graduate_profiles FOR SELECT USING (true);
CREATE POLICY "Public insert graduate_profiles" ON graduate_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update graduate_profiles" ON graduate_profiles FOR UPDATE USING (true);

CREATE POLICY "Public read mentor_feedback" ON mentor_feedback FOR SELECT USING (true);
CREATE POLICY "Public insert mentor_feedback" ON mentor_feedback FOR INSERT WITH CHECK (true);