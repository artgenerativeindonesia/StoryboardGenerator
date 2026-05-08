# PANDUAN SETUP STORYBOARD GENERATOR
### Untuk pemula — tidak perlu bisa coding

---

## PERSIAPAN AWAL — BUAT AKUN DI 3 LAYANAN INI

Sebelum mulai, buat akun gratis di tiga website ini (kalau belum punya):

1. **GitHub** → https://github.com — tempat menyimpan kode
2. **Supabase** → https://supabase.com — database dan login (gratis)
3. **Vercel** → https://vercel.com — hosting web app (gratis)

---

## BAGIAN 1 — INSTALL SOFTWARE DI KOMPUTER KAMU

### Step 1 — Install Node.js

1. Buka https://nodejs.org
2. Klik tombol besar **"LTS"** (bukan Current)
3. Download dan install seperti biasa (next → next → finish)
4. Setelah selesai, buka **Terminal** (Mac) atau **Command Prompt** (Windows)
5. Ketik perintah ini lalu tekan Enter:
   ```
   node -v
   ```
6. Kalau muncul angka seperti `v20.x.x` → berarti berhasil

### Step 2 — Install Git

1. Buka https://git-scm.com/downloads
2. Download sesuai sistem operasi kamu (Windows/Mac/Linux)
3. Install dengan semua pilihan default (terus next saja)
4. Setelah selesai, buka Terminal/Command Prompt lagi
5. Ketik:
   ```
   git -v
   ```
6. Kalau muncul `git version 2.x.x` → berhasil

---

## BAGIAN 2 — AMBIL KODE DARI GITHUB

### Step 3 — Fork Repository

1. Login ke GitHub
2. Buka repository ini: `https://github.com/artgenerativeindonesia/storyboardgenerator`
3. Klik tombol **"Fork"** di pojok kanan atas
4. Klik **"Create fork"**
5. Sekarang kamu punya salinan kode di akun GitHub kamu sendiri

### Step 4 — Download Kode ke Komputer

1. Di halaman repository kamu (hasil fork tadi), klik tombol hijau **"Code"**
2. Klik **"HTTPS"** lalu copy link yang muncul (bentuknya `https://github.com/NAMAKAMU/storyboardgenerator.git`)
3. Buka Terminal/Command Prompt
4. Ketik perintah berikut — ganti `LINK_TADI` dengan link yang baru kamu copy:
   ```
   git clone LINK_TADI
   ```
5. Tekan Enter — tunggu sampai selesai download
6. Masuk ke folder yang baru didownload:
   ```
   cd storyboardgenerator
   ```
7. Install semua paket yang dibutuhkan:
   ```
   npm install
   ```
8. Tunggu sampai selesai (bisa 2–5 menit)

---

## BAGIAN 3 — SETUP SUPABASE (DATABASE)

### Step 5 — Buat Project Supabase

1. Login ke https://supabase.com
2. Klik **"New project"**
3. Isi:
   - **Organization**: pilih yang ada atau buat baru
   - **Name**: `storyboard-generator` (bebas)
   - **Database Password**: buat password yang kuat — **SIMPAN password ini** di notepad
   - **Region**: pilih yang paling dekat (Singapore untuk Indonesia)
4. Klik **"Create new project"**
5. Tunggu 1–2 menit sampai project selesai dibuat

### Step 6 — Jalankan SQL Database (Buat Tabel)

Ini langkah paling penting. Kamu akan copy-paste dua blok SQL ke Supabase.

1. Di dashboard Supabase, klik menu **"SQL Editor"** di sidebar kiri
2. Klik **"New query"**

**Query pertama — buat semua tabel:**

3. Di komputer kamu, buka folder `storyboardgenerator/supabase/migrations/`
4. Buka file `001_initial_schema.sql` dengan Notepad/TextEdit
5. Pilih semua isi file (Ctrl+A / Cmd+A) lalu copy
6. Paste ke SQL Editor Supabase
7. Klik tombol **"Run"** (atau tekan Ctrl+Enter)
8. Pastikan muncul pesan sukses (hijau) di bawah — kalau merah, cek kembali apakah kamu paste dengan benar

**Query kedua — buat storage bucket:**

