import { supabase } from './supabase';

const BUCKET = 'menu-images';

export async function uploadMenuImage(file: File, folder = 'items'): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Sign in to upload menu images.');

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    throw new Error('Use JPG, PNG, WebP, or GIF images only.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Each image must be 5 MB or smaller.');
  }

  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `${folder}/${session.user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export function countMenuImages(imageUrl?: string, imageUrl2?: string): number {
  return [imageUrl, imageUrl2].filter((url) => Boolean(url?.trim())).length;
}

export function validateMenuImages(imageUrl?: string, imageUrl2?: string): string | null {
  if (countMenuImages(imageUrl, imageUrl2) < 1) {
    return 'Upload at least 1 image (1/2 required) before saving this item.';
  }
  return null;
}
