import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import type { Problem, Answer } from '@homeschool-ai/curriculum';
import type { AIHint, AIFeedback } from '@homeschool-ai/ai';

interface ProblemCardProps {
  problem: Problem;
  problemNumber: number;
  totalProblems: number;
  hintsEnabled?: boolean;
  onCorrect: (answer: Answer) => void;
  onIncorrect?: (answer: Answer) => void;
  onRequestHint?: (level: number) => Promise<AIHint>;
  studentAge?: number;
  studentGrade?: number;
}

export default function ProblemCard({
  problem,
  problemNumber,
  totalProblems,
  hintsEnabled = true,
  onCorrect,
  onIncorrect,
  onRequestHint,
  studentAge = 10,
  studentGrade = 5,
}: ProblemCardProps) {
  const [answer, setAnswer] = useState('');
  const [currentHint, setCurrentHint] = useState<AIHint | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [startTime] = useState(Date.now());

  // Animations
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const successAnimation = useRef(new Animated.Value(0)).current;

  const maxHints = 3;
  const canRequestHint = hintsEnabled && hintsUsed < maxHints && !isSubmitted;

  // Shake animation for incorrect answer
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Success animation
  const triggerSuccess = () => {
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 1.1,
        useNativeDriver: true,
      }),
      Animated.timing(successAnimation, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });
  };

  const checkAnswer = (studentAnswer: string): boolean => {
    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '');
    return normalize(problem.correct_answer) === normalize(studentAnswer);
  };

  const handleSubmit = () => {
    if (!answer.trim()) return;

    const correct = checkAnswer(answer);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    const answerObj: Answer = {
      problem_id: problem.id,
      student_answer: answer,
      is_correct: correct,
      time_spent_seconds: timeSpent,
      hints_used: hintsUsed,
      timestamp: new Date().toISOString(),
    };

    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      setFeedback(getEncouragingMessage(true, hintsUsed));
      triggerSuccess();
      setTimeout(() => {
        onCorrect(answerObj);
      }, 2000);
    } else {
      setFeedback(getEncouragingMessage(false, hintsUsed));
      triggerShake();
      if (onIncorrect) {
        onIncorrect(answerObj);
      }
    }
  };

  const handleRequestHint = async (level: number) => {
    if (!onRequestHint || !canRequestHint) return;

    setIsLoadingHint(true);
    try {
      const hint = await onRequestHint(level);
      setCurrentHint(hint);
      setHintsUsed((prev) => prev + 1);
    } catch (error) {
      console.error('Error getting hint:', error);
      setCurrentHint({
        hint_text: 'Think about what the question is asking. Break it down into smaller steps!',
        hint_level: level,
      });
      setHintsUsed((prev) => prev + 1);
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleTryAgain = () => {
    setAnswer('');
    setIsSubmitted(false);
    setIsCorrect(null);
    setFeedback(null);
  };

  const getEncouragingMessage = (correct: boolean, hints: number): string => {
    if (correct) {
      if (hints === 0) {
        return '🌟 Excellent! You got it on your own!';
      } else if (hints === 1) {
        return '👍 Great job! Nice problem solving!';
      } else {
        return '✨ You did it! Keep practicing!';
      }
    } else {
      return '💪 Not quite! Give it another try - you can do this!';
    }
  };

  const getHintButtonText = (level: number): string => {
    switch (level) {
      case 1:
        return '💡 Small Hint';
      case 2:
        return '🔍 Bigger Hint';
      case 3:
        return '🎯 Big Hint';
      default:
        return '💡 Hint';
    }
  };

  const getHintButtonColor = (level: number): string => {
    if (hintsUsed >= level) return 'bg-gray-300';
    return level === 1 ? 'bg-yellow-400' : level === 2 ? 'bg-yellow-500' : 'bg-yellow-600';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <Animated.View
        style={{
          transform: [
            { translateX: shakeAnimation },
            { scale: scaleAnimation },
          ],
        }}
        className="flex-1 p-6"
      >
        {/* Problem Header */}
        <View className="mb-6">
          <Text className="text-gray-500 text-lg mb-2">
            Problem {problemNumber} of {totalProblems}
          </Text>
          <View className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
            <Text className="text-2xl text-gray-800 leading-9">
              {problem.question}
            </Text>
          </View>
        </View>

        {/* Answer Input */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-2">
            Your Answer:
          </Text>
          <TextInput
            value={answer}
            onChangeText={setAnswer}
            placeholder="Type your answer here"
            keyboardType="numeric"
            className="bg-white border-2 border-gray-300 rounded-xl px-6 py-4 text-2xl"
            editable={!isSubmitted}
            accessibilityLabel="Answer input field"
            autoFocus
          />
        </View>

        {/* Hint Display */}
        {currentHint && (
          <View className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
            <Text className="text-gray-700 text-lg leading-7">
              {currentHint.hint_text}
            </Text>
          </View>
        )}

        {/* Feedback Display */}
        {feedback && (
          <Animated.View
            style={{
              opacity: successAnimation,
            }}
            className={`mb-6 rounded-xl p-4 ${
              isCorrect ? 'bg-green-50 border-2 border-green-400' : 'bg-orange-50 border-2 border-orange-400'
            }`}
          >
            <Text
              className={`text-xl font-bold text-center ${
                isCorrect ? 'text-green-700' : 'text-orange-700'
              }`}
            >
              {feedback}
            </Text>
            {isCorrect && problem.explanation && (
              <Text className="text-gray-700 text-base mt-2 text-center">
                {problem.explanation}
              </Text>
            )}
          </Animated.View>
        )}

        {/* Hint Buttons */}
        {hintsEnabled && !isSubmitted && (
          <View className="mb-6">
            <Text className="text-gray-600 text-sm mb-2 text-center">
              Need help? Try a hint! ({hintsUsed}/{maxHints} used)
            </Text>
            <View className="flex-row justify-center space-x-2">
              {[1, 2, 3].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => handleRequestHint(level)}
                  disabled={hintsUsed >= level || isLoadingHint}
                  className={`px-4 py-3 rounded-full ${getHintButtonColor(level)} ${
                    hintsUsed >= level ? 'opacity-50' : ''
                  }`}
                  accessibilityLabel={`Request hint level ${level}`}
                >
                  {isLoadingHint && hintsUsed + 1 === level ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold">
                      {getHintButtonText(level)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Submit/Try Again Button */}
        <View className="mt-auto">
          {!isSubmitted ? (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!answer.trim()}
              className={`py-4 rounded-full ${
                answer.trim() ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              accessibilityLabel="Submit answer"
            >
              <Text
                className={`text-center text-2xl font-bold ${
                  answer.trim() ? 'text-white' : 'text-gray-500'
                }`}
              >
                Submit Answer
              </Text>
            </TouchableOpacity>
          ) : (
            !isCorrect && (
              <TouchableOpacity
                onPress={handleTryAgain}
                className="bg-orange-500 py-4 rounded-full"
                accessibilityLabel="Try again"
              >
                <Text className="text-white text-center text-2xl font-bold">
                  Try Again
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
