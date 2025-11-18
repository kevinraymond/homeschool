import {
  AITutorContext,
  AIHint,
  AIFeedback,
  AIConfig,
  AIModelInfo
} from './types';
import {
  buildSocraticHintPrompt,
  buildFeedbackPrompt,
  buildExplanationPrompt
} from './prompts';

/**
 * Ollama API response type
 */
interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

/**
 * Local AI tutor using Ollama
 *
 * This implementation uses Ollama's HTTP API for privacy-first, offline AI tutoring.
 * Requires Ollama to be running locally on http://localhost:11434
 */
export class LocalAITutor {
  private config: AIConfig;
  private ollamaEndpoint: string;
  private isAvailable: boolean = false;

  constructor(config: Partial<AIConfig> = {}) {
    this.config = {
      mode: 'local',
      local_model: 'llama3.2',
      max_tokens: 200,
      temperature: 0.7,
      ...config
    };
    this.ollamaEndpoint = 'http://localhost:11434/api/generate';
  }

  async initialize(): Promise<void> {
    console.log('Initializing local AI with Ollama...');

    try {
      // Check if Ollama is running by making a test request
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        this.isAvailable = true;
        console.log(`Local AI ready (model: ${this.config.local_model})`);
      } else {
        throw new Error('Ollama is not responding');
      }
    } catch (error) {
      console.error('Failed to connect to Ollama:', error);
      throw new Error(
        'Local AI initialization failed. Make sure Ollama is running (ollama serve) and the model is available.'
      );
    }
  }

  async generateHint(context: AITutorContext, hintLevel: number = 1): Promise<AIHint> {
    const prompt = buildSocraticHintPrompt(context, hintLevel);

    // Use temperature 0.7 for creative, varied hints
    const response = await this.invoke(prompt, 0.7);

    return {
      hint_text: response.trim(),
      hint_level: hintLevel
    };
  }

  async assessAnswer(
    context: AITutorContext,
    studentAnswer: string
  ): Promise<AIFeedback> {
    const isCorrect = this.checkAnswer(context.problem.correct_answer, studentAnswer);
    const prompt = buildFeedbackPrompt(context, studentAnswer, isCorrect);

    // Use temperature 0.3 for more consistent, focused feedback
    const response = await this.invoke(prompt, 0.3);

    return {
      is_correct: isCorrect,
      feedback_text: response.trim(),
      encouragement: isCorrect ? 'Great job!' : 'Keep trying!',
      next_action: isCorrect ? 'continue' : 'retry'
    };
  }

  async explainConcept(problem: any, studentAge: number): Promise<string> {
    const prompt = buildExplanationPrompt(problem, studentAge);

    // Use temperature 0.7 for engaging explanations
    return await this.invoke(prompt, 0.7);
  }

  getModelInfo(): AIModelInfo {
    return {
      model_type: 'local',
      model_name: this.config.local_model || 'llama3.2',
      estimated_speed: 'medium'
    };
  }

  /**
   * Invoke Ollama API with a prompt
   */
  private async invoke(prompt: string, temperature?: number): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('Local AI not initialized. Call initialize() first.');
    }

    try {
      const response = await fetch(this.ollamaEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.local_model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: temperature ?? this.config.temperature,
            num_predict: this.config.max_tokens
          }
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const data: OllamaResponse = await response.json();

      if (!data.response) {
        throw new Error('Empty response from Ollama');
      }

      return data.response;
    } catch (error) {
      console.error('Local AI error:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          'Cannot connect to Ollama. Please ensure Ollama is running with "ollama serve".'
        );
      }

      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error(
          'Ollama request timed out. The model may be too slow or unresponsive.'
        );
      }

      throw new Error(`Failed to get response from local AI: ${error}`);
    }
  }

  /**
   * Check if student answer matches correct answer
   */
  private checkAnswer(correctAnswer: string, studentAnswer: string): boolean {
    // Normalize answers for comparison
    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '');
    return normalize(correctAnswer) === normalize(studentAnswer);
  }
}
