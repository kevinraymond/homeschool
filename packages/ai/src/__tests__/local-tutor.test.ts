import { LocalAITutor } from '../local-tutor';
import { AITutorContext } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('LocalAITutor', () => {
  let tutor: LocalAITutor;
  const mockContext: AITutorContext = {
    problem: {
      id: 'test-1',
      type: 'addition',
      question: 'What is 5 + 3?',
      options: ['6', '7', '8', '9'],
      correct_answer: '8',
      explanation: '5 + 3 = 8',
      difficulty: 0.5
    },
    previous_attempts: [],
    student_age: 8,
    student_grade: 3,
    topic: 'addition'
  };

  beforeEach(() => {
    tutor = new LocalAITutor();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const info = tutor.getModelInfo();
      expect(info.model_type).toBe('local');
      expect(info.model_name).toBe('llama3.2');
    });

    it('should accept custom config', () => {
      const customTutor = new LocalAITutor({
        local_model: 'custom-model',
        max_tokens: 500
      });
      const info = customTutor.getModelInfo();
      expect(info.model_name).toBe('custom-model');
    });

    it('should successfully initialize when Ollama is running', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [] })
      });

      await expect(tutor.initialize()).resolves.not.toThrow();
    });

    it('should throw error when Ollama is not running', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection refused'));

      await expect(tutor.initialize()).rejects.toThrow('Local AI initialization failed');
    });

    it('should throw error when Ollama responds with error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(tutor.initialize()).rejects.toThrow('Local AI initialization failed');
    });
  });

  describe('generateHint', () => {
    beforeEach(async () => {
      // Mock successful initialization
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [] })
      });
      await tutor.initialize();
      jest.clearAllMocks();
    });

    it('should generate hint with correct structure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3.2',
          response: 'Try thinking about what happens when you add numbers together.',
          done: true
        })
      });

      const hint = await tutor.generateHint(mockContext, 1);

      expect(hint).toHaveProperty('hint_text');
      expect(hint).toHaveProperty('hint_level');
      expect(hint.hint_level).toBe(1);
      expect(typeof hint.hint_text).toBe('string');
    });

    it('should make correct API call to Ollama', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3.2',
          response: 'Hint text',
          done: true
        })
      });

      await tutor.generateHint(mockContext, 2);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.model).toBe('llama3.2');
      expect(callBody.stream).toBe(false);
      expect(callBody.options.temperature).toBe(0.7);
    });

    it('should use different hint levels', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          model: 'llama3.2',
          response: 'Hint',
          done: true
        })
      });

      const hint1 = await tutor.generateHint(mockContext, 1);
      const hint2 = await tutor.generateHint(mockContext, 2);
      const hint3 = await tutor.generateHint(mockContext, 3);

      expect(hint1.hint_level).toBe(1);
      expect(hint2.hint_level).toBe(2);
      expect(hint3.hint_level).toBe(3);
    });

    it('should trim whitespace from response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3.2',
          response: '  Hint with spaces  \n',
          done: true
        })
      });

      const hint = await tutor.generateHint(mockContext, 1);
      expect(hint.hint_text).toBe('Hint with spaces');
    });

    it('should throw error when not initialized', async () => {
      const uninitializedTutor = new LocalAITutor();
      await expect(uninitializedTutor.generateHint(mockContext, 1)).rejects.toThrow(
        'Local AI not initialized'
      );
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal server error'
      });

      await expect(tutor.generateHint(mockContext, 1)).rejects.toThrow('Ollama API error: 500');
    });

    it('should handle timeout', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        Object.assign(new Error('Timeout'), { name: 'TimeoutError' })
      );

      await expect(tutor.generateHint(mockContext, 1)).rejects.toThrow(
        'Ollama request timed out'
      );
    });

    it('should handle connection errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new TypeError('Failed to fetch')
      );

      await expect(tutor.generateHint(mockContext, 1)).rejects.toThrow(
        'Cannot connect to Ollama'
      );
    });
  });

  describe('assessAnswer', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [] })
      });
      await tutor.initialize();
      jest.clearAllMocks();
    });

    it('should correctly assess correct answer', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3.2',
          response: 'Great job! That is correct.',
          done: true
        })
      });

      const feedback = await tutor.assessAnswer(mockContext, '8');

      expect(feedback.is_correct).toBe(true);
      expect(feedback.feedback_text).toBeTruthy();
      expect(feedback.encouragement).toBeTruthy();
      expect(feedback.next_action).toBe('continue');
    });

    it('should correctly assess incorrect answer', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3.2',
          response: 'Not quite. Let\'s try again.',
          done: true
        })
      });

      const feedback = await tutor.assessAnswer(mockContext, '7');

      expect(feedback.is_correct).toBe(false);
      expect(feedback.feedback_text).toBeTruthy();
      expect(feedback.next_action).toBe('retry');
    });

    it('should normalize answers for comparison', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          model: 'llama3.2',
          response: 'Correct!',
          done: true
        })
      });

      // Test with different spacing and casing
      const feedback1 = await tutor.assessAnswer(mockContext, '  8  ');
      const feedback2 = await tutor.assessAnswer(mockContext, '8');

      expect(feedback1.is_correct).toBe(true);
      expect(feedback2.is_correct).toBe(true);
    });

    it('should use lower temperature for feedback', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3.2',
          response: 'Feedback',
          done: true
        })
      });

      await tutor.assessAnswer(mockContext, '8');

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.options.temperature).toBe(0.3);
    });

    it('should return proper feedback structure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3.2',
          response: 'Feedback text',
          done: true
        })
      });

      const feedback = await tutor.assessAnswer(mockContext, '8');

      expect(feedback).toHaveProperty('is_correct');
      expect(feedback).toHaveProperty('feedback_text');
      expect(feedback).toHaveProperty('encouragement');
      expect(feedback).toHaveProperty('next_action');
    });
  });

  describe('explainConcept', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [] })
      });
      await tutor.initialize();
      jest.clearAllMocks();
    });

    it('should generate explanation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3.2',
          response: 'When you add numbers, you combine them together...',
          done: true
        })
      });

      const explanation = await tutor.explainConcept(mockContext.problem, 8);

      expect(typeof explanation).toBe('string');
      expect(explanation.length).toBeGreaterThan(0);
    });

    it('should use appropriate temperature', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3.2',
          response: 'Explanation',
          done: true
        })
      });

      await tutor.explainConcept(mockContext.problem, 8);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.options.temperature).toBe(0.7);
    });
  });

  describe('getModelInfo', () => {
    it('should return correct model info', () => {
      const info = tutor.getModelInfo();

      expect(info.model_type).toBe('local');
      expect(info.model_name).toBe('llama3.2');
      expect(info.estimated_speed).toBe('medium');
    });

    it('should reflect custom model name', () => {
      const customTutor = new LocalAITutor({ local_model: 'llama3.2:8b' });
      const info = customTutor.getModelInfo();

      expect(info.model_name).toBe('llama3.2:8b');
    });
  });

  describe('answer normalization', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [] })
      });
      await tutor.initialize();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          model: 'llama3.2',
          response: 'Feedback',
          done: true
        })
      });
    });

    it('should handle extra spaces', async () => {
      const feedback = await tutor.assessAnswer(mockContext, '  8  ');
      expect(feedback.is_correct).toBe(true);
    });

    it('should handle different case', async () => {
      const textContext = {
        ...mockContext,
        problem: { ...mockContext.problem, correct_answer: 'Eight' }
      };
      const feedback = await tutor.assessAnswer(textContext, 'eight');
      expect(feedback.is_correct).toBe(true);
    });

    it('should handle internal whitespace', async () => {
      const textContext = {
        ...mockContext,
        problem: { ...mockContext.problem, correct_answer: '1 / 2' }
      };
      const feedback = await tutor.assessAnswer(textContext, '1/2');
      expect(feedback.is_correct).toBe(true);
    });

    it('should correctly identify wrong answers', async () => {
      const feedback = await tutor.assessAnswer(mockContext, '7');
      expect(feedback.is_correct).toBe(false);
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [] })
      });
      await tutor.initialize();
      jest.clearAllMocks();
    });

    it('should handle empty response from Ollama', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3.2',
          response: '',
          done: true
        })
      });

      await expect(tutor.generateHint(mockContext, 1)).rejects.toThrow(
        'Empty response from Ollama'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(tutor.generateHint(mockContext, 1)).rejects.toThrow(
        'Failed to get response from local AI'
      );
    });

    it('should handle malformed JSON response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      await expect(tutor.generateHint(mockContext, 1)).rejects.toThrow();
    });
  });
});
