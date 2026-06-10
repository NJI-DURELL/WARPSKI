import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  CloudUpload,
  ImageIcon,
  LogOut,
  Loader2,
  Package,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { uploadAdminImage, UPLOAD_MAX_BYTES } from '@/lib/upload';
import { productSchema } from '@/lib/validations';
import { fieldErrors, formatCurrency, slugify } from '@/lib/utils';
import { fetchProducts } from '@/lib/catalog';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types';

interface Uploaded {
  url: string;
  key: string;
  name: string;
}

export function AdminDashboard() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [uploads, setUploads] = useState<Uploaded[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError('');
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const res = await uploadAdminImage(file);
        setUploads((prev) => [{ ...res, name: file.name }, ...prev]);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavedNotice('');
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries());
    const parsed = productSchema.safeParse({ ...raw, in_stock: raw.in_stock === 'on' });

    if (!parsed.success) {
      setFormErrors(fieldErrors(parsed.error.flatten()));
      return;
    }
    setFormErrors({});
    setSaving(true);

    const record = {
      ...parsed.data,
      slug: slugify(parsed.data.name),
      images: uploads.map((u) => u.url),
      currency: 'USD',
      specs: [],
      highlights: [],
    };

    try {
      if (isSupabaseConfigured) {
        // RLS restricts INSERT on `products` to admins only.
        const { error } = await supabase.from('products').insert(record);
        if (error) throw error;
        const refreshed = await fetchProducts();
        setProducts(refreshed);
      } else {
        setProducts((prev) => [{ id: crypto.randomUUID(), rating: 0, ...record } as Product, ...prev]);
      }
      setSavedNotice(`"${parsed.data.name}" saved.`);
      form.reset();
      setUploads([]);
    } catch (err) {
      setFormErrors({ name: err instanceof Error ? err.message : 'Save failed.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-900/80 backdrop-blur">
        <div className="container-px flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-flame/10 text-flame">
              <Package className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-base font-black text-white">Admin Dashboard</h1>
              <p className="text-xs text-mist-muted">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/')}>View Store</Button>
            <Button variant="ghost" onClick={() => void signOut()}>
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container-px grid gap-8 py-10 lg:grid-cols-[1fr_1.1fr]">
        {/* ── Upload + New Product ── */}
        <section className="space-y-8">
          <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <CloudUpload className="h-5 w-5 text-flame" /> Image Upload
            </h2>
            <p className="mt-1 text-sm text-mist-muted">
              JPEG, PNG, WebP or AVIF · max {Math.round(UPLOAD_MAX_BYTES / 1024 / 1024)}MB · stored in
              <code className="mx-1 rounded bg-ink-700 px-1.5 py-0.5 text-xs">admin-images/</code>
              via pre-signed URL.
            </p>

            <label
              className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-ink-900/50 px-6 py-10 text-center transition-colors hover:border-flame/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void handleFiles(e.dataTransfer.files);
              }}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-flame" />
              ) : (
                <ImageIcon className="h-8 w-8 text-mist-muted" />
              )}
              <span className="text-sm font-medium text-white">
                {uploading ? 'Uploading…' : 'Drop images here or click to browse'}
              </span>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                hidden
                onChange={(e) => void handleFiles(e.target.files)}
              />
            </label>

            {uploadError && (
              <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {uploadError}
              </p>
            )}

            {uploads.length > 0 && (
              <div className="mt-5 grid grid-cols-3 gap-3">
                {uploads.map((u) => (
                  <div key={u.key} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10">
                    <img src={u.url} alt={u.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setUploads((prev) => prev.filter((x) => x.key !== u.key))}
                      className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-ink-950/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={handleCreateProduct}
            noValidate
            className="rounded-2xl border border-white/10 bg-ink-800/40 p-6"
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Plus className="h-5 w-5 text-flame" /> New Product
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="name" className="label">Name</label>
                <input id="name" name="name" className="field" placeholder="Warp RX 900" />
                {formErrors.name && <p className="field-error">{formErrors.name}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="label">Category</label>
                  <select id="category" name="category" className="field" defaultValue="performance">
                    <option value="performance">Performance</option>
                    <option value="recreation">Recreation</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="price" className="label">Price (USD)</label>
                  <input id="price" name="price" type="number" min="0" step="0.01" className="field" placeholder="18900" />
                  {formErrors.price && <p className="field-error">{formErrors.price}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="tagline" className="label">Tagline</label>
                <input id="tagline" name="tagline" className="field" placeholder="The ride of a lifetime." />
                {formErrors.tagline && <p className="field-error">{formErrors.tagline}</p>}
              </div>
              <div>
                <label htmlFor="description" className="label">Description</label>
                <textarea id="description" name="description" rows={3} className="field resize-none" placeholder="Describe the craft…" />
                {formErrors.description && <p className="field-error">{formErrors.description}</p>}
              </div>
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" name="in_stock" defaultChecked className="h-4 w-4 accent-flame" />
                In stock
              </label>
            </div>

            {savedNotice && (
              <p className="mt-4 flex items-center gap-2 rounded-lg border border-flame/20 bg-flame/10 px-3 py-2 text-sm text-flame-400">
                <CheckCircle2 className="h-4 w-4" /> {savedNotice}
              </p>
            )}

            <Button type="submit" loading={saving} className="mt-5 w-full">
              Save Product
            </Button>
          </form>
        </section>

        {/* ── Existing products ── */}
        <section className="rounded-2xl border border-white/10 bg-ink-800/40 p-6">
          <h2 className="text-lg font-bold text-white">Products ({products.length})</h2>
          <div className="mt-5 space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-ink-900/50 p-3"
              >
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{p.name}</p>
                  <p className="text-xs capitalize text-mist-muted">{p.category}</p>
                </div>
                <span className="font-display font-bold text-white">
                  {formatCurrency(p.price, p.currency)}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    p.in_stock ? 'bg-flame/10 text-flame' : 'bg-white/5 text-mist-muted'
                  }`}
                >
                  {p.in_stock ? 'In stock' : 'Sold out'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
