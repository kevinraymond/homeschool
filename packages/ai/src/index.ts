export * from './types';
export * from './prompts';
export * from './local-tutor';
// Cloud tutor available but not exported by default
// import separately if needed: import { CloudAITutor } from '@homeschool-ai/ai/src/cloud-tutor'

import { LocalAITutor } from './local-tutor';
import { AIConfig } from './types';

/**
 * Factory function to create AI tutor
 *
 * MVP: Defaults to local-only mode using Ollama.
 * This ensures student data never leaves the device by default.
 *
 * To use cloud AI (AWS Bedrock), you must:
 * 1. Set mode: 'cloud' in config
 * 2. Configure AWS credentials
 * 3. Import CloudAITutor separately
 */
export async function createAITutor(config: Partial<AIConfig> = {}) {
  // MVP: Always use local AI (Ollama)
  // No fallback to cloud - this is privacy-first by design
  const tutor = new LocalAITutor({
    mode: 'local',
    local_model: 'llama3.2',
    max_tokens: 200,
    temperature: 0.7,
    ...config
  });

  await tutor.initialize();
  return tutor;
}
