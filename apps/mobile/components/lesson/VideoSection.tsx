import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import type { VideoSection as VideoSectionType } from '@homeschool-ai/curriculum';

interface VideoSectionProps {
  section: VideoSectionType;
  onComplete: () => void;
}

export default function VideoSection({ section, onComplete }: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<Video>(null);

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);
    setIsPlaying(status.isPlaying);

    // Calculate progress
    if (status.durationMillis && status.positionMillis) {
      const progress = (status.positionMillis / status.durationMillis) * 100;
      setWatchProgress(progress);

      // Mark as watched if 90% complete
      if (progress >= 90 && !hasWatched) {
        setHasWatched(true);
      }
    }

    // Auto-complete when video ends
    if (status.didJustFinish && !hasWatched) {
      setHasWatched(true);
    }
  };

  const handleMarkComplete = () => {
    onComplete();
  };

  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const isYouTubeUrl = section.content.video_url.includes('youtube.com') ||
                       section.content.video_url.includes('youtu.be');

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center p-4">
        {/* Video Player */}
        <View className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-4 shadow-lg">
          {isYouTubeUrl ? (
            // YouTube placeholder - would need expo-youtube or WebView
            <View className="flex-1 items-center justify-center">
              <Text className="text-white text-lg mb-4">YouTube Video</Text>
              <Text className="text-white text-sm text-center px-4">
                YouTube video playback requires expo-youtube package
              </Text>
              <TouchableOpacity
                onPress={() => setHasWatched(true)}
                className="mt-4 bg-red-600 px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold">Mark as Watched</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Video
                ref={videoRef}
                source={{ uri: section.content.video_url }}
                style={{ width: '100%', height: '100%' }}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls={false}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                isLooping={false}
              />
              {isLoading && (
                <View className="absolute inset-0 items-center justify-center bg-black/50">
                  <ActivityIndicator size="large" color="#3B82F6" />
                </View>
              )}
            </>
          )}
        </View>

        {/* Play/Pause Controls */}
        {!isYouTubeUrl && (
          <TouchableOpacity
            onPress={handlePlayPause}
            className="bg-blue-500 px-12 py-4 rounded-full shadow-lg mb-4"
            accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
          >
            <Text className="text-white text-2xl font-bold">
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Progress Bar */}
        {!isYouTubeUrl && watchProgress > 0 && (
          <View className="w-full mb-4">
            <View className="h-2 bg-gray-300 rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-500"
                style={{ width: `${watchProgress}%` }}
              />
            </View>
            <Text className="text-gray-600 text-sm text-center mt-2">
              {Math.round(watchProgress)}% watched
            </Text>
          </View>
        )}

        {/* Video Info */}
        <View className="w-full bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-gray-700 text-lg mb-2">
            Duration: {section.duration}
          </Text>
          {section.content.transcript && (
            <Text className="text-gray-600 text-sm">
              Transcript available
            </Text>
          )}
        </View>

        {/* Complete Button */}
        {hasWatched && (
          <TouchableOpacity
            onPress={handleMarkComplete}
            className="bg-green-500 px-8 py-4 rounded-full shadow-lg"
            accessibilityLabel="Mark section as complete"
          >
            <Text className="text-white text-xl font-bold">
              ✓ Continue to Next Section
            </Text>
          </TouchableOpacity>
        )}

        {!hasWatched && (
          <View className="bg-yellow-100 px-6 py-3 rounded-full">
            <Text className="text-yellow-800 font-semibold">
              Watch the video to continue
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
