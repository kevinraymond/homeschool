import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { createSupabaseClient } from '@homeschool-ai/database';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!email || !password || !confirmPassword || !familyName) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Initialize Supabase client
      const supabase = createSupabaseClient(
        process.env.EXPO_PUBLIC_SUPABASE_URL!,
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create family record
      const { error: familyError } = await supabase
        .from('families')
        .insert({
          parent_email: email,
          subscription_tier: 'free',
          privacy_mode: 'cloud_sync',
        });

      if (familyError) throw familyError;

      Alert.alert(
        'Success!',
        'Account created successfully. Please check your email to confirm your account.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert('Signup Failed', error.message || 'An error occurred during signup');
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
        <View className="flex-1 px-6 justify-center">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-gray-900 mb-2">
              Welcome! 👋
            </Text>
            <Text className="text-lg text-gray-600">
              Create your family account to get started
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Family Name
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="The Smith Family"
                value={familyName}
                onChangeText={setFamilyName}
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Parent Email
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="parent@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="At least 6 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            className={`mt-6 rounded-xl py-4 ${
              loading ? 'bg-blue-300' : 'bg-blue-500'
            }`}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="mt-6 flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="text-blue-500 font-semibold">Log In</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Note */}
          <View className="mt-8 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <Text className="text-sm text-blue-900 text-center">
              🔒 Your data is encrypted and protected. We only collect what's needed for learning.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
