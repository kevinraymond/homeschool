import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-primary-500 items-center justify-center px-8">
      <View className="items-center mb-12">
        <Text className="text-5xl mb-4">🎓</Text>
        <Text className="text-4xl font-bold text-white mb-3">
          Homeschool AI
        </Text>
        <Text className="text-lg text-white/90 text-center">
          The first AI-native homeschooling platform
        </Text>
      </View>

      <View className="w-full max-w-sm">
        <TouchableOpacity
          className="bg-white rounded-2xl py-4 px-8 mb-4 shadow-lg"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-primary-600 text-center text-lg font-semibold">
            Get Started
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
        <Text className="text-white/70 text-sm">
          Privacy-first · Local AI · Multi-child intelligent
        </Text>
      </View>
    </View>
  );
}
