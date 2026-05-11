# PANDUAN SETUP STORYBOARD GENERATOR
### Untuk pemula — tidak perlu bisa coding apapun

---

## SEBELUM MULAI — BACA INI DULU

Panduan ini dibagi menjadi **4 fase besar** yang harus dikerjakan berurutan:

```
FASE 1  →  Siapkan akun dan install software di komputer
FASE 2  →  Siapkan database (Supabase)
FASE 3  →  Siapkan sistem login Google
FASE 4  →  Upload kode dan akses web app
```

Setiap langkah harus selesai sebelum lanjut ke langkah berikutnya.
Jangan lewati satupun langkah meskipun kamu merasa tidak perlu.

---

## CHECKLIST AKUN YANG DIBUTUHKAN

Buat semua akun ini sebelum mulai. Semuanya gratis.

- [ ] **GitHub** → daftar di https://github.com
- [ ] **Supabase** → daftar di https://supabase.com
- [ ] **Google** → pakai akun Gmail yang sudah ada (atau buat baru)
- [ ] **Google Cloud** → daftar di https://console.cloud.google.com (pakai akun Gmail di atas)
- [ ] **Vercel** → daftar di https://vercel.com (bisa pakai akun GitHub)
- [ ] **OpenRouter** → daftar di https://openrouter.ai (untuk fitur generate AI)

Sudah semua? Lanjut ke Fase 1.

---

---

# FASE 1 — SIAPKAN KOMPUTER KAMU

---

## Step 1 — Install Node.js

Node.js adalah software yang dibutuhkan untuk menjalankan aplikasi ini.

1. Buka browser, pergi ke **https://nodejs.org**
2. Kamu akan melihat dua tombol download besar
3. Klik tombol yang bertuliskan **"LTS"** — jangan klik yang "Current"
4. File installer akan terdownload ke komputer kamu
5. Buka file installer yang baru didownload
6. Klik **Next** → **Next** → **Next** → **Install** → **Finish**
   (pilihan default sudah benar, tidak perlu diubah)
7. Setelah selesai, buka **Terminal** (Mac/Linux) atau **Command Prompt** (Windows):
   - **Windows:** tekan tombol `Windows + R`, ketik `cmd`, tekan Enter
   - **Mac:** buka Spotlight (Cmd+Space), ketik `Terminal`, tekan Enter
8. Di jendela hitam yang muncul, ketik perintah berikut lalu tekan Enter:
   ```
   node -v
   ```
9. Kalau muncul tulisan seperti `v20.11.0` atau angka lainnya → **Node.js berhasil diinstall**
10. Kalau muncul pesan error → restart komputer dan coba lagi dari langkah 7

---

## Step 2 — Install Git

Git adalah software untuk mengelola dan mendownload kode dari internet.

1. Buka browser, pergi ke **https://git-scm.com/downloads**
2. Klik nama sistem operasi kamu: **Windows**, **macOS**, atau **Linux**
3. Download file installer yang tersedia
4. Buka file installer
5. Klik **Next** terus sampai tombol **Install** muncul, lalu klik **Install**
   (semua pilihan default sudah benar)
6. Klik **Finish**
7. Tutup dan buka kembali Terminal atau Command Prompt
8. Ketik perintah berikut lalu tekan Enter:
   ```
   git -v
   ```
9. Kalau muncul tulisan seperti `git version 2.43.0` → **Git berhasil diinstall**
10. Kalau muncul pesan error → restart komputer dan coba lagi dari langkah 7

---

## Step 3 — Download Kode Aplikasi

Sekarang kamu akan mengambil salinan kode dari GitHub ke komputer kamu.

**Pertama, fork repository (buat salinan di akun GitHub kamu sendiri):**

1. Login ke **https://github.com** dengan akun GitHub kamu
2. Pergi ke alamat berikut:
   ```
   https://github.com/artgenerativeindonesia/storyboardgenerator
   ```
