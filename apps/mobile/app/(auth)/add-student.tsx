import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { createSupabaseClient } from '@homeschool-ai/database';

const AVATAR_COLORS = [
  { color: '#3B82F6', name: 'Blue' },
  { color: '#10B981', name: 'Green' },
  { color: '#F59E0B', name: 'Yellow' },
  { color: '#EF4444', name: 'Red' },
  { color: '#8B5CF6', name: 'Purple' },
  { color: '#EC4899', name: 'Pink' },
];

const GRADES = [
  { value: 0, label: 'Kindergarten' },
  { value: 1, label: 'Grade 1' },
  { value: 2, label: 'Grade 2' },
  { value: 3, label: 'Grade 3' },
  { value: 4, label: 'Grade 4' },
  { value: 5, label: 'Grade 5' },
  { value: 6, label: 'Grade 6' },
];

export default function AddStudentScreen() {
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [gradeLevel, setGradeLevel] = useState<number>(1);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0].color);
  const [loading, setLoading] = useState(false);

  const handleAddStudent = async () => {
    // Validation
    if (!firstName.trim()) {
      Alert.alert('Missing Name', 'Please enter student\'s first name');
      return;
    }

    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 4 || ageNum > 18) {
      Alert.alert('Invalid Age', 'Please enter a valid age (4-18)');
      return;
    }

    setLoading(true);

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
        throw new Error('Family not found');
      }

      // Create student
      const { error } = await supabase
        .from('students')
        .insert({
          family_id: family.id,
          first_name: firstName.trim(),
          age: ageNum,
          grade_level: gradeLevel,
          avatar_color: avatarColor,
          learning_preferences: {
            visual: 0.5,
            audio: 0.5,
            text: 0.5,
          },
        });

      if (error) throw error;

      Alert.alert(
        'Success!',
        `${firstName} has been added to your family`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error adding student:', error);
      Alert.alert('Error', error.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6">
          {/* Header */}
          <View className="py-6">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-blue-500 text-lg mb-4">← Back</Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Add a Student
            </Text>
            <Text className="text-lg text-gray-600">
              Tell us about your child
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-6">
            {/* First Name */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                First Name
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="Emma"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            {/* Age */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Age
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="8"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            {/* Grade Level */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Grade Level
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {GRADES.map((grade) => (
                  <TouchableOpacity
                    key={grade.value}
                    className={`px-4 py-2 rounded-full border-2 ${
                      gradeLevel === grade.value
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}
                    onPress={() => setGradeLevel(grade.value)}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        gradeLevel === grade.value ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {grade.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Avatar Color */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Avatar Color
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {AVATAR_COLORS.map((item) => (
                  <TouchableOpacity
                    key={item.color}
                    className={`w-16 h-16 rounded-full items-center justify-center border-4 ${
                      avatarColor === item.color ? 'border-gray-900' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: item.color }}
                    onPress={() => setAvatarColor(item.color)}
                  >
                    {avatarColor === item.color && (
                      <Text className="text-white text-2xl">✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            className={`mt-8 mb-6 rounded-xl py-4 ${
              loading ? 'bg-blue-300' : 'bg-blue-500'
            }`}
            onPress={handleAddStudent}
            disabled={loading}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {loading ? 'Adding Student...' : 'Add Student'}
            </Text>
          </TouchableOpacity>

          {/* Privacy Note */}
          <View className="mb-6 bg-green-50 rounded-xl p-4 border border-green-200">
            <Text className="text-sm text-green-900 text-center">
              🔒 We only collect first names for privacy. No last names, birthdates, or other personal information.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
