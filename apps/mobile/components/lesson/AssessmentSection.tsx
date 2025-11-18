import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';
import type { AssessmentSection as AssessmentSectionType, Lesson, Problem, Answer } from '@homeschool-ai/curriculum';
import type { AIHint, AITutorContext } from '@homeschool-ai/ai';
import { createAITutor } from '@homeschool-ai/ai';
import ProblemCard from './ProblemCard';

interface AssessmentSectionProps {
  section: AssessmentSectionType;
  lesson: Lesson;
  onComplete: (score: number) => void;
}

export default function AssessmentSection({ section, lesson, onComplete }: AssessmentSectionProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [aiTutor, setAiTutor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const totalProblems = section.problems;
  const passingThreshold = section.mastery_threshold;
  const hintsEnabled = section.ai_tutor_enabled;
  const currentProblem = problems[currentProblemIndex];

  // Celebration animations
  const celebrationScale = useSharedValue(0);
  const celebrationRotation = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);

  useEffect(() => {
    initializeAssessment();
  }, []);

  const initializeAssessment = async () => {
    try {
      // Initialize AI tutor if enabled
      if (section.ai_tutor_enabled) {
        const tutor = await createAITutor({ mode: 'auto' });
        setAiTutor(tutor);
      }

      // Generate assessment problems
      const generatedProblems = generateAssessmentProblems();
      setProblems(generatedProblems);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing assessment:', error);
      const generatedProblems = generateAssessmentProblems();
      setProblems(generatedProblems);
      setIsLoading(false);
    }
  };

  const generateAssessmentProblems = (): Problem[] => {
    const problems: Problem[] = [];
    const problemTypes = ['addition', 'subtraction', 'multiplication'];

    for (let i = 0; i < totalProblems; i++) {
      const type = problemTypes[i % problemTypes.length];
      problems.push(generateProblem(type, i));
    }

    return problems;
  };

  const generateProblem = (type: string, index: number): Problem => {
    if (type === 'addition') {
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 50) + 10;
      return {
        id: `assessment-${index}`,
        type: 'addition',
        question: `What is ${a} + ${b}?`,
        correct_answer: String(a + b),
        explanation: `${a} + ${b} = ${a + b}`,
        difficulty: 0.6,
      };
    } else if (type === 'subtraction') {
      const a = Math.floor(Math.random() * 80) + 20;
      const b = Math.floor(Math.random() * (a - 10)) + 1;
      return {
        id: `assessment-${index}`,
        type: 'subtraction',
        question: `What is ${a} - ${b}?`,
        correct_answer: String(a - b),
        explanation: `${a} - ${b} = ${a - b}`,
        difficulty: 0.6,
      };
    } else {
      const a = Math.floor(Math.random() * 10) + 2;
      const b = Math.floor(Math.random() * 10) + 2;
      return {
        id: `assessment-${index}`,
        type: 'multiplication',
        question: `What is ${a} × ${b}?`,
        correct_answer: String(a * b),
        explanation: `${a} × ${b} = ${a * b}`,
        difficulty: 0.6,
      };
    }
  };

  const handleCorrectAnswer = (answer: Answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    // Move to next problem or show results
    if (currentProblemIndex < totalProblems - 1) {
      setTimeout(() => {
        setCurrentProblemIndex((prev) => prev + 1);
      }, 2000);
    } else {
      // Assessment complete - calculate score
      setTimeout(() => {
        calculateAndShowResults(newAnswers);
      }, 2000);
    }
  };

  const handleIncorrectAnswer = (answer: Answer) => {
    setAnswers((prev) => [...prev, answer]);
  };

  const calculateAndShowResults = (allAnswers: Answer[]) => {
    // Get only the final answers (last attempt per problem)
    const finalAnswers = new Map<string, Answer>();
    allAnswers.forEach(answer => {
      finalAnswers.set(answer.problem_id, answer);
    });

    const correctCount = Array.from(finalAnswers.values()).filter(a => a.is_correct).length;
    const score = Math.round((correctCount / totalProblems) * 100);
    setFinalScore(score);
    setShowResults(true);

    // Trigger celebration if passed
    if (score >= passingThreshold * 100) {
      triggerCelebration();
    }
  };

  const triggerCelebration = () => {
    celebrationScale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );
    celebrationRotation.value = withSequence(
      withTiming(360, { duration: 1000, easing: Easing.out(Easing.ease) }),
      withTiming(0, { duration: 0 })
    );
    confettiOpacity.value = withSequence(
      withTiming(1, { duration: 500 }),
      withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) })
    );
  };

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: celebrationScale.value },
      { rotate: `${celebrationRotation.value}deg` }
    ],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  const handleRequestHint = async (level: number): Promise<AIHint> => {
    if (!aiTutor || !hintsEnabled) {
      return {
        hint_text: 'Think carefully about the problem. You can do this!',
        hint_level: level,
      };
    }

    try {
      const context: AITutorContext = {
        problem: currentProblem,
        previous_attempts: answers.filter(a => a.problem_id === currentProblem.id),
        student_age: 10,
        student_grade: lesson.grade,
        topic: lesson.subject,
      };

      return await aiTutor.generateHint(context, level);
    } catch (error) {
      console.error('Error generating hint:', error);
      return {
        hint_text: 'Break the problem into smaller steps and try again!',
        hint_level: level,
      };
    }
  };

  const handleRetry = () => {
    setCurrentProblemIndex(0);
    setAnswers([]);
    setShowResults(false);
    setFinalScore(0);
    const newProblems = generateAssessmentProblems();
    setProblems(newProblems);
  };

  const handleFinish = () => {
    onComplete(finalScore);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 text-lg mt-4">Preparing your assessment...</Text>
      </View>
    );
  }

  if (showResults) {
    const passed = finalScore >= passingThreshold * 100;
    const correctCount = Math.round((finalScore / 100) * totalProblems);

    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        {passed && (
          <Animated.View
            style={[confettiStyle]}
            className="absolute inset-0 items-center justify-center"
          >
            <Text className="text-9xl">🎉</Text>
          </Animated.View>
        )}

        <Animated.View style={[celebrationStyle]} className="items-center">
          <Text className="text-8xl mb-6">
            {passed ? '🏆' : '📚'}
          </Text>
          <Text className="text-4xl font-bold text-gray-800 mb-4 text-center">
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </Text>
          <Text className="text-6xl font-bold mb-6" style={{ color: passed ? '#10B981' : '#F59E0B' }}>
            {finalScore}%
          </Text>
        </Animated.View>

        <View className="bg-white rounded-2xl p-6 mb-6 w-full shadow-lg">
          <Text className="text-2xl text-gray-700 text-center mb-4">
            You got {correctCount} out of {totalProblems} correct!
          </Text>
          <Text className="text-lg text-gray-600 text-center">
            {passed
              ? `Amazing work! You've mastered this lesson with ${finalScore}%!`
              : `You need ${Math.round(passingThreshold * 100)}% to pass. Don't give up - you can do this!`}
          </Text>
        </View>

        <View className="w-full space-y-3">
          {passed ? (
            <TouchableOpacity
              onPress={handleFinish}
              className="bg-green-500 py-4 rounded-full shadow-lg"
            >
              <Text className="text-white text-2xl font-bold text-center">
                Complete Lesson
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={handleRetry}
                className="bg-blue-500 py-4 rounded-full shadow-lg"
              >
                <Text className="text-white text-2xl font-bold text-center">
                  Try Again
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFinish}
                className="bg-gray-400 py-4 rounded-full"
              >
                <Text className="text-white text-xl font-semibold text-center">
                  Continue Anyway
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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
        <Text className="text-2xl font-bold text-gray-800 mb-2">Final Assessment</Text>
        <View className="flex-row items-center">
          <View className="flex-1">
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-500"
                style={{ width: `${(answers.filter(a => a.is_correct).length / totalProblems) * 100}%` }}
              />
            </View>
          </View>
          <Text className="text-gray-600 ml-3 font-semibold">
            {currentProblemIndex + 1}/{totalProblems}
          </Text>
        </View>
        <Text className="text-gray-500 text-sm mt-2">
          Passing score: {Math.round(passingThreshold * 100)}%
        </Text>
      </View>

      {/* Problem Card */}
      <ProblemCard
        problem={currentProblem}
        problemNumber={currentProblemIndex + 1}
        totalProblems={totalProblems}
        hintsEnabled={hintsEnabled}
        onCorrect={handleCorrectAnswer}
        onIncorrect={handleIncorrectAnswer}
        onRequestHint={hintsEnabled ? handleRequestHint : undefined}
        studentGrade={lesson.grade}
      />

      {/* Footer */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <Text className="text-center text-gray-600 text-base">
          {currentProblemIndex === 0
            ? '🎯 Take your time and do your best!'
            : currentProblemIndex < totalProblems / 2
            ? '💪 You\'re doing great! Keep going!'
            : '🌟 Almost done! You\'ve got this!'}
        </Text>
      </View>
    </View>
  );
}