3. Di pojok kanan atas halaman, klik tombol **"Fork"**
4. Akan muncul halaman "Create a new fork"
5. Tidak perlu mengubah apapun — langsung klik tombol **"Create fork"**
6. Tunggu beberapa detik
7. Sekarang kamu akan diarahkan ke halaman repository baru di akun kamu sendiri
   — perhatikan URL sudah berubah menjadi `https://github.com/NAMA_AKUN_KAMU/storyboardgenerator`

**Kedua, download kode tersebut ke komputer kamu:**

8. Di halaman repository kamu (yang barusan dibuat), klik tombol hijau **"Code"**
9. Pastikan tab **"HTTPS"** yang aktif (bukan SSH)
10. Klik ikon copy (dua kotak bertumpuk) di sebelah kanan link yang muncul
    — link berbentuk `https://github.com/NAMA_KAMU/storyboardgenerator.git`
11. Buka Terminal atau Command Prompt
12. Ketik perintah berikut, lalu **hapus LINK_YANG_DICOPY dan ganti** dengan link yang kamu copy tadi:
    ```
    git clone LINK_YANG_DICOPY
    ```
    Contoh jadinya:
    ```
    git clone https://github.com/budi123/storyboardgenerator.git
    ```
13. Tekan Enter dan tunggu — proses download berjalan, mungkin 1–2 menit
14. Setelah selesai, ketik perintah berikut untuk masuk ke folder kode:
    ```
    cd storyboardgenerator
    ```
15. Tekan Enter
16. Sekarang ketik perintah berikut untuk install semua komponen yang dibutuhkan:
    ```
    npm install
    ```
17. Tekan Enter dan tunggu sampai selesai — proses ini bisa memakan waktu **2–5 menit**
18. Saat muncul kursor siap menerima perintah lagi (tanpa loading) → **selesai**

> Terminal tetap dibuka — kamu akan pakai lagi nanti.

---

---

# FASE 2 — SIAPKAN DATABASE (SUPABASE)

Supabase adalah tempat semua data aplikasi disimpan: project, file, script, shotlist, dan gambar.

---

## Step 4 — Buat Project di Supabase

1. Buka browser baru, pergi ke **https://supabase.com**
2. Login dengan akun Supabase kamu
3. Kamu akan masuk ke halaman dashboard
4. Klik tombol **"New project"**
5. Isi formulir yang muncul:
   - **Organization:** pilih organisasi yang sudah ada, atau klik "New organization" → isi nama bebas → klik Create
   - **Project name:** ketik nama bebas, misalnya `storyboard-generator`
   - **Database Password:** buat password yang kuat
     > ⚠️ **PENTING:** Buka Notepad (Windows) atau TextEdit (Mac), tulis password ini dan simpan filenya. Kamu butuh ini nanti.
   - **Region:** pilih **Southeast Asia (Singapore)** untuk koneksi terbaik dari Indonesia
6. Klik tombol **"Create new project"**
7. Tunggu **1–3 menit** sampai proses setup selesai
8. Kamu akan melihat halaman dashboard project — kalau masih loading, tunggu saja sampai selesai

---

## Step 5 — Buat Tabel Database (Bagian 1 dari 2)

Kamu akan menjalankan dua file SQL yang sudah ada di folder kode kamu. File pertama membuat semua tabel yang dibutuhkan aplikasi.

1. Di dashboard Supabase, lihat menu di sidebar kiri
2. Klik menu **"SQL Editor"** (ikon kode `</>`)
3. Di bagian tengah atas, klik tombol **"New query"**
4. Sebuah tab baru dengan area teks kosong akan muncul

Sekarang buka file SQL di komputer kamu:

5. Buka **File Explorer** (Windows) atau **Finder** (Mac)
6. Navigasi ke folder `storyboardgenerator` → folder `supabase` → folder `migrations`
7. Klik kanan pada file **`001_initial_schema.sql`** → pilih **"Open with"** → pilih **Notepad** (Windows) atau **TextEdit** (Mac)
8. Di Notepad/TextEdit, tekan **Ctrl+A** (Windows) atau **Cmd+A** (Mac) untuk pilih semua teks
9. Tekan **Ctrl+C** (Windows) atau **Cmd+C** (Mac) untuk copy

