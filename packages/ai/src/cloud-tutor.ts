import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from '@aws-sdk/client-bedrock-runtime';
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
 * Cloud-based AI tutor using AWS Bedrock (Claude)
 */
export class CloudAITutor {
  private client: BedrockRuntimeClient;
  private config: AIConfig;

  constructor(config: Partial<AIConfig> = {}) {
    this.config = {
      mode: 'cloud',
      cloud_model: 'anthropic.claude-3-haiku-20240307-v1:0',
      max_tokens: 200,
      temperature: 0.7,
      ...config
    };

    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async initialize(): Promise<void> {
    // Cloud AI doesn't need initialization
    console.log('Cloud AI tutor ready');
  }

  async generateHint(context: AITutorContext, hintLevel: number = 1): Promise<AIHint> {
    const prompt = buildSocraticHintPrompt(context, hintLevel);

    const response = await this.invoke(prompt);

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

    const response = await this.invoke(prompt);

    return {
      is_correct: isCorrect,
      feedback_text: response.trim(),
      encouragement: isCorrect ? '🎉 Great job!' : '💪 Keep trying!',
      next_action: isCorrect ? 'continue' : 'retry'
    };
  }

  async explainConcept(problem: any, studentAge: number): Promise<string> {
    const prompt = buildExplanationPrompt(problem, studentAge);
    return await this.invoke(prompt);
  }

  getModelInfo(): AIModelInfo {
    return {
      model_type: 'cloud',
      model_name: this.config.cloud_model || 'claude-haiku',
      estimated_speed: 'fast'
    };
  }

  private async invoke(prompt: string): Promise<string> {
    const command = new InvokeModelCommand({
      modelId: this.config.cloud_model,
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: this.config.max_tokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    try {
      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.content[0].text;
    } catch (error) {
      console.error('Cloud AI error:', error);
      throw new Error('Failed to get response from cloud AI');
    }
  }

  private checkAnswer(correctAnswer: string, studentAnswer: string): boolean {
    // Normalize answers for comparison
    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '');
    return normalize(correctAnswer) === normalize(studentAnswer);
  }
}
