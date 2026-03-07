import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import Colors from '@/constants/Colors';

interface AvatarProps {
  url?: string | null;
  username?: string | null;
  size?: number;
}

export function Avatar({ url, username, size = 36 }: AvatarProps) {
  const initials = username ? username.slice(0, 2).toUpperCase() : '?';

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        cachePolicy="memory-disk"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: Colors.card,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: Colors.textSecondary, fontSize: size * 0.35, fontWeight: '600' }}>
        {initials}
      </Text>
    </View>
  );
}