Kembali ke tab Supabase SQL Editor:

10. Klik pada area teks kosong di SQL Editor
11. Tekan **Ctrl+V** (Windows) atau **Cmd+V** (Mac) untuk paste
12. Kamu akan melihat banyak teks kode berwarna-warni
13. Klik tombol **"Run"** (tombol hijau di kanan atas area kode), atau tekan **Ctrl+Enter**
14. Di bawah area kode, tunggu muncul pesan **"Success. No rows returned"** dengan warna hijau
15. Kalau muncul pesan merah (error) → pastikan kamu paste keseluruhan isi file, tidak ada yang terpotong

---

## Step 6 — Buat Tabel Database (Bagian 2 dari 2)

File kedua membuat tempat penyimpanan untuk file PDF dan gambar.

1. Masih di Supabase SQL Editor, klik tombol **"New query"** lagi untuk membuat tab query baru
2. Kembali ke File Explorer / Finder di komputer kamu
3. Dari folder `migrations` yang sama, buka file **`002_storage_buckets.sql`** dengan Notepad / TextEdit
4. Pilih semua teks (Ctrl+A / Cmd+A) → copy (Ctrl+C / Cmd+C)
5. Kembali ke Supabase, klik area teks kosong di tab query yang baru
6. Paste (Ctrl+V / Cmd+V)
7. Klik tombol **"Run"**
8. Tunggu muncul pesan hijau **"Success"**

Verifikasi berhasil:

9. Di sidebar kiri Supabase, klik menu **"Table Editor"** (ikon tabel)
10. Kamu seharusnya melihat daftar tabel: `projects`, `files`, `generation_sessions`, `scripts`, `shotlist_rows`, `generated_images`, `user_settings`
11. Kalau daftar kosong → ulangi Step 5 dan Step 6

---

## Step 7 — Catat Kunci Supabase

Kamu perlu menyimpan 3 nilai penting dari Supabase. Buka Notepad/TextEdit yang tadi dan tambahkan catatan ini.

1. Di sidebar Supabase, paling bawah, klik ikon **roda gigi ⚙️** (Project Settings)
2. Klik menu **"API"** di sidebar yang muncul
3. Di bagian **"Project URL"**, kamu akan melihat URL seperti `https://abcdefgh.supabase.co`
   > 📝 **Catat nilai ini** — ini adalah `SUPABASE_URL`
4. Di bagian **"Project API keys"**, kamu akan melihat dua key:
   - **anon public** → copy nilai panjangnya
   > 📝 **Catat nilai ini** — ini adalah `ANON_KEY`
   - **service_role** → klik "Reveal" lalu copy nilainya
   > 📝 **Catat nilai ini** — ini adalah `SERVICE_ROLE_KEY`
   > ⚠️ Jangan pernah bagikan `service_role` key ke siapapun

Sekarang kamu punya 3 nilai tersimpan di Notepad. Jangan tutup Notepad ini.

---

---

# FASE 3 — SIAPKAN SISTEM LOGIN GOOGLE

Ini fase yang paling banyak langkahnya. Kamu akan berpindah antara tiga website: **Google Cloud**, lalu **Supabase**, lalu nanti **Google Cloud** lagi saat setelah deploy. Ikuti urutan dengan teliti.

---

## Step 8 — Buat Project di Google Cloud

1. Buka tab browser baru, pergi ke **https://console.cloud.google.com**
2. Login dengan akun Gmail kamu
3. Kalau pertama kali, setuju dengan syarat & ketentuan yang muncul
4. Di bagian atas halaman (dekat logo Google Cloud), klik dropdown nama project
   — biasanya tertulis "Select a project" atau nama project sebelumnya
