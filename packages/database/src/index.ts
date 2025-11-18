import { createClient } from '@supabase/supabase-js';

// Types
export interface Family {
  id: string;
  parent_email: string;
  subscription_tier: 'free' | 'family' | 'coop';
  state?: string;
  privacy_mode: 'local_only' | 'cloud_sync';
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  family_id: string;
  first_name: string;
  age: number;
  grade_level: number;
  learning_preferences: {
    visual: number;
    audio: number;
    text: number;
  };
  avatar_color: string;
  created_at: string;
  updated_at: string;
}

export interface LearningSession {
  id: string;
  student_id: string;
  lesson_id: string;
  subject: string;
  topic: string;
  started_at: string;
  completed_at?: string;
  time_spent_seconds?: number;
  accuracy?: number;
  problems_attempted: number;
  problems_correct: number;
  struggle_detected: boolean;
  ai_hints_used: number;
  session_data?: any;
  created_at: string;
}

export interface ProgressNode {
  id: string;
  student_id: string;
  concept: string;
  subject: string;
  mastery_level: number;
  last_practiced: string;
  total_attempts: number;
  total_correct: number;
  difficulty_level: number;
  created_at: string;
  updated_at: string;
}

export interface ComplianceLog {
  id: string;
  student_id: string;
  log_date: string;
  subjects_studied: string[];
  total_minutes: number;
  notes?: string;
  created_at: string;
}

// Initialize Supabase client
export function createSupabaseClient(url: string, anonKey: string) {
  return createClient(url, anonKey);
}

// Helper functions
export const db = {
  // Students
  async getStudentsByFamily(supabase: any, familyId: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('family_id', familyId)
      .order('grade_level', { ascending: true });

    if (error) throw error;
    return data as Student[];
  },

  async createStudent(supabase: any, student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single();

    if (error) throw error;
    return data as Student;
  },

  // Learning Sessions
  async createSession(supabase: any, session: Omit<LearningSession, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('learning_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data as LearningSession;
  },

  async completeSession(supabase: any, sessionId: string, results: {
    completed_at: string;
    time_spent_seconds: number;
    accuracy: number;
    problems_attempted: number;
    problems_correct: number;
    struggle_detected: boolean;
    ai_hints_used: number;
  }) {
    const { data, error } = await supabase
      .from('learning_sessions')
      .update(results)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data as LearningSession;
  },

  async getRecentSessions(supabase: any, studentId: string, limit = 10) {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as LearningSession[];
  },

  // Progress Nodes
  async getOrCreateProgressNode(supabase: any, studentId: string, concept: string, subject: string) {
    // Try to get existing
    const { data: existing } = await supabase
      .from('progress_nodes')
      .select('*')
      .eq('student_id', studentId)
      .eq('concept', concept)
      .single();

    if (existing) return existing as ProgressNode;

    // Create new
    const { data, error } = await supabase
      .from('progress_nodes')
      .insert({
        student_id: studentId,
        concept,
        subject,
        mastery_level: 0,
        total_attempts: 0,
        total_correct: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data as ProgressNode;
  },

  async updateProgress(supabase: any, nodeId: string, update: {
    mastery_level?: number;
    total_attempts?: number;
    total_correct?: number;
    difficulty_level?: number;
  }) {
    const { data, error } = await supabase
      .from('progress_nodes')
      .update({ ...update, last_practiced: new Date().toISOString() })
      .eq('id', nodeId)
      .select()
      .single();

    if (error) throw error;
    return data as ProgressNode;
  },

  async getStudentProgress(supabase: any, studentId: string, subject?: string) {
    let query = supabase
      .from('progress_nodes')
      .select('*')
      .eq('student_id', studentId);

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query.order('mastery_level', { ascending: false });

    if (error) throw error;
    return data as ProgressNode[];
  },

  // Compliance
  async logDailyCompliance(supabase: any, log: Omit<ComplianceLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .rpc('log_daily_compliance', {
        p_student_id: log.student_id,
        p_subjects: log.subjects_studied,
        p_minutes: log.total_minutes,
        p_notes: log.notes
      });

    if (error) throw error;
    return data;
  },

  async getComplianceSummary(supabase: any, studentId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('compliance_logs')
      .select('*')
      .eq('student_id', studentId)
      .gte('log_date', startDate)
      .lte('log_date', endDate)
      .order('log_date', { ascending: false });

    if (error) throw error;
    return data as ComplianceLog[];
  },

  // Views
  async getFamilyLearningSummary(supabase: any, familyId: string) {
    const { data, error } = await supabase
      .from('family_learning_summary')
      .select('*')
      .eq('family_id', familyId);

    if (error) throw error;
    return data;
  },

  async getStudentMasteryOverview(supabase: any, studentId: string) {
    const { data, error } = await supabase
      .from('student_mastery_overview')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error;
    return data;
  }
};
