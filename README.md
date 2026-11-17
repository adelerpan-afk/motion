# Prompt Builder 3D

Aplikasi statis, tanpa dependensi eksternal dan tanpa unggah TXT. Semua preset gaya beserta source reference tersimpan di `data/styles.js`.

## Menjalankan

Buka `index.html` di browser modern. Aplikasi menggunakan path relatif dan tidak melakukan `fetch()` lokal, sehingga dapat berjalan dari `file://` tanpa server. Tombol Salin memiliki fallback seleksi teks jika browser membatasi clipboard pada file lokal.

## Fitur prompt

- Opsi **Storyboard First** aktif secara default: minta storyboard visual, lalu berhenti sampai mendapat persetujuan sebelum animasi final.
- Prompt final meminta satu file HTML mandiri.
- Tidak meminta pembuatan narasi, TTS, musik, atau sound effect; hasil HTML diminta menyediakan tombol **Load Narasi** dan sinkronisasi animasi ke audio yang dipilih.
- Pilihan pergerakan kamera masuk ke arahan prompt.

## Struktur

- `index.html` — kerangka halaman dan pemuatan aset lokal.
- `assets/css/app.css` — seluruh gaya UI.
- `assets/js/app.js` — pencarian preset, perakitan prompt, salin dan unduh.
- `data/styles.js` — data 36 gaya, keluarga, metadata, dan source reference.
