import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function VerifyScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [status, setStatus] = useState<'waiting' | 'verifying' | 'error'>('waiting');
  const router = useRouter();

  useEffect(() => {
    if (!code) return;
    verifyCode(code);
  }, [code]);

  const verifyCode = async (otpCode: string) => {
    setStatus('verifying');
    try {
      const { error } = await supabase.auth.verifyOtp({
        type: 'magiclink',
        token_hash: otpCode,
      });
      if (error) throw error;
      // Auth state change will trigger route guard to redirect to /(tabs)
    } catch (err: unknown) {
      setStatus('error');
      Alert.alert(
        'Verification failed',
        err instanceof Error ? err.message : 'Invalid or expired link.',
        [{ text: 'Try again', onPress: () => router.replace('/(auth)/login') }]
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0D0D', justifyContent: 'center', alignItems: 'center' }}>
      {status === 'waiting' && (
        <>
          <Text style={{ fontSize: 32, marginBottom: 16 }}>📬</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
            Check your email
          </Text>
          <Text style={{ color: '#666', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 }}>
            Tap the magic link in your inbox to sign in.
          </Text>
        </>
      )}
      {status === 'verifying' && (
        <>
          <ActivityIndicator color="#FF3CAC" size="large" />
          <Text style={{ color: '#666', marginTop: 16 }}>Signing you in…</Text>
        </>
      )}
      {status === 'error' && (
        <Text style={{ color: '#FF3CAC', fontSize: 16 }}>Verification failed</Text>
      )}
    </View>
  );
}
