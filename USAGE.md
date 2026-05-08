# PANDUAN PENGGUNAAN STORYBOARD GENERATOR
### Cara pakai web app — step by step untuk semua orang

---

## GAMBARAN BESAR — INI YANG AKAN KAMU LAKUKAN

Aplikasi ini bekerja dalam **6 tahap berurutan**, dari upload dokumen sampai gambar jadi:

```
TAHAP 1 → Upload file & tulis instruksi
TAHAP 2 → AI generate script (otomatis)
TAHAP 3 → Review & edit script
TAHAP 4 → AI generate shotlist (otomatis)
TAHAP 5 → Review & edit tabel shotlist
TAHAP 6 → AI generate gambar (otomatis)
```

Kamu tidak perlu menyelesaikan semua tahap dalam satu waktu. Progress tersimpan otomatis — tutup browser, besok buka lagi, langsung lanjut dari tahap yang sama.

---

## BAGIAN 1 — MASUK KE APLIKASI (LOGIN)

### Langkah 1 — Login dengan Google

1. Buka web app di browser (URL yang kamu dapat dari Vercel, atau `http://localhost:3000` kalau lokal)
2. Akan muncul halaman login dengan tombol **"Sign in with Google"**
3. Klik tombol tersebut
4. Pilih akun Google yang ingin kamu gunakan
5. Izinkan akses yang diminta
6. Kamu akan otomatis diarahkan ke halaman **Projects**

> Setiap orang yang login pakai akun Google berbeda akan punya data mereka sendiri — project, file, dan hasil generation tidak akan bercampur.

---

## BAGIAN 2 — SETTINGS (WAJIB DILAKUKAN PERTAMA KALI)

Sebelum bisa generate apapun, kamu harus memasukkan API key dulu. Ini hanya perlu dilakukan sekali.

### Langkah 2 — Buka halaman Settings

1. Lihat sidebar di sebelah kiri layar
2. Klik ikon **roda gigi (⚙️)** atau menu **"Settings"** di bagian bawah sidebar
3. Kamu akan masuk ke halaman Settings

### Langkah 3 — Isi API Key untuk AI (OpenRouter)

OpenRouter adalah layanan yang menghubungkan app ini ke model AI seperti GPT-4 atau Claude.

1. Di halaman Settings, lihat bagian **"AI Language Model"** (ikon ungu)
2. Pada kolom **"OpenRouter API Key"**, masukkan API key kamu
   - API key bentuknya seperti ini: `sk-or-v1-xxxxxxxxxxxxxxxxxxxx`
   - Kalau belum punya, baca panduan SETUP.md bagian Step 14
3. Di bawahnya ada dropdown **"Model"** — ini pilihan AI yang akan digunakan
   - Klik dropdown dan pilih model yang kamu inginkan
   - **Rekomendasi untuk kualitas terbaik:** `anthropic/claude-3.5-sonnet` atau `openai/gpt-4o`
   - **Rekomendasi untuk hemat biaya:** `openai/gpt-4o-mini` atau `google/gemini-flash-1.5`
   - Kamu bisa ganti model ini kapan saja
4. Klik tombol **"Save"** di bagian AI Language Model

### Langkah 4 — Isi API Key untuk Generate Gambar

1. Scroll ke bawah, lihat bagian **"Image Generation"** (ikon biru)
2. Pilih **provider** (layanan gambar AI) yang kamu gunakan:
   - Klik dropdown provider dan pilih salah satu: **Higgsfield**, **kie.ai**, atau **wavespeed.ai**
3. Setelah memilih provider, akan muncul kolom untuk memasukkan API key-nya
4. Masukkan API key sesuai provider yang kamu pilih
5. Klik tombol **"Save"** di bagian Image Generation

> Kalau belum punya API key untuk generate gambar, kamu tetap bisa pakai semua fitur lainnya (generate script, generate shotlist, export PDF). Hanya fitur generate gambar yang memerlukan key ini.

---

## BAGIAN 3 — KELOLA PROJECT

Project adalah "folder" untuk mengorganisir pekerjaan kamu. Satu project bisa berisi banyak file PDF dan banyak session.

**Contoh penggunaan:** Project "Film Pendek 2024" berisi 3 file PDF (treatment, synopsis, dan referensi visual) dan 5 session dengan pendekatan yang berbeda-beda.

