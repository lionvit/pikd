import { View, ScrollView } from 'react-native';
import { UploadForm } from '@/components/upload/UploadForm';
import Colors from '@/constants/Colors';

export default function UploadScreen() {
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
