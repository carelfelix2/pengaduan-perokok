# KawasanSehat — Sistem Pengaduan Perokok

Website pengaduan pelanggaran kawasan bebas asap rokok untuk lingkungan kerja.

## Struktur File

```
pengaduan-perokok/
├── index.html          → Landing page utama
├── form.html           → Halaman form pengaduan (3 langkah)
├── css/
│   ├── style.css       → Stylesheet landing page & global
│   └── form.css        → Stylesheet form pengaduan
├── js/
│   ├── main.js         → Script landing page
│   └── form.js         → Script form pengaduan (validasi, navigasi, submit)
└── README.md
```

## Cara Menjalankan

Cukup buka `index.html` di browser. Tidak diperlukan server atau build tool.

Untuk pengalaman terbaik, gunakan browser modern (Chrome, Firefox, Safari, Edge).

## Fitur

### Landing Page (`index.html`)
- Hero section dengan tagline dan CTA
- Statistik dampak merokok
- Grid 6 kartu bahaya merokok
- Alur cara kerja pengaduan
- Banner CTA bawah
- Footer responsif

### Form Pengaduan (`form.html`)
Form 3 langkah dengan validasi:

**Langkah 1 — Identitas Pelapor**
- Toggle anonim / sertakan nama
- Jika beridentitas: nama, email, no. HP, departemen, jabatan
- Info box keamanan data

**Langkah 2 — Detail Kejadian**
- Lokasi (dropdown 11 pilihan)
- Lantai & detail lokasi spesifik
- Tanggal & waktu kejadian
- Frekuensi (radio card)
- Tingkat keparahan: Ringan / Sedang / Berat
- Jumlah pelanggar

**Langkah 3 — Deskripsi & Bukti**
- Textarea deskripsi dengan counter karakter
- Checklist dampak yang dirasakan (6 pilihan)
- Upload foto/video (drag & drop, preview)
- Identitas terlapor (opsional)
- Saran tindak lanjut
- Status laporan sebelumnya
- Persetujuan kebijakan privasi

### Halaman Sukses
- Overlay animasi setelah submit
- Nomor referensi unik (#RPK-XXXXXX)
- Opsi kembali ke beranda atau buat laporan baru

## Kustomisasi

### Mengganti warna tema
Edit variabel di `css/style.css`:
```css
:root {
  --green-dark: #1B3A2A;   /* Warna utama gelap */
  --green-mid:  #2D5A3D;   /* Warna utama sedang */
  --green-light: #E8F5E9;  /* Background aksen */
}
```

### Menambah pilihan lokasi
Di `form.html`, cari `<select id="inp-location">` dan tambahkan `<option>` baru.

### Menghubungkan ke backend
Di `js/form.js`, fungsi `submitForm()` — ganti `setTimeout` dengan `fetch()` ke API Anda:
```javascript
const response = await fetch('/api/pengaduan', {
  method: 'POST',
  body: formData
});
```

## Dependensi Eksternal (CDN)
- Google Fonts: Inter + DM Serif Display
- Tabler Icons (via CDN)

Tidak ada framework JS atau build tool yang diperlukan.

---
KawasanSehat © 2025 — Program Lingkungan Kerja Sehat