### Langkah 5 — Membuat Project Baru

1. Di halaman **Projects**, klik tombol **"+ New Project"** (tombol ungu di pojok kanan atas)
2. Akan muncul dialog (kotak popup)
3. Isi **nama project** — gunakan nama yang mudah diingat (contoh: "Iklan Kopi Januari 2025")
4. Isi **deskripsi** (opsional) — keterangan singkat tentang project ini
5. Klik **"Create Project"**
6. Project baru akan langsung muncul di halaman

### Langkah 6 — Navigasi di Halaman Projects

Di halaman Projects, kamu akan melihat:

- **Tombol "Active" dan "Archived"** di kiri atas — klik untuk beralih antara project aktif dan yang sudah diarsipkan
- **Ikon grid (kotak-kotak) dan list (garis)** di kanan atas — untuk mengubah tampilan dari kartu menjadi daftar, atau sebaliknya
- Setiap **kartu project** menampilkan nama, deskripsi, tanggal dibuat

### Langkah 7 — Opsi di Setiap Project (Menu Tiga Titik)

Arahkan mouse ke kartu project, akan muncul ikon tiga titik (**⋯**) di pojok kanan atas kartu.

Klik ikon tersebut untuk memunculkan menu:
- **Rename** — ganti nama project
- **Archive** — arsipkan project (disembunyikan dari daftar utama, tidak dihapus)
- **Delete** — hapus project permanen beserta semua file dan session di dalamnya
  - ⚠️ **Hati-hati:** penghapusan tidak bisa dibatalkan

---

## BAGIAN 4 — UPLOAD FILE KE PROJECT

### Langkah 8 — Masuk ke Halaman Project

1. Dari halaman Projects, klik kartu project yang ingin kamu buka
2. Kamu akan masuk ke halaman detail project
3. Halaman ini terbagi dua kolom:
   - **Kiri: "Source Files"** — daftar file yang sudah diupload
   - **Kanan: "Sessions"** — daftar session yang pernah dibuat

### Langkah 9 — Upload File PDF

1. Di kolom kiri, kamu akan melihat area upload dengan ikon awan dan teks "drag & drop"
2. **Cara 1 — Drag & Drop:** Ambil file PDF dari folder komputer kamu, seret dan lepas ke area tersebut
3. **Cara 2 — Klik:** Klik area upload, akan muncul dialog pemilihan file, pilih file PDF kamu
4. Tunggu sampai proses upload selesai — akan ada indikator loading
5. File yang berhasil diupload akan muncul di daftar di bawah area upload

**Aturan upload:**
- Format yang diterima: **PDF** dan **teks (.txt)**
- Ukuran maksimal per file: **50 MB**
- Kamu bisa upload banyak file ke satu project

### Langkah 10 — Hapus File

Untuk menghapus file yang tidak diperlukan:
1. Di daftar file, arahkan mouse ke file yang ingin dihapus
2. Akan muncul ikon tempat sampah (🗑️)
3. Klik ikon tersebut
4. Konfirmasi penghapusan

---

## BAGIAN 5 — MEMBUAT SESSION

Session adalah satu "percobaan" generate storyboard. Kamu bisa membuat banyak session dalam satu project untuk mencoba berbagai pendekatan atau instruksi yang berbeda.

### Langkah 11 — Buat Session Baru

1. Di halaman project, lihat kolom kanan **"Sessions"**
2. Klik tombol ungu **"+ New Session"**
3. Session baru otomatis dibuat dan kamu langsung diarahkan ke halaman session (Tahap 1)

---

## BAGIAN 6 — TAHAP 1: PILIH FILE & INSTRUKSI

Ini adalah halaman awal setiap session. Di sini kamu menentukan file mana yang akan dijadikan bahan dan memberikan arahan kepada AI.

Di bagian atas halaman, kamu akan melihat **progress bar 6 tahap** yang menunjukkan kamu sedang di mana.

### Langkah 12 — Pilih File Sumber

1. Kamu akan melihat daftar semua file yang ada di project ini
2. Klik file yang ingin digunakan sebagai bahan generate script
3. File yang dipilih akan berubah tampilan (ada centang ungu di kiri)
4. Kamu bisa memilih lebih dari satu file — AI akan membaca semua file yang dipilih
5. Kalau ingin memilih semua file sekaligus, klik link **"Select all"** di kanan atas daftar

