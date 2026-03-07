import { View, Text } from 'react-native';
import Colors from '@/constants/Colors';

export default function UploadScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: Colors.textSecondary }}>Upload coming soon</Text>
    </View>
  );
}
