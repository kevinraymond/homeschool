import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import type { PracticeSection as PracticeSectionType, Lesson, Problem, Answer } from '@homeschool-ai/curriculum';
import type { AIHint, AITutorContext } from '@homeschool-ai/ai';
import { createAITutor } from '@homeschool-ai/ai';
import ProblemCard from './ProblemCard';

interface PracticeSectionProps {
  section: PracticeSectionType;
  lesson: Lesson;
  onComplete: () => void;
}

export default function PracticeSection({ section, lesson, onComplete }: PracticeSectionProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [completedProblems, setCompletedProblems] = useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [aiTutor, setAiTutor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const totalProblems = section.problem_generator.count;
  const currentProblem = problems[currentProblemIndex];

  // Initialize AI tutor and generate problems
  useEffect(() => {
    initializeSection();
  }, []);

  const initializeSection = async () => {
    try {
      // Initialize AI tutor
      const tutor = await createAITutor({
        mode: 'auto',
      });
      setAiTutor(tutor);

      // Generate practice problems
      const generatedProblems = generateProblems();
      setProblems(generatedProblems);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing practice section:', error);
      // Continue without AI tutor
      const generatedProblems = generateProblems();
      setProblems(generatedProblems);
      setIsLoading(false);
    }
  };

  // Mock problem generator - in real implementation, this would use the problem_generator config
  const generateProblems = (): Problem[] => {
    const problems: Problem[] = [];
    const type = section.problem_generator.type;
    const count = section.problem_generator.count;

    for (let i = 0; i < count; i++) {
      problems.push(generateSingleProblem(type, i));
    }

    return problems;
  };

  const generateSingleProblem = (type: string, index: number): Problem => {
    // Mock problem generation based on type
    // In real implementation, this would be more sophisticated
    const difficulty = section.problem_generator.difficulty;
    const maxNum = Math.floor(10 + (difficulty * 90)); // Scale from 10-100 based on difficulty

    if (type === 'addition') {
      const a = Math.floor(Math.random() * maxNum) + 1;
      const b = Math.floor(Math.random() * maxNum) + 1;
      return {
        id: `practice-${index}`,
        type: 'addition',
        question: `What is ${a} + ${b}?`,
        correct_answer: String(a + b),
        explanation: `${a} + ${b} equals ${a + b}`,
        difficulty: section.problem_generator.difficulty,
      };
    } else if (type === 'subtraction') {
      const a = Math.floor(Math.random() * maxNum) + 1;
      const b = Math.floor(Math.random() * a) + 1; // b is always less than a
      return {
        id: `practice-${index}`,
        type: 'subtraction',
        question: `What is ${a} - ${b}?`,
        correct_answer: String(a - b),
        explanation: `${a} - ${b} equals ${a - b}`,
        difficulty: section.problem_generator.difficulty,
      };
    } else if (type === 'multiplication') {
      const a = Math.floor(Math.random() * 12) + 1;
      const b = Math.floor(Math.random() * 12) + 1;
      return {
        id: `practice-${index}`,
        type: 'multiplication',
        question: `What is ${a} × ${b}?`,
        correct_answer: String(a * b),
        explanation: `${a} × ${b} equals ${a * b}`,
        difficulty: section.problem_generator.difficulty,
      };
    } else {
      // Default to addition
      const a = Math.floor(Math.random() * maxNum) + 1;
      const b = Math.floor(Math.random() * maxNum) + 1;
      return {
        id: `practice-${index}`,
        type: 'addition',
        question: `What is ${a} + ${b}?`,
        correct_answer: String(a + b),
        explanation: `${a} + ${b} equals ${a + b}`,
        difficulty: section.problem_generator.difficulty,
      };
    }
  };

  const handleCorrectAnswer = (answer: Answer) => {
    // Record answer
    setAnswers((prev) => [...prev, answer]);

    // Mark problem as completed
    const newCompleted = new Set(completedProblems);
    newCompleted.add(currentProblemIndex);
    setCompletedProblems(newCompleted);

    // Move to next problem or complete section
    if (currentProblemIndex < totalProblems - 1) {
      setTimeout(() => {
        setCurrentProblemIndex((prev) => prev + 1);
      }, 2000);
    } else {
      // All problems completed
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  const handleIncorrectAnswer = (answer: Answer) => {
    // Record answer for adaptive difficulty (if enabled)
    setAnswers((prev) => [...prev, answer]);
  };

  const handleRequestHint = async (level: number): Promise<AIHint> => {
    if (!aiTutor) {
      // Return fallback hints if AI tutor not available
      return getFallbackHint(level);
    }

    try {
      const context: AITutorContext = {
        problem: currentProblem,
        previous_attempts: answers.filter(a => a.problem_id === currentProblem.id),
        student_age: 10, // Could be passed from props
        student_grade: lesson.grade,
        topic: lesson.subject,
      };

      const hint = await aiTutor.generateHint(context, level);
      return hint;
    } catch (error) {
      console.error('Error generating hint:', error);
      return getFallbackHint(level);
    }
  };

  const getFallbackHint = (level: number): AIHint => {
    const hints = [
      'Think about what the question is asking. Break it down step by step!',
      'Try using your fingers or drawing a picture to help you solve this.',
      `The answer is close to ${currentProblem.correct_answer}. Can you figure out the exact number?`,
    ];

    return {
      hint_text: hints[level - 1] || hints[0],
      hint_level: level,
    };
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 text-lg mt-4">Preparing practice problems...</Text>
      </View>
    );
  }

  if (!currentProblem) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-600 text-lg">No problems available</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Practice Time!</Text>
        <View className="flex-row items-center">
          <View className="flex-1">
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-green-500"
                style={{ width: `${(completedProblems.size / totalProblems) * 100}%` }}
              />
            </View>
          </View>
          <Text className="text-gray-600 ml-3 font-semibold">
            {completedProblems.size}/{totalProblems}
          </Text>
        </View>
      </View>

      {/* Problem Card */}
      <ProblemCard
        problem={currentProblem}
        problemNumber={currentProblemIndex + 1}
        totalProblems={totalProblems}
        hintsEnabled={true}
        onCorrect={handleCorrectAnswer}
        onIncorrect={handleIncorrectAnswer}
        onRequestHint={handleRequestHint}
        studentGrade={lesson.grade}
      />

      {/* Encouragement Footer */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <Text className="text-center text-gray-600 text-base">
          {completedProblems.size === 0
            ? '🌟 You\'re doing great! Take your time.'
            : completedProblems.size < totalProblems / 2
            ? '💪 Keep it up! You\'re making progress!'
            : completedProblems.size < totalProblems
            ? '🚀 Almost there! You\'re doing awesome!'
            : '🎉 Amazing work! You completed all the problems!'}
        </Text>
      </View>
    </View>
  );
}
