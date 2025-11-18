import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import type { Lesson, LessonSection } from '@homeschool-ai/curriculum';
import VideoSection from './VideoSection';
import InteractiveSection from './InteractiveSection';
import PracticeSection from './PracticeSection';
import AssessmentSection from './AssessmentSection';

interface LessonPlayerProps {
  lesson: Lesson;
  onComplete?: (lessonId: string, score: number) => void;
  onProgress?: (lessonId: string, sectionIndex: number, progress: number) => void;
}

export default function LessonPlayer({ lesson, onComplete, onProgress }: LessonPlayerProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionProgress, setSectionProgress] = useState<{ [key: number]: number }>({});
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const translateX = useSharedValue(0);
  const screenWidth = Dimensions.get('window').width;

  const currentSection = lesson.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === lesson.sections.length - 1;
  const isFirstSection = currentSectionIndex === 0;

  // Handle section completion
  const handleSectionComplete = (sectionIndex: number, score?: number) => {
    const newCompleted = new Set(completedSections);
    newCompleted.add(sectionIndex);
    setCompletedSections(newCompleted);

    // Update progress
    const newProgress = { ...sectionProgress, [sectionIndex]: 100 };
    setSectionProgress(newProgress);

    // Report progress
    if (onProgress) {
      onProgress(lesson.id, sectionIndex, 100);
    }

    // Move to next section if not last
    if (!isLastSection) {
      setTimeout(() => {
        goToNextSection();
      }, 1000);
    } else {
      // Lesson complete
      const overallScore = score || 100;
      if (onComplete) {
        onComplete(lesson.id, overallScore);
      }
    }
  };

  const goToNextSection = () => {
    if (!isLastSection) {
      setCurrentSectionIndex((prev) => prev + 1);
    }
  };

  const goToPreviousSection = () => {
    if (!isFirstSection) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  };

  // Swipe gesture handling
  const onGestureEvent = (event: any) => {
    if (event.nativeEvent.translationX > 100 && !isFirstSection) {
      runOnJS(goToPreviousSection)();
    } else if (event.nativeEvent.translationX < -100 && !isLastSection && completedSections.has(currentSectionIndex)) {
      runOnJS(goToNextSection)();
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(translateX.value) }],
    };
  });

  const renderSection = () => {
    const section = currentSection;

    switch (section.type) {
      case 'video':
        return (
          <VideoSection
            section={section}
            onComplete={() => handleSectionComplete(currentSectionIndex)}
          />
        );
      case 'interactive':
        return (
          <InteractiveSection
            section={section}
            onComplete={() => handleSectionComplete(currentSectionIndex)}
          />
        );
      case 'practice':
        return (
          <PracticeSection
            section={section}
            lesson={lesson}
            onComplete={() => handleSectionComplete(currentSectionIndex)}
          />
        );
      case 'assessment':
        return (
          <AssessmentSection
            section={section}
            lesson={lesson}
            onComplete={(score) => handleSectionComplete(currentSectionIndex, score)}
          />
        );
      default:
        return (
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg text-gray-500">Unknown section type</Text>
          </View>
        );
    }
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-4 pt-12 pb-4 bg-blue-500">
          <Text className="text-white text-2xl font-bold mb-2">{lesson.title}</Text>
          <Text className="text-white text-sm opacity-90">
            Section {currentSectionIndex + 1} of {lesson.sections.length}
          </Text>
        </View>

        {/* Section Content */}
        <PanGestureHandler onGestureEvent={onGestureEvent}>
          <Animated.View style={[animatedStyle, { flex: 1 }]}>
            {renderSection()}
          </Animated.View>
        </PanGestureHandler>

        {/* Progress Dots */}
        <View className="py-6 px-4 bg-white border-t border-gray-200">
          <View className="flex-row justify-center items-center space-x-2">
            {lesson.sections.map((_, index) => (
              <View
                key={index}
                className={`h-3 rounded-full ${
                  completedSections.has(index)
                    ? 'bg-green-500 w-3'
                    : index === currentSectionIndex
                    ? 'bg-blue-500 w-8'
                    : 'bg-gray-300 w-3'
                }`}
              />
            ))}
          </View>

          {/* Navigation Buttons */}
          <View className="flex-row justify-between mt-4">
            <TouchableOpacity
              onPress={goToPreviousSection}
              disabled={isFirstSection}
              className={`px-6 py-3 rounded-full ${
                isFirstSection ? 'bg-gray-300' : 'bg-blue-500'
              }`}
            >
              <Text className={`text-lg font-semibold ${
                isFirstSection ? 'text-gray-500' : 'text-white'
              }`}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goToNextSection}
              disabled={isLastSection || !completedSections.has(currentSectionIndex)}
              className={`px-6 py-3 rounded-full ${
                isLastSection || !completedSections.has(currentSectionIndex)
                  ? 'bg-gray-300'
                  : 'bg-blue-500'
              }`}
            >
              <Text className={`text-lg font-semibold ${
                isLastSection || !completedSections.has(currentSectionIndex)
                  ? 'text-gray-500'
                  : 'text-white'
              }`}>
                {isLastSection ? 'Complete' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
