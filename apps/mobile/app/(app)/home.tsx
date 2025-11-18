import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// This will eventually use actual student data from the database
// For now, mock data for UI development
const mockStudents = [
  {
    id: '1',
    first_name: 'Emma',
    grade_level: 3,
    today_status: 'on_track',
    today_lessons: [
      { subject: 'Math', topic: 'Addition', status: 'completed' },
      { subject: 'Reading', topic: 'Chapter 4', status: 'in_progress' }
    ]
  },
  {
    id: '2',
    first_name: 'Lucas',
    grade_level: 5,
    today_status: 'needs_attention',
    today_lessons: [
      { subject: 'Math', topic: 'Fractions', status: 'struggling' },
      { subject: 'Science', topic: 'Ecosystems', status: 'completed' }
    ]
  }
];

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-6 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">
            Good Morning! ☀️
          </Text>
          <Text className="text-gray-600 mt-1">
            Monday, November 18, 2025
          </Text>
        </View>

        {/* Family Overview */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Your Students
          </Text>

          {mockStudents.map((student) => (
            <View
              key={student.id}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-xl font-bold text-gray-900">
                    {student.first_name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Grade {student.grade_level}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    student.today_status === 'on_track'
                      ? 'bg-green-100'
                      : 'bg-orange-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      student.today_status === 'on_track'
                        ? 'text-green-700'
                        : 'text-orange-700'
                    }`}
                  >
                    {student.today_status === 'on_track'
                      ? '✓ On Track'
                      : '⚠ Needs Attention'}
                  </Text>
                </View>
              </View>

              {/* Today's Lessons */}
              <View className="space-y-2">
                {student.today_lessons.map((lesson, idx) => (
                  <View
                    key={idx}
                    className="flex-row items-center justify-between py-2"
                  >
                    <View>
                      <Text className="text-gray-700 font-medium">
                        {lesson.subject}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {lesson.topic}
                      </Text>
                    </View>
                    <View>
                      {lesson.status === 'completed' && (
                        <Text className="text-green-600">✓</Text>
                      )}
                      {lesson.status === 'in_progress' && (
                        <Text className="text-blue-600">→</Text>
                      )}
                      {lesson.status === 'struggling' && (
                        <Text className="text-orange-600">⚠</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity className="mt-4 bg-primary-500 rounded-xl py-3">
                <Text className="text-white text-center font-semibold">
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* AI Insight Card */}
        <View className="px-6 pb-6">
          <View className="bg-primary-50 rounded-2xl p-5 border border-primary-200">
            <Text className="text-lg font-semibold text-primary-900 mb-2">
              💡 Family Learning Insight
            </Text>
            <Text className="text-primary-800">
              Emma and Lucas both learn math best in the morning (9-11am).
              Consider scheduling math lessons during this time for better results.
            </Text>
            <TouchableOpacity className="mt-3">
              <Text className="text-primary-600 font-semibold">
                Apply Suggestion →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