5. Di popup yang muncul, klik tombol **"New Project"** di pojok kanan atas popup
6. Isi **"Project name"** dengan nama bebas, misalnya `storyboard-auth`
7. Klik tombol **"Create"**
8. Tunggu beberapa detik sampai project selesai dibuat
9. Pastikan project baru kamu yang terpilih — cek dropdown di bagian atas, harus menampilkan nama project yang baru dibuat

---

## Step 9 — Setup OAuth Consent Screen

Ini adalah "halaman izin" yang muncul saat user login dengan Google.

1. Di Google Cloud, lihat menu di sidebar kiri
2. Klik **"APIs & Services"** → klik **"OAuth consent screen"**
3. Pilih **"External"** → klik tombol **"Create"**
4. Kamu masuk ke form "Edit app registration"
5. Isi bagian **App information:**
   - **App name:** ketik `Storyboard Generator` (bebas)
   - **User support email:** pilih email kamu dari dropdown
6. Scroll ke bawah ke bagian **"Developer contact information"**
   - **Email addresses:** ketik email kamu
7. Klik tombol **"Save and Continue"** di bagian bawah
8. Kamu masuk ke halaman **"Scopes"** — tidak perlu diubah apapun
9. Klik tombol **"Save and Continue"**
10. Kamu masuk ke halaman **"Test users"** — tidak perlu diubah apapun
11. Klik tombol **"Save and Continue"**
12. Kamu masuk ke halaman **"Summary"** — periksa sekilas, lalu klik **"Back to Dashboard"**

---

## Step 10 — Buat OAuth Credentials (Client ID & Secret)

1. Masih di Google Cloud, klik menu **"APIs & Services"** → klik **"Credentials"**
2. Di bagian atas, klik tombol **"+ Create Credentials"**
3. Dari dropdown yang muncul, pilih **"OAuth client ID"**
4. Di halaman "Create OAuth client ID":
   - **Application type:** klik dropdown → pilih **"Web application"**
   - **Name:** biarkan default atau ketik nama bebas
5. Scroll ke bawah ke bagian **"Authorized redirect URIs"**
6. Klik tombol **"+ Add URI"**
7. Di kolom yang muncul, ketik URI berikut — **ganti `SUPABASE_URL_KAMU`** dengan URL Supabase yang sudah kamu catat di Step 7:
   ```
   https://SUPABASE_URL_KAMU/auth/v1/callback
   ```
   Contoh jadinya (sesuaikan dengan URL Supabase kamu):
   ```
   https://abcdefgh.supabase.co/auth/v1/callback
   ```
   > Perhatikan: yang dimasukkan hanya kode unik Supabase kamu, bukan kata-kata `SUPABASE_URL_KAMU`
8. Klik tombol **"Create"**
9. Akan muncul popup **"OAuth client created"** berisi dua nilai penting:
   - **Your Client ID** → copy nilai ini
   > 📝 **Catat di Notepad** — ini adalah `GOOGLE_CLIENT_ID`
   - **Your Client Secret** → copy nilai ini
   > 📝 **Catat di Notepad** — ini adalah `GOOGLE_CLIENT_SECRET`
10. Klik **"OK"** untuk menutup popup

---

## Step 11 — Aktifkan Google Login di Supabase

Sekarang kembali ke tab Supabase.

1. Di Supabase, klik menu **"Authentication"** di sidebar kiri (ikon gembok)
2. Klik **"Providers"**
3. Kamu akan melihat daftar provider login — cari **"Google"** dan klik untuk expand
4. Klik toggle **"Enable Sign in with Google"** sehingga berubah menjadi aktif (biru/hijau)
5. Di kolom **"Client ID (for OAuth)"**, paste nilai `GOOGLE_CLIENT_ID` yang kamu catat tadi
6. Di kolom **"Client Secret"**, paste nilai `GOOGLE_CLIENT_SECRET` yang kamu catat tadi
7. Klik tombol **"Save"** di bagian bawah section Google

---

---

