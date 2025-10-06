export type UserRole = 'student' | 'graduate' | 'mentor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correct_answer: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  subject: string;
  score: number;
  total_questions: number;
  answers: Record<string, string>;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  domain: string;
}

export interface Job {
  id: string;
  title: string;
  required_skills: string[];
  description: string;
}

export interface Certification {
  id: string;
  title: string;
  platform: string;
  url: string;
  skill_tags: string[];
}

export interface Internship {
  id: string;
  title: string;
  platform: string;
  url: string;
  job_role: string;
  required_skills: string[];
}

export interface GraduateProfile {
  id: string;
  user_id: string;
  resume_text: string | null;
  extracted_skills: string[];
  job_matches: any[];
  created_at: string;
  updated_at: string;
}

export interface MentorFeedback {
  id: string;
  graduate_id: string;
  mentor_id: string;
  feedback: string;
  score: number;
  created_at: string;
}
