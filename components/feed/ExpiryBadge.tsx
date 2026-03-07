import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Colors from '@/constants/Colors';

interface ExpiryBadgeProps {
  expiresAt: string;
}

function getTimeLeft(expiresAt: string): { label: string; color: string } {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return { label: 'Expired', color: Colors.red };

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  let label: string;
  if (hours >= 6) label = `${hours}h left`;
  else if (hours >= 1) label = `${hours}h ${minutes}m`;
  else label = `${minutes}m left`;

  const color = hours >= 6 ? Colors.green : hours >= 1 ? Colors.yellow : Colors.red;
  return { label, color };
}

export function ExpiryBadge({ expiresAt }: ExpiryBadgeProps) {
  const [time, setTime] = useState(() => getTimeLeft(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeLeft(expiresAt));
    }, 60_000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <View
      style={{
        backgroundColor: time.color + '33',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
      }}
    >
      <Text style={{ color: time.color, fontSize: 11, fontWeight: '600' }}>{time.label}</Text>
    </View>
  );
}