# FASE 4 — UPLOAD KODE DAN AKSES WEB APP

---

## Step 12 — Buat File Konfigurasi (.env.local)

File `.env.local` adalah file rahasia berisi semua "kata sandi" yang dibutuhkan aplikasi. File ini tidak akan pernah terupload ke internet.

**Buat file ini di Windows:**

1. Buka Notepad
2. Ketik isi berikut — **ganti setiap nilai** dengan data yang kamu catat di Notepad tadi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://KODE_KAMU.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ANON_KEY_KAMU
   SUPABASE_SERVICE_ROLE_KEY=SERVICE_ROLE_KEY_KAMU
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
3. Contoh setelah diisi (nilai kamu pasti berbeda):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. Klik **File** → **Save As**
5. Di jendela Save As, navigasi ke folder `storyboardgenerator` (folder kode yang didownload tadi)
6. Pada kolom **"File name"**, hapus teks yang ada dan ketik: `.env.local`
   > Persis seperti itu — ada titik di depan, tidak ada ekstensi .txt
7. Pada dropdown **"Save as type"**, pilih **"All Files (\*.\*)"**
   > Ini penting! Kalau tidak diganti, file akan tersimpan sebagai `.env.local.txt` yang tidak akan terbaca
8. Klik **Save**

**Buat file ini di Mac:**

1. Buka **TextEdit**
2. Klik menu **Format** → pilih **"Make Plain Text"**
3. Ketik isi yang sama seperti di atas (sudah diisi dengan nilai kamu)
4. Klik **File** → **Save**
5. Beri nama **`.env.local`** (dengan titik di depan)
6. Pilih folder `storyboardgenerator` sebagai lokasi penyimpanan
7. Kalau muncul peringatan tentang ekstensi — klik **"Use .env.local"** atau **"Don't Append"**
8. Klik **Save**

**Verifikasi file sudah benar:**

9. Buka Terminal / Command Prompt
10. Pastikan kamu masih di folder `storyboardgenerator` (kalau belum, ketik `cd storyboardgenerator` lalu Enter)
11. Ketik perintah berikut lalu tekan Enter:
    - **Windows:** `dir /a .env.local`
    - **Mac/Linux:** `ls -la .env.local`
12. Kalau file muncul di hasil → file sudah ada dan siap digunakan

---

## Step 13 — Test di Komputer Sendiri (Opsional tapi Disarankan)

Sebelum deploy ke internet, tes dulu di komputer sendiri untuk memastikan semuanya berjalan.

1. Buka Terminal / Command Prompt
2. Pastikan kamu berada di folder `storyboardgenerator`:
   ```
   cd storyboardgenerator
   ```
3. Ketik perintah berikut lalu tekan Enter:
   ```
   npm run dev
   ```
4. Tunggu beberapa detik sampai muncul tulisan **"✓ Ready in X.Xs"**
5. Buka browser, ketik di address bar:
   ```
   http://localhost:3000
   ```
6. Tekan Enter — halaman login aplikasi seharusnya muncul
7. Coba klik tombol **"Sign in with Google"** dan login
8. Kalau berhasil masuk ke halaman Projects → semuanya berjalan dengan baik!
9. Kembali ke Terminal, tekan **Ctrl+C** untuk menghentikan server lokal

Kalau ada error di sini, periksa:
- Apakah file `.env.local` sudah berisi nilai yang benar (bukan placeholder)
- Apakah Step 5 dan Step 6 (SQL migrations) sudah berhasil dijalankan
- Apakah Step 11 (Google OAuth di Supabase) sudah disimpan

---

## Step 14 — Upload Kode ke GitHub

1. Buka Terminal / Command Prompt
2. Pastikan kamu di folder `storyboardgenerator`
3. Ketik perintah pertama lalu tekan Enter:
   ```
   git add .
   ```
4. Ketik perintah kedua lalu tekan Enter:
   ```
   git commit -m "ready to deploy"
   ```
