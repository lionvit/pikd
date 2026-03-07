import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { supabase } from '@/lib/supabase';
import { Photo } from '@/types/database';
import Colors from '@/constants/Colors';

interface LeaderboardEntry extends Photo {
  profiles: { username: string | null; avatar_url: string | null } | null;
}

const RANK_MEDALS: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetch = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*, profiles(username, avatar_url)')
        .order('vote_count', { ascending: false })
        .limit(20);

      if (!error && data) {
        setEntries(data as LeaderboardEntry[]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetch(); }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.tint} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.text }}>Top Photos</Text>
        <Text style={{ color: Colors.textSecondary, fontSize: 13, marginTop: 2 }}>
          Active photos ranked by votes
        </Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => fetch(true)} tintColor={Colors.tint} />
        }
        ListEmptyComponent={
          <View style={{ paddingTop: 80, alignItems: 'center' }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🏆</Text>
            <Text style={{ color: Colors.textSecondary, fontSize: 16 }}>No photos yet</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const { data } = supabase.storage.from('photos').getPublicUrl(item.storage_path);
          const username = item.profiles?.username ?? 'Anonymous';
          const medal = RANK_MEDALS[index];

          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
              }}
            >
              <Text style={{ width: 32, fontSize: 18, textAlign: 'center' }}>
                {medal ?? `${index + 1}`}
              </Text>

              <Image
                source={{ uri: data.publicUrl }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  marginHorizontal: 12,
                  backgroundColor: Colors.card,
                }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />

              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.text, fontSize: 14, fontWeight: '600' }} numberOfLines={1}>
                  {username}
                </Text>
                {item.caption ? (
                  <Text style={{ color: Colors.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                    {item.caption}
                  </Text>
                ) : null}
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16 }}>🔥</Text>
                <Text style={{ color: Colors.tint, fontSize: 13, fontWeight: '700' }}>
                  {item.vote_count}
                </Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}
