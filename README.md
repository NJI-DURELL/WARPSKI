# 🌊 WarpSki — Jetboat & Jetski E-commerce

A production-ready, secure e-commerce storefront for premium watercraft. Built with
**React 19 · TypeScript · Vite · Tailwind · Zustand · Supabase · AWS S3 · GSAP** and
deployable to **Vercel** on entirely free tiers.

![Stack](https://img.shields.io/badge/React-19-61dafb) ![Stack](https://img.shields.io/badge/TypeScript-strict-3178c6) ![Stack](https://img.shields.io/badge/Supabase-RLS-3ecf8e) ![Stack](https://img.shields.io/badge/GSAP-3.15-88ce02)

---

## ✨ Features

- **Cinematic GSAP landing page** — 0→100% preloader, SplitText staggered hero reveal,
  mask-scale image reveal, hand-drawn SVG stroke, scroll-triggered sections, parallax +
  hero zoom on scroll. Respects `prefers-reduced-motion`.
- **11 pages** — Home, Catalogue (filter + sort), Product Detail (gallery), Accessories,
  Cart, Checkout, Contact, Auth, Account ("Owner Zone"), hidden Admin Login, Admin Dashboard.
- **Secure auth** — Supabase Auth, PKCE flow, auto-refresh, persisted sessions.
- **Row Level Security** on every table (see `supabase/schema.sql`).
- **Hidden admin area** — `/admin/login` is unlinked; the dashboard requires a row in the
  `admins` table, verified both client-side and **server-side** in the upload function.
- **Secure S3 uploads** — the browser never holds AWS keys. A Vercel serverless function
  (`/api/presign`) verifies the caller's JWT + admin status, then issues a 60-second
  pre-signed PUT URL scoped to the `admin-images/` prefix.
- **Zod validation everywhere** — email/password/contact/checkout/upload/product schemas,
  with XSS-vector guards, Luhn card checks, and 5MB/type upload limits.
- **State** — Zustand cart (persisted to localStorage) + auth store.
- **Hardened headers** via `vercel.json` (`X-Frame-Options`, `nosniff`, Referrer-Policy…).

> The site is **fully browsable with zero configuration** — it falls back to a local demo
> catalogue until you add Supabase credentials.

---

## 🚀 Quick start

```bash
npm install
cp .env.example .env     # then fill in values (optional for demo mode)
npm run dev              # http://localhost:5173
```

Build & preview a production bundle:

```bash
npm run build
npm run preview
```

---

## 🔐 Environment variables

Copy `.env.example` → `.env`. Only `VITE_*` variables reach the browser; everything else
is server-only (used by the serverless function and **never bundled** into client code).

| Variable | Scope | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | client | Public Supabase client |
| `AWS_REGION` / `AWS_S3_BUCKET` | server | S3 target |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | server | IAM creds for presigning |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | server | Verify admin in `/api/presign` |

---

## 🗄️ Supabase setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql). This
   creates the `products`, `admins`, `messages`, and `orders` tables with **RLS enabled**
   and least-privilege policies.
3. Copy your Project URL + anon key into `.env`.
4. **Make yourself an admin**: sign up through the app, then run (SQL editor):

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'you@example.com'
   on conflict (user_id) do nothing;
   ```

5. Visit the **hidden** admin login at `/admin/login`.

### Security model (RLS)

| Table | anon | authenticated user | admin |
| --- | --- | --- | --- |
| `products` | read | read | read + write |
| `admins` | — | read own row only | read own row only |
| `messages` | insert only | insert only | read |
| `orders` | — | read/insert own | read all |

---

## ☁️ AWS S3 setup (free tier — 5 GB)

1. Create a bucket, e.g. `warpski-admin-images`.
2. Create an **IAM user** with programmatic access and a minimal policy:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:PutObject", "s3:GetObject"],
         "Resource": "arn:aws:s3:::warpski-admin-images/admin-images/*"
       }
     ]
   }
   ```

3. Add a **CORS** rule so the browser can PUT directly:

   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["PUT", "GET"],
       "AllowedOrigins": ["https://your-domain.vercel.app", "http://localhost:5173"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

4. To serve images publicly, either enable a bucket policy allowing `s3:GetObject` on
   `admin-images/*`, or front the bucket with CloudFront. Put the AWS values in `.env`.

---

## ▲ Deploy to Vercel

1. Push to GitHub and **Import** the repo at [vercel.com](https://vercel.com).
2. Framework preset: **Vite** (build `npm run build`, output `dist`). `vercel.json` already
   sets SPA rewrites + security headers and keeps `/api/*` routed to the serverless function.
3. Add every variable from `.env` in **Project → Settings → Environment Variables**.
4. Deploy. The `/api/presign` function runs automatically on Vercel's Node runtime.

---

## 🧱 Project structure

```
api/presign.ts              Serverless S3 pre-signed URL issuer (auth + admin gated)
supabase/schema.sql         Tables + RLS policies + admin bootstrap
src/
  components/
    layout/                 Navbar, Footer, CartDrawer, Layout shells
    routing/Guards.tsx      ProtectedRoute + AdminRoute
    ui/                     Button, Spinner, Preloader, ProductCard
  data/products.ts          Demo catalogue (also the seed shape)
  hooks/useGsapReveal.ts    Scroll-reveal hook
  lib/                      supabase, gsap, validations (Zod), catalog, upload, utils
  pages/                    Home, Catalogue, ProductDetail, Accessories, Cart,
                            Checkout, Contact, Auth, Account, admin/*, NotFound
  store/                    cartStore, authStore (Zustand)
```

---

## 🛡️ Security checklist

- [x] RLS enabled on all tables, least-privilege policies
- [x] AWS credentials server-only; presigned URLs scoped + 60s TTL
- [x] Admin verified server-side before any upload URL is issued
- [x] Zod validation on every form; XSS-vector + Luhn + size/type guards
- [x] Secrets in `.env` only; `.env` git-ignored
- [x] Hardened HTTP headers via `vercel.json`
- [x] PKCE auth flow, auto-refreshing tokens, no hand-rolled token storage

---

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Type-check (`tsc -b`) + production build |
| `npm run preview` | Preview the built bundle |
| `npm run typecheck` | Type-check only |

Built with care. Choose fun. Choose adventure. 🛥️
