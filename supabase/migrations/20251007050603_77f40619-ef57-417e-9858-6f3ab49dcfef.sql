-- ============================================
-- COMPREHENSIVE SECURITY MIGRATION (Fixed)
-- ============================================

-- 1. Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'graduate', 'mentor', 'admin');

-- 2. Create user_roles table (separate from users to prevent privilege escalation)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Create function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- 5. Create profiles table for additional user data (linked to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'User'), new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Drop old insecure password column from users table (keep role temporarily)
ALTER TABLE public.users DROP COLUMN IF EXISTS password;

-- ============================================
-- SECURE RLS POLICIES
-- ============================================

-- Drop all old public policies
DROP POLICY IF EXISTS "Public read users" ON public.users;
DROP POLICY IF EXISTS "Public insert users" ON public.users;
DROP POLICY IF EXISTS "Public update users" ON public.users;
DROP POLICY IF EXISTS "Public read quiz_questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Public insert quiz_results" ON public.quiz_results;
DROP POLICY IF EXISTS "Public read quiz_results" ON public.quiz_results;
DROP POLICY IF EXISTS "Public read skills" ON public.skills;
DROP POLICY IF EXISTS "Public insert skills" ON public.skills;
DROP POLICY IF EXISTS "Public update skills" ON public.skills;
DROP POLICY IF EXISTS "Public delete skills" ON public.skills;
DROP POLICY IF EXISTS "Public read jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public delete jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public read certifications" ON public.certifications;
DROP POLICY IF EXISTS "Public insert certifications" ON public.certifications;
DROP POLICY IF EXISTS "Public update certifications" ON public.certifications;
DROP POLICY IF EXISTS "Public delete certifications" ON public.certifications;
DROP POLICY IF EXISTS "Public read internships" ON public.internships;
DROP POLICY IF EXISTS "Public insert internships" ON public.internships;
DROP POLICY IF EXISTS "Public update internships" ON public.internships;
DROP POLICY IF EXISTS "Public delete internships" ON public.internships;
DROP POLICY IF EXISTS "Public read graduate_profiles" ON public.graduate_profiles;
DROP POLICY IF EXISTS "Public insert graduate_profiles" ON public.graduate_profiles;
DROP POLICY IF EXISTS "Public update graduate_profiles" ON public.graduate_profiles;
DROP POLICY IF EXISTS "Public read mentor_feedback" ON public.mentor_feedback;
DROP POLICY IF EXISTS "Public insert mentor_feedback" ON public.mentor_feedback;

-- PROFILES TABLE POLICIES
CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- USER_ROLES TABLE POLICIES
CREATE POLICY "Users view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- USERS TABLE POLICIES (keep for now, will be deprecated)
CREATE POLICY "Authenticated users read all users"
  ON public.users FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage users"
  ON public.users FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- QUIZ QUESTIONS POLICIES
CREATE POLICY "Everyone reads quiz questions"
  ON public.quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "Admins manage quiz questions"
  ON public.quiz_questions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- QUIZ RESULTS POLICIES
CREATE POLICY "Users view own quiz results"
  ON public.quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own quiz results"
  ON public.quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all quiz results"
  ON public.quiz_results FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- GRADUATE PROFILES POLICIES
CREATE POLICY "Graduates manage own profile"
  ON public.graduate_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Mentors view graduate profiles"
  ON public.graduate_profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'mentor'));

CREATE POLICY "Admins manage graduate profiles"
  ON public.graduate_profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- MENTOR FEEDBACK POLICIES
CREATE POLICY "Mentors create feedback"
  ON public.mentor_feedback FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'mentor') AND auth.uid() = mentor_id);

CREATE POLICY "View own feedback"
  ON public.mentor_feedback FOR SELECT
  USING (auth.uid() = mentor_id OR auth.uid() = graduate_id);

CREATE POLICY "Admins view all feedback"
  ON public.mentor_feedback FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- REFERENCE DATA POLICIES (Skills, Jobs, Certifications, Internships)
-- Public read, admin-only write
CREATE POLICY "Everyone reads skills"
  ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admins manage skills"
  ON public.skills FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone reads jobs"
  ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Admins manage jobs"
  ON public.jobs FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone reads certifications"
  ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Admins manage certifications"
  ON public.certifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone reads internships"
  ON public.internships FOR SELECT USING (true);
CREATE POLICY "Admins manage internships"
  ON public.internships FOR ALL USING (public.has_role(auth.uid(), 'admin'));