# Prompt Builder — 3D Motion

Aplikasi statis untuk mengubah brief dan timeline narasi menjadi prompt perintah AI untuk membuat animasi Three.js. Aplikasi ini adalah **prompt generator**, bukan editor atau renderer video.

## Menjalankan

Buka `index.html` di browser modern. Semua data preset dan shared source reference tersimpan di JavaScript lokal. Tidak ada `fetch()` untuk membaca file lokal, sehingga UI dapat dibuka melalui `file://`.

## Fitur prompt

- 36 preset visual dalam 7 keluarga.
- Input topik, naskah voiceover/SRT, durasi, rasio, gerakan kamera, subtitle, dan arahan tambahan.
- Storyboard First untuk meminta storyboard per beat sebelum produksi animasi.
- Durasi preset sampai 10 menit dan durasi custom hingga 36.000 detik.
- Low-Poly Compact Reference menjadi default; tetap menyertakan shared Sound Kit asli, sementara Stage Engine dan source Low-Poly lengkap diganti kontrak teknis ringkas.
- Full Source Reference dapat diaktifkan untuk menyertakan shared Stage Engine, Sound Kit, dan source preset terpilih.
- Kontrak Low-Poly meliputi geometri facet, material matte, pencahayaan warm/cool, ketajaman, DOF, color palette, timeline dinamis, dan `FLAG_SPECS` tunggal.
- Prompt akhir meminta hasil HTML mandiri dengan preview, Load Narasi, sinkronisasi timeline, Sound Kit, serta modal MP4 berbasis Mediabunny.

## Struktur

- `index.html` — kerangka halaman dan kontrol UI.
- `assets/css/app.css` — gaya UI.
- `assets/js/app.js` — pencarian preset, perakitan prompt, mode referensi, salin dan unduh.
- `data/styles.js` — metadata 36 preset dan source khusus tiap gaya (shared code sudah dipisahkan).
- `data/references.js` — shared Three.js Stage Engine dan Sound Kit, masing-masing disimpan satu kali.

## Catatan MP4

Aplikasi ini hanya menuliskan instruksi implementasi ekspor MP4 ke prompt. Encoder tidak dijalankan di dalam Prompt Builder. Prompt mengarahkan AI pembuat HTML untuk menggunakan Mediabunny 1.66.0, WebCodecs, MP4/H.264, AAC, `CanvasSource`, `AudioBufferSource`, dan `StreamTarget` dengan penanganan codec, progress, cancellation, serta fallback penyimpanan.

## Sound Kit

Sound Kit sengaja dipertahankan. Instruksi lama yang melarang musik dan sound effect telah dihapus karena bertentangan dengan shared Sound Kit yang sudah tertanam. AI tidak diminta membuat voiceover atau TTS; Sound Kit prosedural tetap dapat dipakai bersama narasi yang diunggah pengguna.
