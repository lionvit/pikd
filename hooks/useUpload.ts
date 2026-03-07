import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { decode } from 'base64-arraybuffer';

export interface UploadState {
  isLoading: boolean;
  error: string | null;
}

export function useUpload() {
  const { user } = useAuth();
  const [state, setState] = useState<UploadState>({ isLoading: false, error: null });

  const pickAndUpload = async (caption?: string): Promise<boolean> => {
    if (!user) return false;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets[0].base64) return false;

    setState({ isLoading: true, error: null });

    try {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() ?? 'jpg';
      const fileName = `${Date.now()}.${ext}`;
      const storagePath = `${user.id}/${fileName}`;
      const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(storagePath, decode(asset.base64!), { contentType });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('photos').insert({
        user_id: user.id,
        storage_path: storagePath,
        caption: caption?.trim() || null,
      });

      if (insertError) {
        // Clean up storage on insert failure
        await supabase.storage.from('photos').remove([storagePath]);
        throw insertError;
      }

      setState({ isLoading: false, error: null });
      return true;
    } catch (err: unknown) {
      setState({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Upload failed',
      });
      return false;
    }
  };

  return { ...state, pickAndUpload };
}
