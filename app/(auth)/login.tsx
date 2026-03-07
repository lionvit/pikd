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
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';

type Mode = 'signin' | 'signup';

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        Alert.alert(
          'Check your email',
          'We sent you a confirmation link. Click it then come back to sign in.',
          [{ text: 'OK', onPress: () => setMode('signin') }]
        );
      }
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Text style={{ fontSize: 52, fontWeight: '900', color: Colors.tint, marginBottom: 6 }}>
          pikd
        </Text>
        <Text style={{ fontSize: 15, color: Colors.textSecondary, marginBottom: 48 }}>
          vote on the best photos
        </Text>

        {/* Social buttons (stubbed — wired in #27 and #28) */}
        <SocialButton
          label="Continue with Google"
          icon="G"
          iconColor="#EA4335"
          onPress={() => Alert.alert('Coming soon', 'Google sign-in is being set up.')}
        />
        {Platform.OS === 'ios' && (
          <SocialButton
            label="Continue with Apple"
            icon=""
            iconColor={Colors.text}
            onPress={() => Alert.alert('Coming soon', 'Apple sign-in is being set up.')}
            style={{ marginTop: 12 }}
          />
        )}

        {/* Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 28 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
          <Text style={{ color: Colors.tabIconDefault, fontSize: 12, marginHorizontal: 12 }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
        </View>

        {/* Email/password */}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={Colors.tabIconDefault}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={inputStyle}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={Colors.tabIconDefault}
          secureTextEntry
          style={[inputStyle, { marginTop: 12 }]}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          style={{
            backgroundColor: Colors.tint,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginTop: 20,
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Toggle mode */}
        <TouchableOpacity
          onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          style={{ alignItems: 'center', paddingVertical: 16 }}
        >
          <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={{ color: Colors.tint, fontWeight: '700' }}>
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SocialButton({
  label,
  icon,
  iconColor,
  onPress,
  style,
}: {
  label: string;
  icon: string;
  iconColor: string;
  onPress: () => void;
  style?: object;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.card,
          borderWidth: 1,
          borderColor: Colors.border,
          borderRadius: 12,
          paddingVertical: 14,
          gap: 10,
        },
        style,
      ]}
    >
      <Text style={{ color: iconColor, fontSize: 16, fontWeight: '700', width: 20, textAlign: 'center' }}>
        {icon}
      </Text>
      <Text style={{ color: Colors.text, fontSize: 15, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}

const inputStyle = {
  backgroundColor: Colors.card,
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 16,
  color: Colors.text,
} as const;