9. Klik **"New query"** lagi untuk membuka tab baru
10. Buka file `002_storage_buckets.sql` di folder yang sama
11. Copy semua isinya, paste ke SQL Editor
12. Klik **"Run"**
13. Pastikan sukses (hijau)

### Step 7 — Aktifkan Google Login

1. Di Supabase, klik **"Authentication"** di sidebar kiri
2. Klik **"Providers"**
3. Cari **Google** dan klik untuk expand
4. Toggle **"Enable"** menjadi ON
5. Kamu perlu **Google Client ID** dan **Client Secret** — ikuti langkah di bawah:

**Cara dapat Google Client ID:**

a. Buka https://console.cloud.google.com
b. Buat project baru — klik "New Project", beri nama bebas, klik Create
c. Di menu kiri, klik **"APIs & Services"** → **"Credentials"**
d. Klik **"+ Create Credentials"** → pilih **"OAuth client ID"**
e. Kalau diminta setup consent screen dulu:
   - Klik **"Configure Consent Screen"**
   - Pilih **"External"** → klik Create
   - Isi **App name** (bebas, misal "Storyboard Generator"), **User support email** (email kamu), **Developer contact information** (email kamu)
   - Klik **Save and Continue** sampai selesai semua halaman (skip bagian Scopes dan Test users, langsung Save saja)
f. Kembali ke **Credentials** → klik **"+ Create Credentials"** → pilih **"OAuth client ID"**
g. Pilih **Application type: Web application**
h. Pada bagian **Authorized redirect URIs**, klik **"Add URI"** dan isi:
   ```
   https://KODE_SUPABASE_KAMU.supabase.co/auth/v1/callback
   ```
   Ganti `KODE_SUPABASE_KAMU` dengan kode project Supabase kamu — terlihat di URL dashboard Supabase kamu, misal kalau URL-nya `https://abcdefghijkl.supabase.co` maka kodenya adalah `abcdefghijkl`
i. Klik **"Create"**
j. Akan muncul popup berisi **Client ID** dan **Client Secret** — copy keduanya dan simpan di notepad

6. Kembali ke Supabase → Authentication → Providers → Google
7. Paste **Client ID** dan **Client Secret** ke kolom yang tersedia
8. Klik **"Save"**

### Step 8 — Ambil Kunci Supabase

1. Di Supabase, klik **"Project Settings"** (ikon gear di bagian bawah sidebar kiri)
2. Klik **"API"**
3. Catat/copy dua nilai ini:
   - **Project URL** → bentuknya `https://xxxxxxxxxxxx.supabase.co`
   - **anon public** key → string panjang di bagian "Project API keys"
4. Scroll ke bawah, catat juga:
   - **service_role** key → **JANGAN dibagikan ke siapapun dan jangan diupload ke internet!**

---

## BAGIAN 4 — BUAT FILE KONFIGURASI

### Step 9 — Buat File .env.local

File ini menyimpan "kata sandi rahasia" aplikasi kamu. File ini tidak akan ikut terupload ke GitHub.

1. Di folder `storyboardgenerator` di komputer kamu, buat file baru bernama **`.env.local`** (persis seperti itu, dengan titik di depan, tanpa ekstensi .txt)
2. Isi file tersebut dengan teks berikut — ganti nilainya sesuai data Supabase kamu:

