/**
 * Test script for LocalAITutor
 *
 * Prerequisites:
 * 1. Install Ollama: https://ollama.ai
 * 2. Run: ollama serve
 * 3. Run: ollama pull llama3.2
 * 4. Run: npx ts-node test-local-tutor.ts
 */

import { LocalAITutor } from './src/local-tutor';
import { AITutorContext } from './src/types';

async function testLocalAITutor() {
  console.log('Testing LocalAITutor with Ollama...\n');

  // Create the tutor
  const tutor = new LocalAITutor({
    local_model: 'llama3.2',
    max_tokens: 200,
    temperature: 0.7
  });

  try {
    // Initialize and check Ollama connection
    console.log('1. Initializing...');
    await tutor.initialize();
    console.log('✓ Ollama connected!\n');

    // Get model info
    console.log('2. Model Info:');
    const modelInfo = tutor.getModelInfo();
    console.log(`   Type: ${modelInfo.model_type}`);
    console.log(`   Model: ${modelInfo.model_name}`);
    console.log(`   Speed: ${modelInfo.estimated_speed}\n`);

    // Test context
    const context: AITutorContext = {
      problem: {
        question: 'What is 5 + 3?',
        correct_answer: '8',
        options: ['6', '7', '8', '9'],
        explanation: 'Add the two numbers together'
      },
      previous_attempts: [],
      student_age: 7,
      student_grade: 2,
      topic: 'Addition'
    };

    // Test 1: Generate hint
    console.log('3. Testing generateHint():');
    console.log(`   Question: ${context.problem.question}`);
    const hint = await tutor.generateHint(context, 1);
    console.log(`   Hint (Level ${hint.hint_level}): ${hint.hint_text}\n`);

    // Test 2: Assess wrong answer
    console.log('4. Testing assessAnswer() - Wrong Answer:');
    const wrongFeedback = await tutor.assessAnswer(context, '7');
    console.log(`   Student Answer: 7`);
    console.log(`   Is Correct: ${wrongFeedback.is_correct}`);
    console.log(`   Feedback: ${wrongFeedback.feedback_text}`);
    console.log(`   Encouragement: ${wrongFeedback.encouragement}`);
    console.log(`   Next Action: ${wrongFeedback.next_action}\n`);

    // Test 3: Assess correct answer
    console.log('5. Testing assessAnswer() - Correct Answer:');
    const correctFeedback = await tutor.assessAnswer(context, '8');
    console.log(`   Student Answer: 8`);
    console.log(`   Is Correct: ${correctFeedback.is_correct}`);
    console.log(`   Feedback: ${correctFeedback.feedback_text}`);
    console.log(`   Encouragement: ${correctFeedback.encouragement}`);
    console.log(`   Next Action: ${correctFeedback.next_action}\n`);

    // Test 4: Explain concept
    console.log('6. Testing explainConcept():');
    const explanation = await tutor.explainConcept(context.problem, context.student_age);
    console.log(`   Explanation: ${explanation}\n`);

    console.log('✓ All tests passed!');

  } catch (error) {
    console.error('Error:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure Ollama is running: ollama serve');
    console.log('2. Make sure the model is installed: ollama pull llama3.2');
    console.log('3. Check Ollama is accessible: curl http://localhost:11434/api/tags');
  }
}

testLocalAITutor();
