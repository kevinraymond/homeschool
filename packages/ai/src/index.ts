export * from './types';
export * from './prompts';
export * from './cloud-tutor';
export * from './local-tutor';

import { CloudAITutor } from './cloud-tutor';
import { LocalAITutor } from './local-tutor';
import { AIConfig, AIMode } from './types';

/**
 * Factory function to create appropriate AI tutor based on config
 */
export async function createAITutor(config: Partial<AIConfig> = {}) {
  const mode = config.mode || 'auto';

  if (mode === 'cloud') {
    const tutor = new CloudAITutor(config);
    await tutor.initialize();
    return tutor;
  }

  if (mode === 'local') {
    try {
      const tutor = new LocalAITutor(config);
      await tutor.initialize();
      return tutor;
    } catch (error) {
      console.warn('Local AI failed, falling back to cloud:', error);
      const tutor = new CloudAITutor(config);
      await tutor.initialize();
      return tutor;
    }
  }

  // Auto mode: try local first, fallback to cloud
  try {
    const localTutor = new LocalAITutor(config);
    await localTutor.initialize();
    return localTutor;
  } catch (error) {
    console.log('Using cloud AI (local not available)');
    const cloudTutor = new CloudAITutor(config);
    await cloudTutor.initialize();
    return cloudTutor;
  }
}
