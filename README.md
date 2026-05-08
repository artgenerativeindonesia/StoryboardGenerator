# StoryboardGenerator

> Aplikasi internal untuk generate storyboard sinematik otomatis dari PDF. Dibuat untuk tim kreatif internal — bukan untuk publik.

## Fitur Utama

- **Generate Script Otomatis** — Analisis PDF dengan framework penulis screenplay Hollywood
- **Generate Shotlist** — Output tabel profesional ala Creative Director + DOP kelas dunia
- **Generate Gambar AI** — Pilih provider: Higgsfield AI, kie.ai, atau wavespeed.ai
- **Project Management** — Kelola project, file, dan session dengan rapi
- **Settings No-Code** — Konfigurasi API key dan model LLM tanpa edit kode
- **Export PDF & ZIP** — Download script, shotlist, dan gambar dalam satu klik
- **State Persisten** — Refresh halaman tidak akan hilangkan progress yang sudah dibuat

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui + Framer Motion |
| Auth & Database | Supabase (PostgreSQL + Storage + Google OAuth) |
| LLM | OpenRouter API (user konfigurasi key sendiri) |
| Image Gen | Higgsfield AI / kie.ai / wavespeed.ai |
| Export | jsPDF + JSZip |
| State | Zustand + TanStack Query |

## Cara Setup

### Panduan Lengkap (untuk pemula)

Baca **[SETUP.md](./SETUP.md)** — panduan step-by-step lengkap dalam bahasa Indonesia, mulai dari install Node.js sampai deploy ke Vercel. Tidak perlu bisa coding.

### Quick Start (untuk developer)

```bash
git clone <repo-url>
cd StoryboardGenerator
npm install
```

Buat `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Jalankan migrasi SQL di Supabase SQL Editor:
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_storage_buckets.sql
```

Aktifkan Google OAuth di Supabase → Authentication → Providers, lalu:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — login dengan Google, masukkan API keys di Settings.

---

## Alur Kerja

```
Login
  → Buat Project
  → Upload PDF
  → New Session → Pilih file + tulis instruksi (opsional)
  → Generate Script!
  → [Editor] Edit script manual / dengan AI
  → Generate Shotlist!
  → [Tabel] Edit shotlist manual / dengan AI
  → Generate All Images!
  → [Gallery] Download, regenerate per gambar
```

Setiap tahap tersimpan otomatis. Refresh tidak akan hilangkan progress.

---

## Struktur Project

```
app/
  (auth)/login/          → Halaman login Google
  (app)/projects/        → Project list + detail
  (app)/settings/        → Konfigurasi API
  api/                   → Backend API routes

components/
  generation/            → Editor script, tabel shotlist, galeri gambar
  projects/              → Manajemen project
  settings/              → Form konfigurasi
  layout/                → Sidebar, breadcrumbs
  ui/                    → shadcn/ui primitives

lib/
  llm/prompts/           → System prompts (script + shotlist)
  image-gen/             → Higgsfield, kie.ai, wavespeed client
  export/                → PDF dan ZIP generator
  supabase/              → Client setup

stores/                  → Zustand (state persisten)
hooks/                   → TanStack Query hooks
types/                   → TypeScript definitions
supabase/migrations/     → SQL schema
```

---

## Deployment (Production — Vercel)

1. Push repo ke GitHub

2. Di [vercel.com](https://vercel.com):
   - Import repo
   - Tambahkan semua env vars dari `.env.example`
   - Set `NEXT_PUBLIC_APP_URL` ke domain production

3. Update Supabase Auth:
   - Tambah domain production ke Redirect URLs
   - Contoh: `https://yourdomain.com/api/auth/callback`

---

## Catatan Developer

- **API Keys** disimpan di database per user — tiap orang pakai key sendiri via Settings
- **Row Level Security** aktif di semua tabel — user hanya bisa lihat data mereka sendiri
- **PDF parsing** berjalan di server (api route), tidak di browser
- **Image generation** dijalankan paralel (maks 5 concurrent) dengan concurrency limiter
- **SSE streaming** digunakan untuk progress real-time saat generate script/shotlist

### Tambah Image Provider Baru

1. Buat `lib/image-gen/newprovider.ts` dengan fungsi `generateImage(params)`
2. Daftarkan di `lib/image-gen/index.ts`
3. Tambahkan ke UI di `components/settings/ImageGenSettingsForm.tsx`
4. Tambahkan field API key di `supabase/migrations/` (ALTER TABLE)

### Ubah LLM Prompt

- Script: `lib/llm/prompts/script.ts`
- Shotlist: `lib/llm/prompts/shotlist.ts`
- Edit prompt: `lib/llm/prompts/scriptEdit.ts` / `shotlistEdit.ts`

---

Dibuat oleh tim **artgenerativeindonesia** untuk keperluan produksi internal.
