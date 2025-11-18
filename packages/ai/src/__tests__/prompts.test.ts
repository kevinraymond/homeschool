import { buildSocraticHintPrompt, buildFeedbackPrompt, buildProblemGenerationPrompt, buildExplanationPrompt } from '../prompts';
import { AITutorContext } from '../types';

describe('AI Prompts', () => {
  const mockProblem = {
    id: 'test-1',
    type: 'addition',
    question: 'What is 5 + 3?',
    options: ['6', '7', '8', '9'],
    correct_answer: '8',
    explanation: '5 + 3 = 8',
    difficulty: 0.5
  };

  const mockContext: AITutorContext = {
    problem: mockProblem,
    previous_attempts: [],
    student_age: 8,
    student_grade: 3,
    topic: 'addition'
  };

  describe('buildSocraticHintPrompt', () => {
    it('should include problem question', () => {
      const prompt = buildSocraticHintPrompt(mockContext, 1);
      expect(prompt).toContain(mockProblem.question);
    });

    it('should include student age', () => {
      const prompt = buildSocraticHintPrompt(mockContext, 1);
      expect(prompt).toContain('8-year-old');
    });

    it('should include topic', () => {
      const prompt = buildSocraticHintPrompt(mockContext, 1);
      expect(prompt).toContain('addition');
    });

    it('should include previous attempts when available', () => {
      const contextWithAttempts: AITutorContext = {
        ...mockContext,
        previous_attempts: [
          { student_answer: '7', is_correct: false, timestamp: '2024-01-01' },
          { student_answer: '6', is_correct: false, timestamp: '2024-01-01' }
        ]
      };

      const prompt = buildSocraticHintPrompt(contextWithAttempts, 1);
      expect(prompt).toContain('The student has tried');
      expect(prompt).toContain('7');
      expect(prompt).toContain('6');
    });

    it('should have different guidance for hint level 1', () => {
      const prompt = buildSocraticHintPrompt(mockContext, 1);
      expect(prompt).toContain('gentle hint');
      expect(prompt).toContain('guiding question');
    });

    it('should have different guidance for hint level 2', () => {
      const prompt = buildSocraticHintPrompt(mockContext, 2);
      expect(prompt).toContain('more direct hint');
      expect(prompt).toContain('right approach');
    });

    it('should have different guidance for hint level 3', () => {
      const prompt = buildSocraticHintPrompt(mockContext, 3);
      expect(prompt).toContain('strong hint');
      expect(prompt).toContain('almost show them the answer');
    });

    it('should include rules for the tutor', () => {
      const prompt = buildSocraticHintPrompt(mockContext, 1);
      expect(prompt).toContain('Rules:');
      expect(prompt).toContain('Never give the direct answer');
      expect(prompt).toContain('encouraging and positive');
    });

    it('should emphasize age-appropriate language', () => {
      const prompt = buildSocraticHintPrompt(mockContext, 1);
      expect(prompt).toMatch(/simple language.*age/i);
    });

    it('should be different for each hint level', () => {
      const hint1 = buildSocraticHintPrompt(mockContext, 1);
      const hint2 = buildSocraticHintPrompt(mockContext, 2);
      const hint3 = buildSocraticHintPrompt(mockContext, 3);

      expect(hint1).not.toBe(hint2);
      expect(hint2).not.toBe(hint3);
      expect(hint1).not.toBe(hint3);
    });

    it('should work with different student ages', () => {
      const youngerContext = { ...mockContext, student_age: 6 };
      const olderContext = { ...mockContext, student_age: 12 };

      const youngerPrompt = buildSocraticHintPrompt(youngerContext, 1);
      const olderPrompt = buildSocraticHintPrompt(olderContext, 1);

      expect(youngerPrompt).toContain('6-year-old');
      expect(olderPrompt).toContain('12-year-old');
    });
  });

  describe('buildFeedbackPrompt', () => {
    it('should generate different prompts for correct vs incorrect answers', () => {
      const correctPrompt = buildFeedbackPrompt(mockContext, '8', true);
      const incorrectPrompt = buildFeedbackPrompt(mockContext, '7', false);

      expect(correctPrompt).not.toBe(incorrectPrompt);
      expect(correctPrompt).toContain('CORRECT');
      expect(incorrectPrompt).toContain('incorrect');
    });

    describe('for correct answers', () => {
      it('should include the problem and student answer', () => {
        const prompt = buildFeedbackPrompt(mockContext, '8', true);
        expect(prompt).toContain(mockProblem.question);
        expect(prompt).toContain('8');
      });

      it('should ask for enthusiastic praise', () => {
        const prompt = buildFeedbackPrompt(mockContext, '8', true);
        expect(prompt).toContain('enthusiastic praise');
      });

      it('should ask for explanation of why it\'s right', () => {
        const prompt = buildFeedbackPrompt(mockContext, '8', true);
        expect(prompt).toContain('why it\'s right');
      });

      it('should ask for encouraging next step', () => {
        const prompt = buildFeedbackPrompt(mockContext, '8', true);
        expect(prompt.toLowerCase()).toContain('encouraging next step');
      });

      it('should emphasize keeping it short and positive', () => {
        const prompt = buildFeedbackPrompt(mockContext, '8', true);
        expect(prompt).toContain('short, positive');
      });

      it('should include student age', () => {
        const prompt = buildFeedbackPrompt(mockContext, '8', true);
        expect(prompt).toContain('8-year-old');
      });
    });

    describe('for incorrect answers', () => {
      it('should include problem, correct answer, and student answer', () => {
        const prompt = buildFeedbackPrompt(mockContext, '7', false);
        expect(prompt).toContain(mockProblem.question);
        expect(prompt).toContain(mockProblem.correct_answer);
        expect(prompt).toContain('7');
      });

      it('should ask to acknowledge effort', () => {
        const prompt = buildFeedbackPrompt(mockContext, '7', false);
        expect(prompt).toContain('Acknowledge their effort');
      });

      it('should ask to explain the error simply', () => {
        const prompt = buildFeedbackPrompt(mockContext, '7', false);
        expect(prompt).toContain('Explain the error simply');
      });

      it('should suggest trying again or giving a hint', () => {
        const prompt = buildFeedbackPrompt(mockContext, '7', false);
        expect(prompt).toContain('trying again or give a hint');
      });

      it('should emphasize supportive tone', () => {
        const prompt = buildFeedbackPrompt(mockContext, '7', false);
        expect(prompt).toContain('supportive');
      });

      it('should include topic', () => {
        const prompt = buildFeedbackPrompt(mockContext, '7', false);
        expect(prompt).toContain('addition');
      });

      it('should include student age', () => {
        const prompt = buildFeedbackPrompt(mockContext, '7', false);
        expect(prompt).toContain('8-year-old');
      });
    });
  });

  describe('buildProblemGenerationPrompt', () => {
    it('should include topic and grade', () => {
      const prompt = buildProblemGenerationPrompt('multiplication', 4, 0.5);
      expect(prompt).toContain('multiplication');
      expect(prompt).toContain('grade 4');
    });

    it('should include difficulty level on 1-10 scale', () => {
      const easyPrompt = buildProblemGenerationPrompt('addition', 2, 0.2);
      const hardPrompt = buildProblemGenerationPrompt('addition', 2, 0.9);

      expect(easyPrompt).toContain('2/10');
      expect(hardPrompt).toContain('9/10');
    });

    it('should request JSON format', () => {
      const prompt = buildProblemGenerationPrompt('subtraction', 3, 0.5);
      expect(prompt).toContain('JSON');
      expect(prompt).toContain('"question"');
      expect(prompt).toContain('"options"');
      expect(prompt).toContain('"correct_answer"');
      expect(prompt).toContain('"explanation"');
    });

    it('should ask for engaging and age-appropriate content', () => {
      const prompt = buildProblemGenerationPrompt('division', 5, 0.7);
      expect(prompt).toContain('engaging');
      expect(prompt).toContain('age-appropriate');
    });

    it('should suggest using real-world contexts', () => {
      const prompt = buildProblemGenerationPrompt('fractions', 4, 0.6);
      expect(prompt).toContain('real-world');
    });

    it('should handle difficulty 0 (easiest)', () => {
      const prompt = buildProblemGenerationPrompt('addition', 1, 0);
      expect(prompt).toContain('0/10');
    });

    it('should handle difficulty 1 (hardest)', () => {
      const prompt = buildProblemGenerationPrompt('algebra', 6, 1);
      expect(prompt).toContain('10/10');
    });
  });

  describe('buildExplanationPrompt', () => {
    it('should include problem and answer', () => {
      const prompt = buildExplanationPrompt(mockProblem, 8);
      expect(prompt).toContain(mockProblem.question);
      expect(prompt).toContain(mockProblem.correct_answer);
    });

    it('should include student age', () => {
      const prompt = buildExplanationPrompt(mockProblem, 7);
      expect(prompt).toContain('7-year-old');
    });

    it('should ask for simple, visual explanation', () => {
      const prompt = buildExplanationPrompt(mockProblem, 8);
      expect(prompt).toContain('simple, visual');
    });

    it('should suggest using examples from daily life', () => {
      const prompt = buildExplanationPrompt(mockProblem, 8);
      expect(prompt).toContain('daily life');
      expect(prompt).toContain('toys, snacks, games');
    });

    it('should work with different ages', () => {
      const youngPrompt = buildExplanationPrompt(mockProblem, 5);
      const oldPrompt = buildExplanationPrompt(mockProblem, 12);

      expect(youngPrompt).toContain('5-year-old');
      expect(oldPrompt).toContain('12-year-old');
    });

    it('should specify length (2-3 sentences)', () => {
      const prompt = buildExplanationPrompt(mockProblem, 8);
      expect(prompt).toContain('2-3 sentences');
    });
  });

  describe('Prompt Safety', () => {
    it('should not include sensitive information in prompts', () => {
      const prompts = [
        buildSocraticHintPrompt(mockContext, 1),
        buildFeedbackPrompt(mockContext, '8', true),
        buildProblemGenerationPrompt('math', 3, 0.5),
        buildExplanationPrompt(mockProblem, 8)
      ];

      prompts.forEach(prompt => {
        // Ensure no placeholder variables are left unreplaced
        expect(prompt).not.toMatch(/\${[^}]+}/);
        expect(prompt).not.toMatch(/undefined/);
        expect(prompt).not.toMatch(/\[object Object\]/);
      });
    });

    it('should handle special characters in problem questions', () => {
      const specialProblem = {
        ...mockProblem,
        question: 'What is 5 × 3 ÷ 2?'
      };
      const context = { ...mockContext, problem: specialProblem };

      const prompt = buildSocraticHintPrompt(context, 1);
      expect(prompt).toContain('5 × 3 ÷ 2');
    });
  });

  describe('Consistency', () => {
    it('should produce consistent prompts for same inputs', () => {
      const prompt1 = buildSocraticHintPrompt(mockContext, 1);
      const prompt2 = buildSocraticHintPrompt(mockContext, 1);

      expect(prompt1).toBe(prompt2);
    });

    it('should always include core elements in Socratic hints', () => {
      const prompt = buildSocraticHintPrompt(mockContext, 2);

      // Core elements that should always be present
      expect(prompt).toMatch(/tutor/i);
      expect(prompt).toMatch(/problem/i);
      expect(prompt).toMatch(/hint/i);
      expect(prompt).toMatch(/encouraging/i);
    });

    it('should always include core elements in feedback', () => {
      const correctPrompt = buildFeedbackPrompt(mockContext, '8', true);
      const incorrectPrompt = buildFeedbackPrompt(mockContext, '7', false);

      [correctPrompt, incorrectPrompt].forEach(prompt => {
        expect(prompt).toMatch(/tutor/i);
        expect(prompt).toMatch(/student/i);
        expect(prompt).toMatch(/answer/i);
      });
    });
  });
});
