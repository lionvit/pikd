import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';

interface PikdButtonProps {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
}

export function PikdButton({
  onPress,
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
}: PikdButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        backgroundColor: isPrimary ? Colors.tint : 'transparent',
        borderWidth: isPrimary ? 0 : 1,
        borderColor: Colors.border,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        opacity: disabled || loading ? 0.5 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : Colors.text} />
      ) : (
        <Text
          style={{
            color: isPrimary ? '#fff' : Colors.textSecondary,
            fontSize: 15,
            fontWeight: '700',
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
