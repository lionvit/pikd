import { View, Text } from 'react-native';
import Colors from '@/constants/Colors';

export default function LeaderboardScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: Colors.textSecondary }}>Leaderboard coming soon</Text>
    </View>
  );
}
