import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LessonsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-6xl mb-4">📚</Text>
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Lessons Coming Soon
        </Text>
        <Text className="text-gray-600 text-center">
          This is where you'll see all available lessons and curriculum
        </Text>
      </View>
    </SafeAreaView>
  );
}
