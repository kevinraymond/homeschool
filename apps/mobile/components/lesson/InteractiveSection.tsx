import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import type { InteractiveSection as InteractiveSectionType } from '@homeschool-ai/curriculum';

interface InteractiveSectionProps {
  section: InteractiveSectionType;
  onComplete: () => void;
}

// Mock slide data - in real implementation, this would come from section.props
const MOCK_SLIDES = [
  {
    id: 1,
    type: 'title',
    title: 'Understanding Fractions',
    subtitle: 'Let\'s learn about parts of a whole!',
    emoji: '🍕',
  },
  {
    id: 2,
    type: 'concept',
    title: 'What is a fraction?',
    content: 'A fraction represents a part of a whole. The top number (numerator) tells us how many parts we have, and the bottom number (denominator) tells us how many equal parts make up the whole.',
    image: null,
  },
  {
    id: 3,
    type: 'example',
    title: 'Example: Pizza Slices',
    content: 'If a pizza is cut into 8 equal slices and you eat 3 slices, you ate 3/8 of the pizza.',
    emoji: '🍕',
  },
  {
    id: 4,
    type: 'summary',
    title: 'Great job!',
    content: 'You\'ve learned the basics of fractions. Ready to practice?',
    emoji: '⭐',
  },
];

export default function InteractiveSection({ section, onComplete }: InteractiveSectionProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const translateX = useSharedValue(0);
  const screenWidth = Dimensions.get('window').width;

  // Use mock slides or parse from section.props
  const slides = section.props?.slides || MOCK_SLIDES;
  const isLastSlide = currentSlideIndex === slides.length - 1;
  const isFirstSlide = currentSlideIndex === 0;

  const goToNextSlide = () => {
    if (!isLastSlide) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const goToPreviousSlide = () => {
    if (!isFirstSlide) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const onGestureEvent = (event: any) => {
    const translation = event.nativeEvent.translationX;

    if (translation > 100 && !isFirstSlide) {
      runOnJS(goToPreviousSlide)();
    } else if (translation < -100 && !isLastSlide) {
      runOnJS(goToNextSlide)();
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, screenWidth / 2],
      [1, 0.5]
    );

    return {
      opacity: withSpring(opacity),
      transform: [{ translateX: withSpring(translateX.value) }],
    };
  });

  const renderSlide = (slide: any) => {
    switch (slide.type) {
      case 'title':
        return (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-8xl mb-6">{slide.emoji}</Text>
            <Text className="text-4xl font-bold text-gray-800 text-center mb-4">
              {slide.title}
            </Text>
            <Text className="text-xl text-gray-600 text-center">
              {slide.subtitle}
            </Text>
          </View>
        );

      case 'concept':
        return (
          <ScrollView className="flex-1 p-6">
            <Text className="text-3xl font-bold text-gray-800 mb-6">
              {slide.title}
            </Text>
            <Text className="text-xl text-gray-700 leading-8 mb-6">
              {slide.content}
            </Text>
            {slide.image && (
              <Image
                source={{ uri: slide.image }}
                className="w-full h-64 rounded-xl mb-4"
                resizeMode="contain"
              />
            )}
          </ScrollView>
        );

      case 'example':
        return (
          <View className="flex-1 items-center justify-center p-8">
            {slide.emoji && (
              <Text className="text-7xl mb-6">{slide.emoji}</Text>
            )}
            <Text className="text-3xl font-bold text-gray-800 text-center mb-4">
              {slide.title}
            </Text>
            <View className="bg-blue-100 rounded-2xl p-6 mb-4">
              <Text className="text-xl text-gray-700 text-center leading-8">
                {slide.content}
              </Text>
            </View>
          </View>
        );

      case 'summary':
        return (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-8xl mb-6">{slide.emoji}</Text>
            <Text className="text-4xl font-bold text-green-600 text-center mb-4">
              {slide.title}
            </Text>
            <Text className="text-xl text-gray-700 text-center mb-8">
              {slide.content}
            </Text>
          </View>
        );

      default:
        return (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-xl text-gray-700 text-center">
              {slide.content || 'Slide content'}
            </Text>
          </View>
        );
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Slide Content */}
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={[animatedStyle, { flex: 1 }]}>
          {renderSlide(slides[currentSlideIndex])}
        </Animated.View>
      </PanGestureHandler>

      {/* Bottom Controls */}
      <View className="px-6 pb-6">
        {/* Progress Dots */}
        <View className="flex-row justify-center items-center mb-6">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`mx-1 h-2 rounded-full ${
                index === currentSlideIndex
                  ? 'bg-blue-500 w-8'
                  : index < currentSlideIndex
                  ? 'bg-green-500 w-2'
                  : 'bg-gray-300 w-2'
              }`}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={goToPreviousSlide}
            disabled={isFirstSlide}
            className={`px-6 py-3 rounded-full ${
              isFirstSlide ? 'bg-gray-200' : 'bg-blue-500'
            }`}
            accessibilityLabel="Previous slide"
          >
            <Text
              className={`text-lg font-semibold ${
                isFirstSlide ? 'text-gray-400' : 'text-white'
              }`}
            >
              ← Previous
            </Text>
          </TouchableOpacity>

          {!isLastSlide ? (
            <TouchableOpacity
              onPress={goToNextSlide}
              className="bg-blue-500 px-6 py-3 rounded-full"
              accessibilityLabel="Next slide"
            >
              <Text className="text-white text-lg font-semibold">
                Next →
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleComplete}
              className="bg-green-500 px-6 py-3 rounded-full"
              accessibilityLabel="Complete section"
            >
              <Text className="text-white text-lg font-semibold">
                ✓ Complete
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Swipe hint */}
        <Text className="text-gray-400 text-sm text-center mt-4">
          Swipe left or right to navigate
        </Text>
      </View>
    </View>
  );
}