```
NEXT_PUBLIC_SUPABASE_URL=https://KODE_KAMU.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ANON_KEY_KAMU_DISINI
SUPABASE_SERVICE_ROLE_KEY=SERVICE_ROLE_KEY_KAMU_DISINI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Simpan file

**Cara membuat file .env.local di Windows (penting!):**
- Buka Notepad
- Ketik isi di atas dengan nilai yang sudah diganti
- Klik File → Save As
- Navigasi ke folder `storyboardgenerator`
- Pada kolom **"File name"** ketik: `.env.local`
- Pada **"Save as type"** pilih **"All Files (\*.\*)"**
- Klik Save

**Cara membuat file .env.local di Mac:**
- Buka TextEdit
- Format → Make Plain Text
- Ketik isi di atas
- File → Save → beri nama `.env.local` → pilih folder `storyboardgenerator`
- Klik Save

---

## BAGIAN 5 — TEST DI KOMPUTER (LOKAL)

### Step 10 — Jalankan di Komputer Sendiri

1. Buka Terminal/Command Prompt
2. Pastikan kamu berada di folder `storyboardgenerator`. Kalau belum, ketik:
   ```
   cd storyboardgenerator
   ```
   (atau sesuaikan path ke lokasi folder kamu)
3. Jalankan server:
   ```
   npm run dev
   ```
4. Tunggu sampai muncul tulisan **"Ready in X.Xs"**
5. Buka browser, ketik di address bar:
   ```
   http://localhost:3000
   ```
6. Web app seharusnya sudah muncul!
7. Coba login dengan Google
8. Untuk menghentikan server, tekan **Ctrl+C** di Terminal

---

## BAGIAN 6 — DEPLOY KE INTERNET (VERCEL)

Supaya web app bisa diakses dari mana saja — bukan hanya dari komputer sendiri — deploy ke Vercel.

### Step 11 — Push Kode ke GitHub

> File `.env.local` sudah otomatis diabaikan oleh Git (ada di `.gitignore`), jadi aman — kunci rahasia tidak akan terupload.

1. Di Terminal, pastikan kamu di folder `storyboardgenerator`, lalu ketik:
   ```
   git add .
   git commit -m "first deploy"
   git push
   ```
2. Masukkan username dan password GitHub kalau diminta
3. Buka GitHub — kamu akan lihat kode sudah ada di repository kamu

### Step 12 — Deploy ke Vercel

1. Login ke https://vercel.com
2. Klik tombol **"Add New..."** → pilih **"Project"**
3. Klik **"Import Git Repository"**
4. Klik **"Connect GitHub"** kalau belum terhubung → izinkan akses
5. Cari repository `storyboardgenerator` dan klik **"Import"**
6. Di halaman konfigurasi, cari bagian **"Environment Variables"** dan expand
7. Tambahkan empat variabel berikut satu per satu (klik "Add" setiap kali):

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase kamu (https://xxxx.supabase.co) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase kamu |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role key Supabase kamu |
   | `NEXT_PUBLIC_APP_URL` | Isi dulu `https://storyboard.vercel.app` (akan diupdate setelah deploy) |

8. Klik **"Deploy"**
9. Tunggu 2–3 menit sampai proses selesai
10. Vercel akan memberi URL seperti `https://storyboardgenerator-abc123.vercel.app`
11. **Copy URL tersebut — kamu butuh ini untuk langkah berikutnya**

### Step 13 — Update URL di Vercel dan Supabase

Setelah dapat URL resmi dari Vercel, perbarui konfigurasi di tiga tempat:

**Di Vercel — update APP_URL:**
1. Klik nama project kamu → **"Settings"** → **"Environment Variables"**
2. Cari `NEXT_PUBLIC_APP_URL` → klik Edit
3. Ganti nilainya dengan URL Vercel kamu yang asli (contoh: `https://storyboardgenerator-abc123.vercel.app`)
4. Klik **"Save"**
5. Pergi ke **"Deployments"** → klik tiga titik (...) pada deployment terbaru → klik **"Redeploy"**

**Di Supabase — update Auth URL:**
1. Buka Supabase → **"Authentication"** → **"URL Configuration"**
2. Pada **"Site URL"**, isi dengan URL Vercel kamu
3. Pada **"Redirect URLs"**, klik **"Add URL"** dan tambahkan:
   ```
   https://URL_VERCEL_KAMU/api/auth/callback
   ```
4. Klik **"Save"**

**Di Google Cloud — tambah redirect URI production:**
1. Buka https://console.cloud.google.com → **APIs & Services** → **Credentials**
2. Klik nama OAuth client yang tadi dibuat
3. Pada bagian **Authorized redirect URIs**, klik **"Add URI"** dan tambahkan:
   ```
   https://URL_VERCEL_KAMU/api/auth/callback
   ```
4. Klik **Save**

---

## BAGIAN 7 — SETTING DI DALAM APLIKASI

Setelah berhasil login ke web app, masukkan API key di halaman Settings.

### Step 14 — Masukkan OpenRouter API Key

OpenRouter digunakan untuk generate script dan shotlist dengan AI (model seperti GPT-4, Claude, dll.).

