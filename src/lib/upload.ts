import { supabase } from '@/lib/supabase';
import { uploadFileSchema, UPLOAD_ALLOWED_TYPES, UPLOAD_MAX_BYTES } from '@/lib/validations';

export interface UploadResult {
  url: string;
  key: string;
}

const BUCKET = 'admin-images';

export async function uploadAdminImage(file: File): Promise<UploadResult> {
  const check = uploadFileSchema.safeParse({
    name: file.name,
    size: file.size,
    type: file.type,
  });
  if (!check.success) {
    throw new Error(check.error.errors[0]?.message ?? 'Invalid file');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('You must be signed in to upload.');

  const ext = file.name.split('.').pop() ?? 'jpg';
  const key = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(key, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

  return { url: publicUrl, key: data.path };
}

export { UPLOAD_ALLOWED_TYPES, UPLOAD_MAX_BYTES };
