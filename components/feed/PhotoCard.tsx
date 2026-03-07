import { View, Text, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { supabase } from '@/lib/supabase';
import { FeedPhoto } from '@/types/database';
import Colors from '@/constants/Colors';
import { Avatar } from '@/components/ui/Avatar';
import { VoteButton } from './VoteButton';
import { ExpiryBadge } from './ExpiryBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 1.1;

interface PhotoCardProps {
  photo: FeedPhoto;
  onVote: (photoId: string, currentlyVoted: boolean) => void;
}

function getPublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from('photos').getPublicUrl(storagePath);
  return data.publicUrl;
}

export function PhotoCard({ photo, onVote }: PhotoCardProps) {
  const username = photo.profiles?.username ?? 'Anonymous';
  const avatarUrl = photo.profiles?.avatar_url ?? null;

  return (
    <View
      style={{
        backgroundColor: Colors.card,
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      <Image
        source={{ uri: getPublicUrl(photo.storage_path) }}
        style={{ width: '100%', height: IMAGE_HEIGHT }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />

      <View style={{ padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Avatar url={avatarUrl} username={username} size={32} />
          <Text
            style={{ color: Colors.text, fontSize: 14, fontWeight: '600', marginLeft: 8, flex: 1 }}
            numberOfLines={1}
          >
            {username}
          </Text>
          <ExpiryBadge expiresAt={photo.expires_at} />
        </View>

        {photo.caption ? (
          <Text style={{ color: Colors.textSecondary, fontSize: 13, marginBottom: 10 }} numberOfLines={2}>
            {photo.caption}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <VoteButton
            count={photo.vote_count}
            hasVoted={photo.has_voted}
            onPress={() => onVote(photo.id, photo.has_voted)}
          />
        </View>
      </View>
    </View>
  );
}
