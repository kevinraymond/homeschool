import { z } from 'zod';

// Lesson Section Types
export const VideoSectionSchema = z.object({
  type: z.literal('video'),
  duration: z.string(),
  content: z.object({
    video_url: z.string(),
    transcript: z.string().optional(),
    subtitles: z.boolean().default(true)
  })
});

export const InteractiveSectionSchema = z.object({
  type: z.literal('interactive'),
  component: z.string(),
  props: z.record(z.any()).optional()
});

export const PracticeSectionSchema = z.object({
  type: z.literal('practice'),
  problem_generator: z.object({
    type: z.string(),
    difficulty: z.number().min(0).max(1),
    count: z.number().int().positive(),
    adaptive: z.boolean().default(false)
  })
});

export const AssessmentSectionSchema = z.object({
  type: z.literal('assessment'),
  mastery_threshold: z.number().min(0).max(1),
  problems: z.number().int().positive(),
  ai_tutor_enabled: z.boolean().default(true)
});

export const LessonSectionSchema = z.discriminatedUnion('type', [
  VideoSectionSchema,
  InteractiveSectionSchema,
  PracticeSectionSchema,
  AssessmentSectionSchema
]);

// AI Tutor Config
export const AITutorConfigSchema = z.object({
  system_prompt: z.string(),
  socratic_mode: z.boolean().default(true),
  max_hints: z.number().int().default(3),
  difficulty_adjustment_enabled: z.boolean().default(true)
});

// Lesson Schema
export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  grade: z.number().int().min(0).max(12),
  subject: z.string(),
  unit: z.string(),
  prerequisites: z.array(z.string()).default([]),
  teaches: z.array(z.string()).default([]),
  estimated_time: z.string(),
  sections: z.array(LessonSectionSchema),
  ai_tutor_config: AITutorConfigSchema.optional()
});

// Unit Schema
export const UnitSchema = z.object({
  id: z.string(),
  title: z.string(),
  grade: z.number().int().min(0).max(12),
  subject: z.string(),
  description: z.string(),
  lessons: z.array(z.string()), // Lesson IDs
  estimated_total_time: z.string()
});

// Curriculum Schema (Full subject/grade)
export const CurriculumSchema = z.object({
  id: z.string(),
  subject: z.string(),
  grade: z.number().int().min(0).max(12),
  title: z.string(),
  description: z.string(),
  units: z.array(z.string()) // Unit IDs
});

// Type exports
export type VideoSection = z.infer<typeof VideoSectionSchema>;
export type InteractiveSection = z.infer<typeof InteractiveSectionSchema>;
export type PracticeSection = z.infer<typeof PracticeSectionSchema>;
export type AssessmentSection = z.infer<typeof AssessmentSectionSchema>;
export type LessonSection = z.infer<typeof LessonSectionSchema>;
export type AITutorConfig = z.infer<typeof AITutorConfigSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type Curriculum = z.infer<typeof CurriculumSchema>;

// Problem Types
export interface Problem {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  difficulty: number;
}

// Student Answer
export interface Answer {
  problem_id: string;
  student_answer: string;
  is_correct: boolean;
  time_spent_seconds: number;
  hints_used: number;
  timestamp: string;
}