5. Ketik perintah ketiga lalu tekan Enter:
   ```
   git push
   ```
6. Kalau muncul permintaan username dan password GitHub → masukkan credential akun GitHub kamu
7. Tunggu sampai proses selesai (muncul kursor siap lagi)
8. Buka https://github.com → masuk ke repository `storyboardgenerator` kamu
9. Pastikan file-file kode terlihat di sana → **upload berhasil**

> File `.env.local` tidak akan ikut terupload — ini sudah diamankan secara otomatis. Kunci-kunci rahasia kamu tetap aman.

---

## Step 15 — Deploy ke Vercel

1. Buka tab browser baru, pergi ke **https://vercel.com**
2. Login dengan akun Vercel kamu
3. Di dashboard Vercel, klik tombol **"Add New..."** → pilih **"Project"**
4. Kamu akan melihat halaman "Import Git Repository"
5. Kalau akun GitHub belum terhubung:
   - Klik tombol **"Connect GitHub"**
   - Klik **"Authorize Vercel"** di halaman GitHub yang muncul
   - Kembali ke Vercel
6. Cari repository bernama `storyboardgenerator` di daftar
7. Klik tombol **"Import"** di sebelah kanan nama repository tersebut
8. Kamu masuk ke halaman konfigurasi deploy
9. Di bagian **"Environment Variables"**, kamu perlu menambahkan 4 variabel:
   - Klik **"Add"** untuk setiap variabel
   - Isi **Name** dan **Value** sesuai tabel berikut:

   | Name | Value yang diisi |
   |------|-----------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase kamu (dari catatan Step 7) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase kamu (dari catatan Step 7) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role key Supabase kamu (dari catatan Step 7) |
   | `NEXT_PUBLIC_APP_URL` | Ketik sementara: `https://belum-diketahui.vercel.app` |

10. Setelah keempat variabel diisi, klik tombol **"Deploy"**
11. Vercel akan mulai proses build — tunggu **2–4 menit**
12. Kalau berhasil, akan muncul halaman "Congratulations!" dengan konfetti
13. Di halaman tersebut, kamu akan melihat URL aplikasi kamu — berbentuk seperti:
    `https://storyboardgenerator-abc123.vercel.app`
14. > 📝 **Catat URL ini di Notepad** — ini adalah `URL_VERCEL` kamu

---

## Step 16 — Update URL Vercel di Environment Variables

Sekarang kamu tahu URL asli aplikasi kamu. Perbarui nilai yang tadi diisi sementara.

1. Masih di Vercel, klik nama project kamu
2. Klik menu **"Settings"** di bagian atas
3. Klik menu **"Environment Variables"** di sidebar kiri
4. Cari variabel `NEXT_PUBLIC_APP_URL`
5. Klik tombol edit (ikon pensil) di sebelah kanan variabel tersebut
6. Hapus nilai lama (`https://belum-diketahui.vercel.app`)
7. Ketik URL Vercel asli kamu yang baru saja dicatat
   Contoh: `https://storyboardgenerator-abc123.vercel.app`
8. Klik tombol **"Save"**
9. Sekarang pergi ke menu **"Deployments"** (klik di bagian atas)
10. Di daftar deployments, cari deployment paling atas (terbaru)
11. Klik tiga titik (**...**) di sebelah kanan deployment tersebut
12. Klik **"Redeploy"**
13. Konfirmasi dengan klik **"Redeploy"** lagi di popup yang muncul
14. Tunggu proses selesai (1–2 menit)

---

## Step 17 — Update URL di Supabase

1. Kembali ke tab Supabase
2. Di sidebar kiri, klik **"Authentication"**
3. Klik **"URL Configuration"**
4. Di kolom **"Site URL"**, hapus nilai yang ada dan ketik URL Vercel kamu:
   ```
   https://storyboardgenerator-abc123.vercel.app
   ```
   (ganti dengan URL kamu yang asli)