> **Tips:** Pilih file yang paling relevan dengan storyboard yang ingin dibuat. Semakin fokus bahan yang diberikan, semakin baik hasilnya.

### Langkah 13 — Tulis Instruksi (Opsional tapi Sangat Dianjurkan)

Di bawah daftar file, ada kotak teks berlabel **"Instructions"**.

Isi instruksi dengan petunjuk khusus untuk AI, contoh:
- *"Buat script untuk iklan 30 detik dengan nada emosional dan fokus pada hubungan ibu dan anak"*
- *"Gunakan gaya visual seperti film Wes Anderson — simetris, warna pastel, narasi quirky"*
- *"Script untuk video corporate, formal, durasi 2 menit, highlight keunggulan produk teknologi"*
- *"Bahasa Indonesia, tone fun dan ringan, target audience anak muda 18-25 tahun"*

Kalau dibiarkan kosong, AI akan menggunakan framework penulis screenplay Hollywood secara default.

### Langkah 14 — Generate Script

1. Pastikan sudah memilih minimal satu file
2. Klik tombol besar **"Generate Script!"** (tombol ungu dengan ikon play)
3. Tombol ini akan berwarna abu-abu dan tidak bisa diklik jika belum ada file yang dipilih

---

## BAGIAN 7 — TAHAP 2: AI SEDANG GENERATE SCRIPT

Setelah klik "Generate Script!", halaman akan berubah menampilkan progress loading.

### Yang akan kamu lihat:

- **Progress bar** yang bergerak dari 0% sampai 100%
- **Pesan status** yang berubah-ubah, contoh:
  - *"Parsing PDF content..."* → AI sedang membaca file kamu
  - *"Analyzing document structure..."* → AI sedang memahami isi dokumen
  - *"Generating script..."* → AI sedang menulis skrip
  - *"Finalizing script..."* → Hampir selesai

### Berapa lama?

Tergantung panjang dokumen dan model AI yang dipilih:
- File pendek (< 10 halaman): biasanya **30–90 detik**
- File panjang (> 50 halaman): bisa **2–5 menit**

### Kalau ingin membatalkan:

Klik tombol **"Cancel"** yang tersedia di halaman loading. Kamu akan kembali ke form tahap 1.

> **Jangan tutup browser** saat proses berjalan — progress bisa hilang.

---

## BAGIAN 8 — TAHAP 3: REVIEW & EDIT SCRIPT

Setelah AI selesai, kamu otomatis diarahkan ke halaman editor script.

### Yang akan kamu lihat:

- **Teks script** hasil AI di area editor utama
- **Tombol "Download PDF"** di kanan atas
- **Tombol "Generate Shotlist!"** di kanan atas
- **Panel "AI Edit"** di bawah editor

### Langkah 15 — Baca dan Review Script

1. Baca seluruh script yang dihasilkan AI
2. Periksa apakah alur, scene, dan dialog sesuai dengan yang kamu inginkan
3. Perhatikan apakah ada bagian yang perlu diubah

### Langkah 16 — Edit Script Secara Manual

Kamu bisa langsung mengedit teks script seperti mengedit dokumen biasa:

1. Klik di bagian teks yang ingin diubah
2. Ketik perubahan yang kamu mau — hapus, tambah, atau ganti kata/kalimat
3. Perubahan tersimpan otomatis (tidak perlu klik tombol Save)

### Langkah 17 — Edit Script dengan Bantuan AI

Untuk perubahan yang lebih besar atau kompleks, gunakan fitur **AI Edit**:

1. Lihat panel di bawah editor script berlabel **"AI Edit"** atau kotak teks dengan placeholder
2. Ketik instruksi perubahan yang kamu mau, contoh:
   - *"Tambahkan scene pembuka di pantai sebelum scene 1"*
   - *"Buat dialog di scene 3 lebih dramatis dan emosional"*
   - *"Perpendek script ini menjadi 5 scene saja, ambil bagian terpenting"*
   - *"Ganti semua nama karakter menjadi nama Indonesia"*
3. Klik tombol **"Apply"** atau tekan Enter
4. Tunggu beberapa detik — AI akan memperbarui script sesuai instruksimu
5. Script akan otomatis terupdate di editor

### Langkah 18 — Download Script sebagai PDF

