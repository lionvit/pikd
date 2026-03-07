import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { UploadForm } from '@/components/upload/UploadForm';
import { PikdButton } from '@/components/ui/PikdButton';
import Colors from '@/constants/Colors';

export default function UploadScreen() {
  const { isGuest } = useAuth();
  const router = useRouter();

  if (isGuest) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>🔒</Text>
        <Text style={{ color: Colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
          Create an account to post
        </Text>
        <Text style={{ color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 32 }}>
          Sign up with your email to share photos and compete for votes.
        </Text>
        <PikdButton label="Create Account" onPress={() => router.push('/(auth)/login')} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ padding: 24, paddingTop: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      <UploadForm />
    </ScrollView>
  );
}