5. Di bagian **"Redirect URLs"**, klik tombol **"Add URL"**
6. Di kolom yang muncul, ketik:
   ```
   https://storyboardgenerator-abc123.vercel.app/api/auth/callback
   ```
   (ganti bagian `storyboardgenerator-abc123.vercel.app` dengan URL kamu yang asli)
7. Klik tombol **"Save"**

---

## Step 18 — Update Redirect URI di Google Cloud

1. Kembali ke tab Google Cloud (**https://console.cloud.google.com**)
2. Pastikan project yang benar terpilih di dropdown atas
3. Di sidebar kiri, klik **"APIs & Services"** → klik **"Credentials"**
4. Di daftar OAuth 2.0 Client IDs, klik nama OAuth client yang kamu buat tadi
5. Scroll ke bawah ke bagian **"Authorized redirect URIs"**
6. Klik tombol **"+ Add URI"**
7. Di kolom baru yang muncul, ketik:
   ```
   https://storyboardgenerator-abc123.vercel.app/api/auth/callback
   ```
   (ganti dengan URL Vercel kamu yang asli)
8. Klik tombol **"Save"** di bagian bawah halaman
9. Tunggu beberapa detik sampai muncul konfirmasi perubahan tersimpan

---

## Step 19 — Daftar di OpenRouter dan Dapatkan API Key

OpenRouter dibutuhkan untuk fitur generate script dan shotlist menggunakan AI.

1. Buka tab browser baru, pergi ke **https://openrouter.ai**
2. Klik tombol **"Sign In"** atau **"Get Started"**
3. Daftar menggunakan akun Google atau email
4. Setelah masuk ke dashboard, klik foto profil atau nama kamu di pojok kanan atas
5. Pilih **"API Keys"** dari dropdown menu
6. Klik tombol **"Create Key"**
7. Di kolom nama, ketik nama bebas misalnya `storyboard-app`
8. Klik tombol **"Create"**
9. API key kamu akan muncul — bentuknya seperti `sk-or-v1-xxxxxxxxxxxxxxxxxx`
10. > ⚠️ **Segera copy dan simpan di Notepad sekarang!** API key ini hanya ditampilkan sekali — kalau kamu tutup halaman ini, kamu tidak bisa melihatnya lagi (harus buat baru)
11. Untuk mengisi saldo, klik **"Credits"** di menu profil — isi saldo minimal sesuai kebutuhan

---

## Step 20 — Daftar di Provider Gambar AI dan Dapatkan API Key

Pilih **salah satu** dari tiga provider di bawah ini:

---

**Pilihan A — Higgsfield** (rekomendasi untuk kualitas sinematik)

1. Buka **https://higgsfield.ai**
2. Klik **"Sign Up"** dan daftar akun
3. Setelah masuk, cari menu **"API"** atau **"Developer"** di dashboard
4. Buat API key baru
5. Copy dan simpan API key di Notepad

---

**Pilihan B — kie.ai**

1. Buka **https://kie.ai**
2. Klik **"Sign Up"** dan daftar akun
3. Masuk ke dashboard, cari menu **"API Keys"**
4. Klik **"Create"** atau **"Generate"**
5. Copy dan simpan API key di Notepad

---

**Pilihan C — wavespeed.ai**

1. Buka **https://wavespeed.ai**
2. Klik **"Sign Up"** dan daftar akun
3. Masuk ke dashboard, cari menu **"API"**
4. Buat key baru
5. Copy dan simpan API key di Notepad

---

## Step 21 — Masukkan API Key di Aplikasi

Ini adalah langkah terakhir!

1. Buka browser, pergi ke URL aplikasi kamu di Vercel
2. Login dengan Google
3. Kamu akan masuk ke halaman **Projects**
4. Di sidebar kiri bagian bawah, klik ikon **roda gigi ⚙️ (Settings)**
5. Kamu masuk ke halaman Settings

**Isi API Key untuk AI (wajib):**

6. Di bagian **"AI Language Model"**, klik pada kolom **"OpenRouter API Key"**
7. Paste API key OpenRouter yang kamu simpan tadi
8. Klik dropdown **"Model"** dan pilih model AI yang diinginkan
   - Untuk kualitas terbaik: pilih `anthropic/claude-3.5-sonnet`
   - Untuk hemat biaya: pilih `openai/gpt-4o-mini`
9. Klik tombol **"Save"** di bagian AI Language Model

**Isi API Key untuk Generate Gambar (opsional):**

10. Di bagian **"Image Generation"**, klik dropdown provider
11. Pilih provider yang kamu daftar tadi (Higgsfield / kie.ai / wavespeed.ai)
12. Akan muncul kolom API key — paste API key provider gambar kamu
13. Klik tombol **"Save"** di bagian Image Generation

---

# SELESAI!

Aplikasi kamu sudah siap digunakan. Buka USAGE.md untuk panduan cara menggunakannya.

**Ringkasan singkat cara pakai:**
```
1. Login dengan Google
2. Buat Project baru
3. Upload file PDF
4. Buat Session → pilih file → tulis instruksi
5. Generate Script → review & edit
6. Generate Shotlist → review & edit
7. Generate Images → download
```

---

## TROUBLESHOOTING — MASALAH UMUM

**Masalah: Login tidak bisa / muncul halaman error setelah klik Sign in with Google**

Penyebab: URL callback belum diupdate dengan benar.
Solusi:
- Ulangi Step 17 — pastikan URL Vercel kamu sudah ditambahkan di Supabase → Authentication → URL Configuration → Redirect URLs
- Ulangi Step 18 — pastikan URL yang sama sudah ditambahkan di Google Cloud → Credentials → Authorized redirect URIs
- Pastikan formatnya `https://URL_KAMU/api/auth/callback` (ada `/api/auth/callback` di akhir)

---

**Masalah: Halaman web app muncul tapi kosong atau ada tulisan error**

Penyebab: Environment variables salah atau tidak lengkap.
Solusi:
- Buka Vercel → project kamu → Settings → Environment Variables
- Periksa apakah keempat variabel sudah ada dan nilainya sudah benar
- Setelah mengubah, lakukan Redeploy (seperti di Step 16 langkah 9–14)

---

**Masalah: Deploy di Vercel gagal / build error**

Penyebab: Biasanya ada environment variable yang kurang.
Solusi:
- Di Vercel, klik deployment yang gagal → klik "View Build Logs"
- Baca pesan error yang muncul
- Pastikan semua 4 environment variables sudah diisi (Step 15 langkah 9)

---

**Masalah: Database error / data tidak tersimpan**

Penyebab: SQL migration belum dijalankan atau gagal.
Solusi:
- Buka Supabase → Table Editor
- Kalau daftar tabel kosong → ulangi Step 5 dan Step 6
- Pastikan kedua file SQL sudah dijalankan dan mendapat response hijau "Success"

---

**Masalah: "OpenRouter API key not configured" saat mau generate**

Penyebab: API key OpenRouter belum diisi di Settings aplikasi.
Solusi:
- Buka aplikasi → Settings → isi kolom "OpenRouter API Key" → klik Save
- Pastikan key dimulai dengan `sk-or-v1-`

---

**Masalah: Generate gambar gagal atau tidak muncul**

Penyebab: API key provider gambar salah atau saldo habis.
Solusi:
- Buka aplikasi → Settings → cek API key provider gambar sudah benar
- Buka website provider (Higgsfield/kie.ai/wavespeed.ai) → cek saldo masih ada

---

**Masalah: File PDF tidak bisa diupload**

Penyebab: Format atau ukuran tidak sesuai.
Solusi:
- Pastikan file berformat PDF atau .txt
- Pastikan ukuran file di bawah 50MB
- Coba kompres PDF terlebih dahulu kalau terlalu besar

---

Dibuat oleh tim **artgenerativeindonesia**.
Ada pertanyaan atau masalah? Buka Issues di repository GitHub ini.
