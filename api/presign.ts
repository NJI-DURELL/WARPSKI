import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/presign  (Vercel serverless function)
 *
 * Returns a short-lived pre-signed S3 PUT URL — but ONLY after verifying that:
 *   1. The request carries a valid Supabase access token (Authorization header).
 *   2. That user's id exists in the `admins` table.
 *   3. The file type + size are within policy.
 *
 * AWS credentials live exclusively in this runtime (never VITE_-prefixed), so
 * they are never shipped to the browser. The object key is server-generated and
 * forced under the `admin-images/` prefix — clients can't write elsewhere.
 */

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

interface VercelRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}
interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (k: string, v: string) => void;
  end: (body?: string) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const {
    AWS_REGION,
    AWS_S3_BUCKET,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
  } = process.env;

  if (
    !AWS_REGION ||
    !AWS_S3_BUCKET ||
    !AWS_ACCESS_KEY_ID ||
    !AWS_SECRET_ACCESS_KEY ||
    !SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY
  ) {
    res.status(500).json({ error: 'Server is not configured for uploads.' });
    return;
  }

  // ── 1. Authenticate the caller ──
  const authHeader = req.headers['authorization'];
  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : '';
  if (!token) {
    res.status(401).json({ error: 'Missing authorization token.' });
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData.user) {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return;
  }

  // ── 2. Authorize: must be an admin ──
  const { data: adminRow, error: adminErr } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (adminErr || !adminRow) {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }

  // ── 3. Validate the file metadata ──
  const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as {
    contentType?: string;
    size?: number;
  } | null;

  const contentType = body?.contentType ?? '';
  const size = Number(body?.size ?? 0);

  if (!ALLOWED_TYPES.has(contentType)) {
    res.status(400).json({ error: 'Unsupported file type.' });
    return;
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
    res.status(400).json({ error: 'File must be 5MB or smaller.' });
    return;
  }

  // ── 4. Issue a scoped, short-lived pre-signed PUT URL ──
  const key = `admin-images/${Date.now()}-${crypto.randomUUID()}.${EXT[contentType]}`;
  const s3 = new S3Client({
    region: AWS_REGION,
    credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
  });

  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  });

  try {
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const publicUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    res.status(200).json({ uploadUrl, publicUrl, key });
  } catch {
    res.status(500).json({ error: 'Could not create upload URL.' });
  }
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
