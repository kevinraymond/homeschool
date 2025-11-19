import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { createSupabaseClient } from '@homeschool-ai/database';

export default function WelcomeScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createSupabaseClient(
        process.env.EXPO_PUBLIC_SUPABASE_URL!,
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // User is logged in, go to student selector
        router.replace('/(auth)/select-student');
      } else {
        // Not logged in, show welcome screen
        setChecking(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <View className="flex-1 bg-blue-500 items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue-500 items-center justify-center px-8">
      <View className="items-center mb-12">
        <Text className="text-5xl mb-4">🎓</Text>
        <Text className="text-4xl font-bold text-white mb-3">
          Homeschool AI
        </Text>
        <Text className="text-lg text-white/90 text-center">
          AI-powered learning for K-6 students
        </Text>
      </View>

      <View className="w-full max-w-sm">
        <TouchableOpacity
          className="bg-white rounded-2xl py-4 px-8 mb-4 shadow-lg"
          onPress={() => router.push('/(auth)/signup')}
        >
          <Text className="text-blue-600 text-center text-lg font-semibold">
            Get Started Free
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border-2 border-white rounded-2xl py-4 px-8"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-white text-center text-lg font-semibold">
            Sign In
          </Text>
        </TouchableOpacity>
      </View>

      <View className="absolute bottom-8">
        <Text className="text-white/70 text-sm text-center">
          🔒 Privacy-first · 🤖 Local AI · 👨‍👩‍👧‍👦 Multi-child
        </Text>
      </View>
    </View>
  );
}
