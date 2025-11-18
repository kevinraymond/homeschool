import { Problem, Answer } from '@homeschool-ai/curriculum';

export interface AITutorContext {
  problem: Problem;
  previous_attempts: Answer[];
  student_age: number;
  student_grade: number;
  topic: string;
}

export interface AIHint {
  hint_text: string;
  hint_level: number; // 1 = gentle nudge, 2 = more direct, 3 = almost giving answer
  suggestion?: string; // Optional specific action suggestion
}

export interface AIFeedback {
  is_correct: boolean;
  feedback_text: string;
  explanation?: string;
  encouragement: string;
  next_action?: 'continue' | 'retry' | 'hint' | 'move_on';
}

export interface AIModelInfo {
  model_type: 'local' | 'cloud';
  model_name: string;
  model_size?: string;
  estimated_speed: 'fast' | 'medium' | 'slow';
}

export type AIMode = 'local' | 'cloud' | 'auto';

export interface AIConfig {
  mode: AIMode;
  local_model?: string; // e.g., 'llama-3.2-1b-q4'
  cloud_model?: string; // e.g., 'anthropic.claude-3-haiku'
  max_tokens?: number;
  temperature?: number;
}