1. Klik tombol **"Download PDF"** di pojok kanan atas
2. File PDF akan otomatis terdownload ke komputer kamu
3. PDF berisi script dalam format yang rapi dan siap cetak

### Langkah 19 — Lanjut ke Generate Shotlist

Kalau script sudah sesuai:
1. Klik tombol **"Generate Shotlist!"** (tombol ungu di kanan atas)
2. Kamu akan masuk ke proses loading generate shotlist

---

## BAGIAN 9 — TAHAP 4: AI SEDANG GENERATE SHOTLIST

Proses ini mirip dengan generate script — ada progress bar dan pesan status.

AI akan membaca script yang sudah ada dan mengubahnya menjadi tabel shotlist profesional.

### Yang akan dihasilkan:

Untuk setiap scene dalam script, AI akan membuat beberapa shot dengan detail teknis lengkap:
- **Tipe shot** (ECU, CU, MCU, MS, MWS, WS, EWS)
- **Sudut kamera** (Eye level, Low angle, High angle, dll.)
- **Lensa** (14mm, 24mm, 35mm, 50mm, 85mm, 135mm)
- **Deskripsi komposisi** dan **mood**
- **Image prompt** yang sudah dioptimalkan untuk AI image generator

### Berapa lama?

Biasanya **30–120 detik** tergantung panjang script.

---

## BAGIAN 10 — TAHAP 5: REVIEW & EDIT TABEL SHOTLIST

Setelah selesai, kamu akan diarahkan ke halaman shotlist yang menampilkan tabel besar.

### Memahami Tabel Shotlist

Tabel ini memiliki banyak kolom — kamu bisa scroll ke kanan untuk melihat semua kolom:

| Kolom | Isi |
|-------|-----|
| **Scene** | Nomor scene dari script |
| **Shot** | Nomor shot dalam scene tersebut |
| **Composition** | Deskripsi framing dan posisi subjek |
| **Shot Type** | Jenis pengambilan gambar (ECU/CU/MCU/MS/MWS/WS/EWS) |
| **Shot Angle** | Sudut kamera (Eye level, Low angle, dll.) |
| **View Level** | Ketinggian kamera (Ground, Eye level, Elevated, Aerial) |
| **Lens** | Panjang focal lensa (14mm sampai 135mm) |
| **Style** | Referensi sinematografi |
| **Mood** | Nuansa emosional shot |
| **Description** | Apa yang terjadi dalam shot ini |
| **Image Prompt** | Teks prompt untuk generate gambar (bahasa Inggris) |

### Langkah 20 — Edit Sel di Tabel

Kamu bisa mengubah nilai di setiap sel tabel:

1. **Untuk sel teks biasa** (Composition, Style, Mood, Description, Image Prompt):
   - Klik pada sel yang ingin diubah
   - Teks akan jadi editable, ketik perubahan kamu
   - Klik di luar sel atau tekan Tab/Enter untuk menyimpan

2. **Untuk sel dengan pilihan dropdown** (Shot Type, Shot Angle, View Level, Lens):
   - Klik pada sel tersebut
   - Akan muncul dropdown dengan pilihan yang tersedia
   - Pilih nilai yang kamu inginkan

Semua perubahan tersimpan otomatis.

### Langkah 21 — Edit Shotlist dengan Bantuan AI

Sama seperti script, kamu bisa meminta AI untuk memperbarui shotlist:

1. Lihat panel **AI Edit** di bawah tabel
2. Ketik instruksi, contoh:
   - *"Tambahkan lebih banyak extreme close-up di scene 2"*
   - *"Ubah semua shot angle di scene 3 menjadi low angle untuk kesan dramatis"*
   - *"Buat image prompt di semua shot lebih sinematik dengan referensi gaya film noir"*
   - *"Kurangi jumlah shot menjadi maksimal 3 per scene"*
3. Klik **"Apply"**
4. Tunggu sebentar — tabel akan terupdate

### Langkah 22 — Download Shotlist sebagai PDF

1. Klik tombol **"Download PDF"** di kanan atas
2. Shotlist akan didownload sebagai file PDF berformat tabel yang rapi

### Langkah 23 — Lanjut ke Generate Gambar

Kalau shotlist sudah sesuai:
1. Klik tombol **"Generate All Images!"** (tombol ungu di kanan atas)
2. Kamu akan langsung diarahkan ke halaman galeri gambar

---

