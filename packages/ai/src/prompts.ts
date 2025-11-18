import { AITutorContext } from './types';

/**
 * Build Socratic method prompt for hints
 */
export function buildSocraticHintPrompt(context: AITutorContext, hintLevel: number): string {
  const { problem, previous_attempts, student_age, topic } = context;

  const attemptsSummary = previous_attempts.length > 0
    ? `\nThe student has tried: ${previous_attempts.map(a => a.student_answer).join(', ')}`
    : '';

  const hintGuidance = {
    1: 'Give a very gentle hint - ask a guiding question without revealing the solution.',
    2: 'Give a more direct hint - point them toward the right approach.',
    3: 'Give a strong hint - almost show them the answer, but let them take the final step.'
  };

  return `You are a patient, encouraging tutor for a ${student_age}-year-old learning ${topic}.

Problem: ${problem.question}
${attemptsSummary}

${hintGuidance[hintLevel as 1 | 2 | 3]}

Rules:
- Never give the direct answer
- Use simple language for age ${student_age}
- Be encouraging and positive
- Ask questions that help them think
- Use real-world examples when helpful

Provide a hint (1-2 sentences):`;
}

/**
 * Build feedback prompt for answer assessment
 */
export function buildFeedbackPrompt(
  context: AITutorContext,
  studentAnswer: string,
  isCorrect: boolean
): string {
  const { problem, student_age, topic } = context;

  if (isCorrect) {
    return `You are a tutor for a ${student_age}-year-old.

Problem: ${problem.question}
Student's answer: ${studentAnswer}
This is CORRECT!

Provide:
1. Brief enthusiastic praise (1 sentence)
2. Quick explanation of why it's right (1 sentence)
3. Encouraging next step (1 sentence)

Keep it short, positive, and age-appropriate:`;
  }

  return `You are a patient tutor for a ${student_age}-year-old learning ${topic}.

Problem: ${problem.question}
Correct answer: ${problem.correct_answer}
Student's answer: ${studentAnswer}
This is incorrect.

Provide gentle, constructive feedback:
1. Acknowledge their effort (encouraging)
2. Explain the error simply
3. Suggest trying again or give a hint

Keep it supportive and age-appropriate (2-3 sentences):`;
}

/**
 * Build problem generation prompt
 */
export function buildProblemGenerationPrompt(
  topic: string,
  grade: number,
  difficulty: number
): string {
  const difficultyLevel = Math.round(difficulty * 10);

  return `Generate a ${topic} practice problem for grade ${grade}.

Difficulty level: ${difficultyLevel}/10

Format your response as JSON:
{
  "question": "The problem statement",
  "options": ["option1", "option2", "option3", "option4"],
  "correct_answer": "the correct option",
  "explanation": "why this is the answer"
}

Make it engaging and age-appropriate. Use real-world contexts when possible.`;
}

/**
 * Build explanation prompt
 */
export function buildExplanationPrompt(
  problem: Problem,
  studentAge: number
): string {
  return `You are explaining a math concept to a ${studentAge}-year-old.

Problem: ${problem.question}
Answer: ${problem.correct_answer}

Explain this in a simple, visual way that a ${studentAge}-year-old would understand.
Use examples from their daily life (toys, snacks, games, etc.).

Provide a clear explanation (2-3 sentences):`;
}
