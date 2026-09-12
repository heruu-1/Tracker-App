# Keran — Tracker Keuangan

Selamat datang di aplikasi **Keran (Tracker Keuangan)** untuk submission kelas **Front-End Web Pemula**! 🎉

Keran menyediakan pencatatan pemasukan dan pengeluaran dengan tampilan dashboard responsif. Seluruh data disimpan secara lokal di browser, tanpa backend atau dependency eksternal.

---

## Struktur Berkas

```
expense-tracker-app/
├── index.html   ← Struktur halaman dan identitas Keran
├── style.css    ← Tampilan visual (bebas dimodifikasi untuk portofolio)
├── main.js      ← Tempat Anda menulis seluruh logika JavaScript
└── README.md    ← Panduan ini
```

---

## Cara Menjalankan Proyek

Proyek ini adalah HTML statis, sehingga tidak memerlukan instalasi apapun.

**Opsi 1 (Disarankan):** Gunakan ekstensi **Live Server** di VS Code.
1. Klik kanan pada `index.html`
2. Pilih **"Open with Live Server"**
3. Browser akan terbuka otomatis di `http://127.0.0.1:5500`

**Opsi 2:** Buka langsung berkas `index.html` di browser (klik dua kali dari File Explorer).

---

## Mulai dari Mana?

1. Sapaan aplikasi sudah menggunakan **Muhammad Heru (heruu_mhmd)**.
2. **Buka `main.js`** untuk melihat implementasi logika transaksi, penyimpanan lokal, dasbor, dan pencarian.
3. Jalankan pemeriksaan sintaks dan uji alur aplikasi melalui browser lokal sebelum mengumpulkan.

---

## Catatan Penting

- **Atribut `data-testid`** pada elemen-elemen di `index.html` digunakan oleh sistem penilaian untuk memverifikasi struktur aplikasi Anda. Pastikan nilai atribut ini tidak berubah saat Anda membuat elemen kartu transaksi via JavaScript.
- **Atribut `id`** seperti `incomeList`, `expenseList`, dan `transactionForm` juga digunakan oleh JavaScript. Pastikan nilainya tidak berubah.
- Anda **bebas mengubah** warna, font, layout, dan styling di `style.css` untuk membuat tampilan yang unik dan personal.
- Tampilan Keran menggunakan layout dua area pada desktop dan satu kolom pada layar kecil.
- Data transaksi hanya tersimpan di browser yang sedang digunakan melalui `localStorage`.

---

## Cara Mengumpulkan

1. Pastikan semua fitur sudah berjalan dengan baik di browser.
2. Kompres seluruh folder proyek menjadi satu berkas **ZIP**.
3. Unggah berkas ZIP tersebut ke halaman submission di platform Dicoding.

## Fitur yang Diimplementasikan

- Menambah, mengedit, menghapus, dan memindahkan tipe transaksi antara pemasukan dan pengeluaran.
- Menyimpan transaksi pada `localStorage` dengan key `expense-tracker-transactions`.
- Menampilkan saldo, total pemasukan, dan total pengeluaran secara dinamis.
- Mencari transaksi secara langsung berdasarkan judul.
- Memperbarui tampilan melalui custom event `transaction:updated`.

## Menjalankan dan Memeriksa

Proyek tidak membutuhkan instalasi dependency. Untuk pemeriksaan lokal, jalankan:

```powershell
node --check .\main.js
python -m http.server 5500 --bind 127.0.0.1
```

Kemudian buka `http://127.0.0.1:5500` dan uji alur tambah, edit, hapus, ubah tipe, refresh, serta pencarian.
