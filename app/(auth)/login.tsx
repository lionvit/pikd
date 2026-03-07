import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInAnonymously } = useAuth();
  const router = useRouter();

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      Alert.alert('Enter your email', 'Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      router.push('/(auth)/verify');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0D0D0D' }}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
        <Text style={{ fontSize: 48, fontWeight: '900', color: '#FF3CAC', marginBottom: 8 }}>
          pikd
        </Text>
        <Text style={{ fontSize: 16, color: '#888', marginBottom: 48 }}>
          vote on the best photos
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          placeholderTextColor="#555"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            backgroundColor: '#1A1A1A',
            borderWidth: 1,
            borderColor: '#333',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            color: '#fff',
            marginBottom: 16,
          }}
        />

        <TouchableOpacity
          onPress={handleSendMagicLink}
          disabled={isLoading}
          style={{
            backgroundColor: '#FF3CAC',
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 16,
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
              Send Magic Link
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGuestContinue}
          disabled={isLoading}
          style={{ alignItems: 'center', paddingVertical: 12 }}
        >
          <Text style={{ color: '#666', fontSize: 14 }}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