## BAGIAN 11 — TAHAP 6: GALERI GAMBAR

Ini adalah halaman final. AI akan generate gambar untuk setiap shot dalam shotlist secara bersamaan.

### Yang akan kamu lihat saat pertama masuk:

- **Grid kartu gambar** — satu kartu untuk setiap shot
- Awalnya semua kartu menampilkan animasi loading (abu-abu berkedip)
- Gambar akan muncul satu per satu seiring selesainya proses generate

### Status setiap kartu gambar:

- **"In queue..."** (ikon jam) — menunggu giliran, belum mulai diproses
- **"Generating..."** (ikon berputar) — sedang diproses oleh AI image generator
- **Gambar muncul** — selesai! Gambar berhasil dibuat
- **Pesan error merah** — gagal generate (bisa dicoba lagi)

### Isi setiap kartu gambar:

Di bagian atas kartu: **nomor Shot** dan **nomor Scene**

Di tengah: **gambar** hasil generate

Di bawah gambar:
- **Kotak teks prompt** — prompt yang digunakan untuk generate gambar ini (bisa diedit)
- **Ikon copy** (di pojok kanan kotak prompt) — untuk menyalin teks prompt

Di bawah prompt:
- **Tombol "Regenerate"** — generate ulang gambar ini
- **Tombol "Download"** — download gambar ini satu per satu

### Langkah 24 — Menunggu Semua Gambar Selesai

1. Cukup tunggu — tidak perlu klik apapun
2. Gambar akan muncul secara bertahap (maksimal 5 gambar diproses secara bersamaan)
3. Lama proses tergantung provider dan jumlah shot:
   - 10 shot: sekitar **2–5 menit**
   - 30 shot: sekitar **5–15 menit**

### Langkah 25 — Edit Prompt dan Regenerate Gambar

Kalau hasil gambar tidak sesuai, kamu bisa generate ulang dengan prompt yang berbeda:

1. Di kartu gambar yang ingin diubah, klik pada **kotak teks prompt**
2. Edit teks prompt sesuai keinginan kamu
   - Tambahkan detail visual: warna, pencahayaan, gaya, suasana
   - Contoh tambahan: *", golden hour lighting, shot on 35mm film, warm tones, dramatic shadows"*
3. Klik tombol **"Regenerate"**
4. Gambar baru akan diproses — kartu akan kembali menampilkan loading
5. Gambar baru akan muncul menggantikan yang lama

> Kamu bisa regenerate tanpa mengubah prompt juga — misalnya kalau hasilnya kurang memuaskan, cukup klik Regenerate dengan prompt yang sama untuk mendapat variasi berbeda.

### Langkah 26 — Download Gambar Satu per Satu

1. Tunggu sampai gambar yang ingin didownload sudah selesai generate
2. Klik tombol **"Download"** di kartu gambar tersebut
3. File gambar akan tersimpan ke komputer kamu

### Langkah 27 — Download Semua Gambar Sekaligus (ZIP)

1. Klik tombol **"Download All (ZIP)"** di pojok kanan atas halaman
2. Semua gambar yang sudah selesai akan dikemas dalam satu file ZIP
3. File ZIP akan otomatis terdownload ke komputer kamu
4. Ekstrak file ZIP untuk melihat semua gambar

---

## BAGIAN 12 — NAVIGASI DAN FITUR TAMBAHAN

### Tombol Back (Kembali)

Di setiap halaman session, ada tombol **"← Back to ..."** di kiri atas:
- Di halaman Script: **"← Back to Project"** → kembali ke halaman project
- Di halaman Shotlist: **"← Back to Script"** → kembali ke halaman editor script
- Di halaman Images: **"← Back to Shotlist"** → kembali ke tabel shotlist

### Progress Bar 6 Tahap

Bar di bagian atas halaman session menunjukkan posisi kamu:
- **Lingkaran terisi penuh** (ungu) = tahap yang sudah selesai
- **Lingkaran dengan angka beranimasi** = tahap yang sedang aktif
- **Lingkaran abu-abu** = tahap yang belum dikerjakan

### Kembali ke Session yang Sudah Ada

Kalau kamu menutup browser dan ingin melanjutkan session yang belum selesai:

1. Buka web app dan login
2. Masuk ke project yang bersangkutan
3. Di kolom kanan **"Sessions"**, kamu akan melihat daftar semua session
4. Setiap session card menampilkan:
   - Nama session
   - Status saat ini (Draft, Script Ready, Shotlist Ready, dll.)
