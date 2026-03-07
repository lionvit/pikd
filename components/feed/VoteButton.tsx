import { TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

interface VoteButtonProps {
  count: number;
  hasVoted: boolean;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function VoteButton({ count, hasVoted, onPress }: VoteButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.3, { damping: 4, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 6, stiffness: 200 });
    });
    onPress();
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: hasVoted ? Colors.tint + '22' : Colors.card,
          borderWidth: 1,
          borderColor: hasVoted ? Colors.tint : Colors.border,
        },
        animatedStyle,
      ]}
    >
      <Text style={{ fontSize: 18 }}>{hasVoted ? '🔥' : '🔥'}</Text>
      <Text
        style={{
          color: hasVoted ? Colors.tint : Colors.textSecondary,
          fontSize: 14,
          fontWeight: '700',
        }}
      >
        {count}
      </Text>
    </AnimatedTouchable>
  );
}
