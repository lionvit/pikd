import { View, Text } from 'react-native';
import Colors from '@/constants/Colors';

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: Colors.textSecondary }}>Profile coming soon</Text>
    </View>
  );
}
