import { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { useUpload } from '@/hooks/useUpload';
import { PikdButton } from '@/components/ui/PikdButton';
import Colors from '@/constants/Colors';

interface UploadFormProps {
  onSuccess?: () => void;
}

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [caption, setCaption] = useState('');
  const { isLoading, error, pickAndUpload } = useUpload();

  const handleUpload = async () => {
    const success = await pickAndUpload(caption);
    if (success) {
      setCaption('');
      Alert.alert('Posted!', 'Your photo is live for 24 hours.');
      onSuccess?.();
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <Text style={{ color: Colors.text, fontSize: 20, fontWeight: '700' }}>Share a photo</Text>
      <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>
        Photos expire after 24 hours. The one with the most votes wins.
      </Text>

      <TextInput
        value={caption}
        onChangeText={setCaption}
        placeholder="Add a caption (optional)"
        placeholderTextColor={Colors.tabIconDefault}
        multiline
        maxLength={120}
        style={{
          backgroundColor: Colors.card,
          borderWidth: 1,
          borderColor: Colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 15,
          color: Colors.text,
          minHeight: 80,
          textAlignVertical: 'top',
        }}
      />

      {error ? (
        <Text style={{ color: Colors.red, fontSize: 13 }}>{error}</Text>
      ) : null}

      <PikdButton label="Choose Photo & Post" onPress={handleUpload} loading={isLoading} />
    </View>
  );
}
