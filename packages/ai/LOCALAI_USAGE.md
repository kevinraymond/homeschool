# LocalAITutor Usage Guide

## Overview
LocalAITutor provides privacy-first, offline AI tutoring using Ollama running locally on your machine.

## Prerequisites
1. Install Ollama: https://ollama.ai
2. Start Ollama service: `ollama serve`
3. Pull the model: `ollama pull llama3.2`

## Basic Usage

```typescript
import { LocalAITutor } from '@homeschool-ai/ai';

// Create and initialize the tutor
const tutor = new LocalAITutor({
  local_model: 'llama3.2',  // Default model
  max_tokens: 200,
  temperature: 0.7
});

await tutor.initialize();

// Generate a Socratic hint
const hint = await tutor.generateHint({
  problem: {
    question: 'What is 7 + 5?',
    correct_answer: '12',
    options: ['10', '11', '12', '13']
  },
  previous_attempts: [],
  student_age: 8,
  student_grade: 3,
  topic: 'Addition'
}, 1); // hint level 1-3

console.log(hint.hint_text);
// Output: "Think about using your fingers. How many fingers do you have on both hands?"

// Assess a student's answer
const feedback = await tutor.assessAnswer({
  problem: {
    question: 'What is 7 + 5?',
    correct_answer: '12',
    options: ['10', '11', '12', '13']
  },
  previous_attempts: [],
  student_age: 8,
  student_grade: 3,
  topic: 'Addition'
}, '11');

console.log(feedback.is_correct); // false
console.log(feedback.feedback_text);
// Output: "Good try! You're very close. Let's count carefully: 7 plus 5 equals 12, not 11."

// Explain a concept
const explanation = await tutor.explainConcept({
  question: 'What is multiplication?',
  correct_answer: 'Repeated addition'
}, 8);

console.log(explanation);
// Output: "Multiplication is like adding the same number over and over..."
```

## Configuration Options

```typescript
interface AIConfig {
  mode: 'local';
  local_model?: string;     // Default: 'llama3.2'
  max_tokens?: number;      // Default: 200
  temperature?: number;     // Default: 0.7
}
```

## API Methods

### `initialize(): Promise<void>`
Checks if Ollama is running and available. Throws error if not.

### `generateHint(context, hintLevel): Promise<AIHint>`
- **Temperature**: 0.7 (creative)
- **Hint Levels**: 1 (gentle), 2 (direct), 3 (strong)
- Returns Socratic-style hints that guide without giving away the answer

### `assessAnswer(context, studentAnswer): Promise<AIFeedback>`
- **Temperature**: 0.3 (consistent)
- Checks if answer is correct
- Provides encouraging feedback
- Suggests next action

### `explainConcept(problem, studentAge): Promise<string>`
- **Temperature**: 0.7 (engaging)
- Explains concepts in age-appropriate language
- Uses real-world examples

### `getModelInfo(): AIModelInfo`
Returns information about the current model

## Error Handling

```typescript
try {
  await tutor.initialize();
} catch (error) {
  console.error('Ollama not available:', error.message);
  // Fall back to CloudAITutor
}
```

Common errors:
- **Connection failed**: Ollama is not running. Start with `ollama serve`
- **Model not found**: Pull the model with `ollama pull llama3.2`
- **Timeout**: Model is too slow or system is overloaded

## Using with Auto-fallback

```typescript
import { createAITutor } from '@homeschool-ai/ai';

// Automatically tries local first, falls back to cloud
const tutor = await createAITutor({ mode: 'auto' });
```

## Switching Models

```typescript
// Use a different Ollama model
const tutor = new LocalAITutor({
  local_model: 'llama3.1',  // or 'mistral', 'phi3', etc.
  max_tokens: 300
});
```

## Performance Tips

1. **First request is slow**: Ollama loads the model on first use
2. **Keep Ollama running**: Avoid restart overhead
3. **Smaller models are faster**: llama3.2:1b vs llama3.2:8b
4. **GPU acceleration**: Use GPU version of Ollama for 10x speedup

## Comparison: Local vs Cloud

| Feature | LocalAITutor | CloudAITutor |
|---------|-------------|--------------|
| Privacy | Complete | Requires trust |
| Speed | Medium | Fast |
| Cost | Free | Paid API |
| Offline | Yes | No |
| Setup | Requires Ollama | Requires AWS |
| Quality | Good | Excellent |
