import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { createSupabaseClient } from '@homeschool-ai/database';
import type { Student } from '@homeschool-ai/database';

const AVATAR_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

export default function SelectStudentScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const supabase = createSupabaseClient(
        process.env.EXPO_PUBLIC_SUPABASE_URL!,
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }

      // Get family ID
      const { data: family } = await supabase
        .from('families')
        .select('id')
        .eq('parent_email', user.email)
        .single();

      if (!family) {
        Alert.alert('Error', 'Family not found');
        return;
      }

      // Get students
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .eq('family_id', family.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setStudents(studentsData || []);
    } catch (error: any) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = (student: Student) => {
    // Store selected student ID in AsyncStorage or Zustand
    // For now, just navigate to home
    router.replace('/(app)/home');
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-600 text-lg">Loading students...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="py-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Who's Learning Today?
          </Text>
          <Text className="text-lg text-gray-600">
            Select a student to continue
          </Text>
        </View>

        {/* Students List */}
        {students.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-6xl mb-4">👨‍👩‍👧‍👦</Text>
            <Text className="text-xl font-semibold text-gray-900 mb-2">
              No Students Yet
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Add your first student to get started
            </Text>
            <TouchableOpacity
              className="bg-blue-500 rounded-xl px-8 py-4"
              onPress={() => router.push('/(auth)/add-student')}
            >
              <Text className="text-white text-lg font-semibold">
                Add Student
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            {students.map((student, index) => (
              <TouchableOpacity
                key={student.id}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 active:bg-gray-50"
                onPress={() => selectStudent(student)}
              >
                <View className="flex-row items-center">
                  {/* Avatar */}
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: student.avatar_color || AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                  >
                    <Text className="text-white text-2xl font-bold">
                      {getInitials(student.first_name)}
                    </Text>
                  </View>

                  {/* Info */}
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-900">
                      {student.first_name}
                    </Text>
                    <Text className="text-gray-600 text-base">
                      Grade {student.grade_level} • Age {student.age}
                    </Text>
                  </View>

                  {/* Arrow */}
                  <Text className="text-gray-400 text-2xl">→</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Add Another Student */}
            <TouchableOpacity
              className="bg-blue-50 border-2 border-blue-200 border-dashed rounded-2xl p-6 active:bg-blue-100"
              onPress={() => router.push('/(auth)/add-student')}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-blue-500 text-4xl mr-3">+</Text>
                <Text className="text-blue-500 text-lg font-semibold">
                  Add Another Student
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Parent Dashboard Link */}
        <TouchableOpacity
          className="mt-8 mb-6"
          onPress={() => {
            // Navigate to parent dashboard (web view or separate screen)
            Alert.alert('Coming Soon', 'Parent dashboard is coming soon!');
          }}
        >
          <Text className="text-center text-blue-500 font-semibold">
            View Parent Dashboard →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
