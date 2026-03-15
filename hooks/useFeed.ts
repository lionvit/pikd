import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { FeedPhoto, Photo } from '@/types/database';
import { useAuth } from '@/context/AuthContext';

const PAGE_SIZE = 10;

export function useFeed() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<FeedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchPage = useCallback(async (pageIndex: number, refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data: photosData, error } = await supabase
        .from('photos')
        .select('*, profiles(username, avatar_url)')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('[useFeed] query error:', error);
        throw error;
      }

      // Fetch user's votes for this page of photos
      let votedIds = new Set<string>();
      if (user && photosData && photosData.length > 0) {
        const photoIds = photosData.map((p) => p.id);
        const { data: votesData } = await supabase
          .from('votes')
          .select('photo_id')
          .eq('user_id', user.id)
          .in('photo_id', photoIds);
        if (votesData) {
          votedIds = new Set(votesData.map((v) => v.photo_id));
        }
      }

      const feedPhotos: FeedPhoto[] = (photosData ?? []).map((p) => ({
        ...(p as Photo & { profiles: { username: string | null; avatar_url: string | null } | null }),
        has_voted: votedIds.has(p.id),
      }));

      if (refresh) {
        setPhotos(feedPhotos);
      } else {
        setPhotos((prev) => [...prev, ...feedPhotos]);
      }

      setHasMore(feedPhotos.length === PAGE_SIZE);
      setPage(pageIndex + 1);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  const loadMore = useCallback(() => {
    if (!isLoading && !isRefreshing && hasMore) {
      fetchPage(page);
    }
  }, [fetchPage, page, isLoading, isRefreshing, hasMore]);

  const refresh = useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchPage(0, true);
  }, [fetchPage]);

  const updatePhotoVote = useCallback(
    (photoId: string, voted: boolean, delta: number) => {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId
            ? { ...p, has_voted: voted, vote_count: p.vote_count + delta }
            : p
        )
      );
    },
    []
  );

  return { photos, isLoading, isRefreshing, hasMore, loadMore, refresh, updatePhotoVote, fetchPage };
}
