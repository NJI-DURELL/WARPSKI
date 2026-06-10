import { supabase } from '@/lib/supabase';
import { uploadFileSchema, UPLOAD_ALLOWED_TYPES, UPLOAD_MAX_BYTES } from '@/lib/validations';

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Securely uploads an image to S3 using a short-lived pre-signed URL.
 *
 * Flow:
 *  1. Validate the file client-side (type + size) — fail fast, good UX.
 *  2. Ask our `/api/presign` serverless function for a pre-signed PUT URL.
 *     That function verifies the caller's Supabase JWT *and* that they are an
 *     admin before issuing a URL scoped to the `admin-images/` prefix.
 *  3. PUT the bytes straight to S3. AWS credentials never reach the browser.
 */
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

  const presignRes = await fetch('/api/presign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });

  if (!presignRes.ok) {
    const msg = await presignRes.text().catch(() => '');
    throw new Error(msg || `Could not get upload URL (${presignRes.status})`);
  }

  const { uploadUrl, publicUrl, key } = (await presignRes.json()) as {
    uploadUrl: string;
    publicUrl: string;
    key: string;
  };

  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!put.ok) throw new Error('Upload to storage failed.');

  return { url: publicUrl, key };
}

export { UPLOAD_ALLOWED_TYPES, UPLOAD_MAX_BYTES };
