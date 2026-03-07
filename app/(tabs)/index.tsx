import { useEffect } from 'react';
import { FlatList, Text, View, ActivityIndicator, RefreshControl } from 'react-native';
import { useFeed } from '@/hooks/useFeed';
import { useVote } from '@/hooks/useVote';
import { PhotoCard } from '@/components/feed/PhotoCard';
import Colors from '@/constants/Colors';

export default function FeedScreen() {
  const { photos, isLoading, isRefreshing, hasMore, loadMore, refresh, updatePhotoVote, fetchPage } =
    useFeed();
  const { vote } = useVote(updatePhotoVote);

  useEffect(() => {
    fetchPage(0);
  }, []);

  if (isLoading && photos.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.tint} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 }}>
        <Text style={{ fontSize: 28, fontWeight: '900', color: Colors.tint }}>pikd</Text>
      </View>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PhotoCard photo={item} onVote={vote} />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={Colors.tint}
          />
        }
        ListEmptyComponent={
          <View style={{ paddingTop: 80, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📷</Text>
            <Text style={{ color: Colors.textSecondary, fontSize: 16 }}>No photos yet</Text>
            <Text style={{ color: Colors.tabIconDefault, fontSize: 13, marginTop: 4 }}>
              Be the first to post!
            </Text>
          </View>
        }
        ListFooterComponent={
          isLoading && photos.length > 0 ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator color={Colors.tint} />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}