5. Klik session yang ingin dilanjutkan
6. Kamu akan langsung diarahkan ke tahap yang sesuai dengan status session

### Membuat Banyak Session dalam Satu Project

Kamu bisa membuat session sebanyak yang kamu mau untuk satu project. Ini berguna untuk:
- Mencoba instruksi yang berbeda-beda
- Membandingkan hasil dari approach yang berbeda
- Generate ulang dari awal tanpa menghapus session sebelumnya

Cukup klik **"+ New Session"** lagi di halaman project.

---

## BAGIAN 13 — TIPS & TRIK

### Tips untuk Hasil Script yang Lebih Baik

- **Berikan instruksi yang spesifik** — semakin detail instruksi, semakin terarah hasilnya
- **Sebutkan target audiens** — contoh: "untuk anak-anak usia 5-10 tahun"
- **Sebutkan durasi** — contoh: "iklan 30 detik" atau "video 3 menit"
- **Sebutkan gaya** — contoh: "serius dan profesional" atau "fun dan energetik"
- **Upload lebih dari satu file** kalau kamu punya referensi visual, mood board, atau brief yang berbeda format

### Tips untuk Hasil Shotlist yang Lebih Baik

- Edit script dulu sebelum generate shotlist — semakin baik scriptnya, semakin baik shotlistnya
- Gunakan AI Edit di shotlist untuk menyesuaikan dengan kapabilitas kamera yang tersedia
- Perhatikan kolom **Image Prompt** — ini yang langsung digunakan untuk generate gambar

### Tips untuk Hasil Gambar yang Lebih Baik

- Edit **Image Prompt** sebelum regenerate kalau hasilnya kurang memuaskan
- Tambahkan detail spesifik ke prompt: nama aktor/karakter, lokasi nyata, warna dominan
- Coba prompt yang lebih pendek dan fokus kalau hasil terlalu random
- Regenerate beberapa kali dengan prompt yang sama untuk mendapat variasi

### Hemat Biaya API

- Model AI yang lebih murah (GPT-4o-mini) cukup bagus untuk draft awal
- Gunakan model premium (Claude 3.5 Sonnet) untuk hasil final yang akan dipresentasikan
- Generate gambar hanya setelah shotlist benar-benar final — setiap generate gambar menggunakan kredit API

---

## BAGIAN 14 — PERTANYAAN YANG SERING DITANYA

**Q: Hasil script/shotlist/gambar tersimpan di mana?**
A: Tersimpan di database cloud (Supabase) yang terhubung ke akun kamu. Selama kamu login dengan akun yang sama, data selalu ada.

**Q: Apakah orang lain bisa melihat project saya?**
A: Tidak. Setiap akun punya datanya sendiri — tidak ada yang bisa mengakses project orang lain.

**Q: Bagaimana kalau saya salah instruksi dan mau generate ulang dari awal?**
A: Buat session baru di project yang sama. Session lama tetap tersimpan.

**Q: Bisakah saya menggunakan file selain PDF?**
A: Untuk saat ini hanya **PDF** dan file teks **.txt** yang didukung.

**Q: Kenapa gambar yang dihasilkan tidak persis dengan yang ada di shotlist?**
A: AI image generator menginterpretasikan prompt — hasilnya bisa bervariasi. Edit prompt dan klik Regenerate untuk mendekati hasil yang diinginkan.

**Q: Apakah saya bisa mengubah model AI di tengah-tengah session?**
A: Ya. Buka Settings, ganti model, simpan. Session yang sudah berjalan tidak terpengaruh — perubahan berlaku untuk generate berikutnya.

**Q: Berapa banyak gambar yang bisa saya generate?**
A: Tidak ada batasan dari aplikasi ini. Batasnya hanya dari saldo/kuota API di akun provider gambar kamu.

**Q: File PDF saya besar, kenapa script hasilnya tidak lengkap?**
A: Setiap model AI punya batas "context window" (panjang teks yang bisa dibaca sekaligus). Coba gunakan model dengan context window lebih besar, atau pecah PDF menjadi beberapa file yang lebih kecil.

---

Dibuat oleh tim **artgenerativeindonesia**.
Ada pertanyaan lain? Buka Issues di repository GitHub.
