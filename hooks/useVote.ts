import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export function useVote(updatePhotoVote: (photoId: string, voted: boolean, delta: number) => void) {
  const { user } = useAuth();

  const vote = useCallback(
    async (photoId: string, currentlyVoted: boolean) => {
      if (!user) return;

      // Optimistic update
      const newVoted = !currentlyVoted;
      const delta = newVoted ? 1 : -1;
      updatePhotoVote(photoId, newVoted, delta);

      try {
        if (newVoted) {
          const { error } = await supabase
            .from('votes')
            .insert({ user_id: user.id, photo_id: photoId });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('votes')
            .delete()
            .eq('user_id', user.id)
            .eq('photo_id', photoId);
          if (error) throw error;
        }
      } catch {
        // Revert optimistic update on error
        updatePhotoVote(photoId, currentlyVoted, -delta);
      }
    },
    [user, updatePhotoVote]
  );

  return { vote };
}
