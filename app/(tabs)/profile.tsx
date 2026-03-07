import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Photo, Profile } from '@/types/database';
import { PikdButton } from '@/components/ui/PikdButton';
import { Avatar } from '@/components/ui/Avatar';
import Colors from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMB_SIZE = (SCREEN_WIDTH - 32 - 8) / 3;

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async (refreshing = false) => {
    if (!user) return;
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [profileRes, photosRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('photos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setUsername(profileRes.data.username ?? '');
      }
      if (photosRes.data) setPhotos(photosRes.data);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const saveUsername = async () => {
    if (!user || !username.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user.id);
      if (error) throw error;
      setProfile((prev) => prev ? { ...prev, username: username.trim() } : prev);
      setIsEditingUsername(false);
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not save username');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.tint} size="large" />
      </View>
    );
  }

  const ListHeader = (
    <View style={{ padding: 16, paddingTop: 60 }}>
      {/* Avatar + username */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <Avatar url={profile?.avatar_url} username={profile?.username} size={64} />
        <View style={{ flex: 1 }}>
          {isEditingUsername ? (
            <View style={{ gap: 8 }}>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor={Colors.tabIconDefault}
                autoFocus
                maxLength={30}
                style={{
                  backgroundColor: Colors.card,
                  borderWidth: 1,
                  borderColor: Colors.tint,
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  color: Colors.text,
                  fontSize: 15,
                }}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={saveUsername}
                  disabled={isSaving}
                  style={{
                    backgroundColor: Colors.tint,
                    borderRadius: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    opacity: isSaving ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsEditingUsername(false)}
                  style={{ borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 }}
                >
                  <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700' }}>
                {profile?.username ?? 'Anonymous'}
              </Text>
              <TouchableOpacity onPress={() => setIsEditingUsername(true)} style={{ marginTop: 4 }}>
                <Text style={{ color: Colors.tint, fontSize: 13 }}>Edit username</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Stats */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: Colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          justifyContent: 'space-around',
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: Colors.text, fontSize: 20, fontWeight: '700' }}>{photos.length}</Text>
          <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>Photos</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: Colors.text, fontSize: 20, fontWeight: '700' }}>
            {photos.reduce((sum, p) => sum + p.vote_count, 0)}
          </Text>
          <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>Total votes</Text>
        </View>
      </View>

      <Text style={{ color: Colors.textSecondary, fontSize: 13, marginBottom: 10 }}>
        My Photos (including expired)
      </Text>
    </View>
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: Colors.background }}
      data={photos}
      keyExtractor={(item) => item.id}
      numColumns={3}
      ListHeaderComponent={ListHeader}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} tintColor={Colors.tint} />
      }
      ListEmptyComponent={
        <View style={{ paddingTop: 20, alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ color: Colors.tabIconDefault, fontSize: 14 }}>No photos posted yet.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const isExpired = new Date(item.expires_at) < new Date();
        const { data } = supabase.storage.from('photos').getPublicUrl(item.storage_path);
        return (
          <View style={{ margin: 4, position: 'relative' }}>
            <Image
              source={{ uri: data.publicUrl }}
              style={{
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: 8,
                opacity: isExpired ? 0.4 : 1,
              }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View
              style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: 6,
                paddingHorizontal: 5,
                paddingVertical: 2,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Text style={{ fontSize: 10 }}>🔥</Text>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{item.vote_count}</Text>
            </View>
          </View>
        );
      }}
      ListFooterComponent={
        <View style={{ padding: 24, paddingBottom: 100, alignItems: 'center' }}>
          <PikdButton label="Sign Out" onPress={handleSignOut} variant="ghost" />
        </View>
      }
      columnWrapperStyle={{ paddingHorizontal: 12 }}
    />
  );
}
