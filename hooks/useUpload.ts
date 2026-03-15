import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { decode } from 'base64-arraybuffer';

export interface UploadState {
  isLoading: boolean;
  error: string | null;
}

function getMimeType(asset: ImagePicker.ImagePickerAsset): string {
  // expo-image-picker provides mimeType on web; fall back to parsing the URI
  if (asset.mimeType) return asset.mimeType;
  const ext = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
  return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
}

function getExtension(mimeType: string): string {
  const sub = mimeType.split('/')[1] ?? 'jpeg';
  return sub === 'jpeg' ? 'jpg' : sub;
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
      const mimeType = getMimeType(asset);
      const ext = getExtension(mimeType);
      const storagePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(storagePath, decode(asset.base64!), { contentType: mimeType });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('photos').insert({
        user_id: user.id,
        storage_path: storagePath,
        caption: caption?.trim() || null,
      });

      if (insertError) {
        await supabase.storage.from('photos').remove([storagePath]);
        throw insertError;
      }

      setState({ isLoading: false, error: null });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      console.error('[useUpload]', err);
      setState({ isLoading: false, error: message });
      return false;
    }
  };

  return { ...state, pickAndUpload };
}