1. Buka https://openrouter.ai
2. Daftar akun (bisa pakai Google)
3. Klik foto profil → **"API Keys"**
4. Klik **"Create Key"** → beri nama bebas → klik **"Create"**
5. Copy API key yang muncul (bentuknya dimulai dengan `sk-or-...`) — **simpan sekarang, tidak bisa dilihat lagi nanti**
6. Di web app kamu, klik ikon **Settings** (gear) di sidebar
7. Paste key tersebut di kolom **"OpenRouter API Key"**
8. Pilih model AI yang ingin digunakan:
   - Rekomendasi kualitas terbaik: `anthropic/claude-3.5-sonnet`
   - Rekomendasi harga murah: `openai/gpt-4o-mini`
9. Klik **"Save Settings"**

### Step 15 — Masukkan Image Generation API Key

Pilih salah satu provider gambar sesuai yang kamu punya akun:

**Higgsfield (rekomendasi untuk kualitas sinematik):**
1. Buka https://higgsfield.ai
2. Daftar dan masuk ke dashboard
3. Cari menu **"API"** atau **"Developer"** → buat API key baru
4. Copy dan paste ke Settings → kolom **"Higgsfield API Key"**
5. Pilih **Higgsfield** sebagai provider aktif

**kie.ai:**
1. Buka https://kie.ai
2. Daftar → masuk ke dashboard → cari **"API Keys"**
3. Buat key baru → copy dan paste ke Settings → kolom **"kie.ai API Key"**
4. Pilih **kie.ai** sebagai provider aktif

**wavespeed.ai:**
1. Buka https://wavespeed.ai
2. Daftar → masuk → cari **"API"** di menu → buat key baru
3. Copy dan paste ke Settings → kolom **"Wavespeed API Key"**
4. Pilih **wavespeed.ai** sebagai provider aktif

Klik **"Save Settings"** setelah mengisi.

---

## SELESAI! CARA PAKAI APLIKASI

```
1. Buka web app → login dengan Google
2. Klik "+ New Project" → beri nama project
3. Upload file PDF (screenplay, treatment, dokumen referensi)
4. Klik "New Session" → pilih file → tulis instruksi (opsional)
5. Klik "Generate Script" → tunggu AI menulis skrip
6. Review dan edit skrip → bisa gunakan AI Edit untuk perbaikan spesifik
7. Klik "Generate Shotlist" → AI buat tabel shot sinematik
8. Review tabel shotlist → edit sel kalau perlu → klik "Generate Images"
9. Gambar akan muncul satu per satu secara otomatis
10. Download script (PDF), shotlist (PDF), atau semua gambar sekaligus (ZIP)
```

Setiap tahap tersimpan otomatis. Refresh halaman tidak akan menghilangkan progress.

---

## TROUBLESHOOTING — MASALAH UMUM

**Login tidak bisa / muncul error redirect:**
→ Cek kembali Step 13 — URL Vercel kamu harus ditambahkan ke:
   (1) Supabase → Authentication → URL Configuration → Redirect URLs
   (2) Google Cloud → Credentials → OAuth Client → Authorized redirect URIs

**"OpenRouter API key not configured":**
→ Buka Settings di aplikasi dan masukkan API key OpenRouter (Step 14)

**Build gagal di Vercel / deploy error:**
→ Buka tab "Build Logs" di Vercel untuk lihat error
→ Pastikan keempat environment variable sudah diisi dengan benar di Vercel Settings

**Halaman kosong atau error putih:**
→ Tekan F12 di browser → klik tab "Console" → screenshot pesan error merahnya

**Database error / data tidak muncul:**
→ Pastikan kedua file SQL (001 dan 002) sudah dijalankan di Supabase SQL Editor (Step 6)
→ Cek Supabase → Table Editor — seharusnya ada tabel: projects, files, generation_sessions, dll.

**Generate gambar gagal / tidak muncul:**
→ Cek API key image provider sudah diisi dengan benar di Settings
→ Cek saldo/kredit akun provider kamu masih ada

**File PDF tidak bisa diupload:**
→ Ukuran maksimal file adalah 50MB
→ Hanya file PDF dan teks (.txt) yang didukung

---

Dibuat oleh tim **artgenerativeindonesia**.
Pertanyaan? Buka Issues di repository GitHub ini.
