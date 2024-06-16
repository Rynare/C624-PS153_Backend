# Dokumentasi API Qulinery

## Daftar Isi

- [Pendahuluan](#pendahuluan)
- [Autentikasi](#autentikasi)
  - [Daftar Pengguna](#daftar-pengguna)
  - [Informasi Profil Pengguna](#informasi-profil-pengguna)
  - [Perbarui Profil Pengguna](#perbarui-profil-pengguna)
- [Resep](#resep)
  - [Kategori Resep](#kategori-resep)
  - [Periksa Slug Resep](#periksa-slug-resep)
  - [Suka Resep](#suka-resep)
  - [Buat Resep](#buat-resep)
  - [Hapus Resep](#hapus-resep)
  - [Daftar Resep](#daftar-resep)
  - [Detail Resep](#detail-resep)
- [Artikel](#artikel)
  - [Kategori Artikel](#kategori-artikel)
  - [Periksa Slug Artikel](#periksa-slug-artikel)
  - [Suka Artikel](#suka-artikel)
  - [Buat Artikel](#buat-artikel)
  - [Hapus Artikel](#hapus-artikel)
  - [Daftar Artikel](#daftar-artikel)
  - [Detail Artikel](#detail-artikel)
- [Komentar](#komentar)
  - [Komentar Resep](#komentar-resep)
  - [Komentar Artikel](#komentar-artikel)
- [Popular](#popular)
  - [Artikel Populer](#artikel-populer)
  - [Resep Populer](#resep-populer)

## Pendahuluan

API ini menyediakan berbagai endpoint untuk mengelola resep dan artikel dalam aplikasi Qulinery. Anda dapat menggunakan endpoint ini untuk membuat, membaca, memperbarui, dan menghapus resep dan artikel, serta untuk mengelola komentar dan popularitas konten.

## Autentikasi

### Daftar Pengguna

```http
POST /api/auth
```

Mendaftarkan pengguna baru.

**Body Parameters:**
- `uid` (String, required): UID pengguna.
- `email` (String, required): Email pengguna.
- `name` (String, required): Nama pengguna.
- `profilePicture` (String, required): URL gambar profil pengguna.

### Informasi Profil Pengguna

```http
POST /api/my-profile
```

Mengambil informasi profil pengguna yang sedang login.

**Headers:**
- `Authorization` (String, required): Token autentikasi.

### Perbarui Profil Pengguna

```http
POST /api/my-profile/update
```

Memperbarui informasi profil pengguna yang sedang login.

**Headers:**
- `Authorization` (String, required): Token autentikasi.

**Body Parameters:**
- `profilePicture` (File, optional): Gambar profil baru pengguna.

## Resep

### Kategori Resep

```http
GET /api/recipes/categories
```

Mengambil daftar kategori resep.

### Periksa Slug Resep

```http
GET /api/recipe-check-slug/:slug
```

Memeriksa ketersediaan slug resep.

### Suka Resep

```http
POST /api/recipe/like/:id_recipe
```

Menambahkan suka pada resep.

**Headers:**
- `Authorization` (String, required): Token autentikasi.

### Buat Resep

```http
POST /api/recipe
```

Membuat resep baru.

**Headers:**
- `Authorization` (String, required): Token autentikasi.

**Body Parameters:**
- `slug` (String, required): Slug resep.
- `title` (String, required): Judul resep.
- `description` (String, required): Deskripsi resep.
- `duration` (String, required): Durasi persiapan resep.
- `difficulty` (String, required): Tingkat kesulitan resep.
- `calories` (Integer, optional): Jumlah kalori.
- `portion` (Integer, required): Porsi resep.
- `ingredients` (Array of String, required): Bahan-bahan resep.
- `steps` (Array of String, required): Langkah-langkah resep.
- `tips` (Array of String, optional): Tips tambahan.
- `tags` (Array of String, optional): Tag resep.
- `thumbnail` (File, optional): Gambar thumbnail resep.

### Hapus Resep

```http
DELETE /api/recipe
```

Menghapus resep.

**Headers:**
- `Authorization` (String, required): Token autentikasi.

### Daftar Resep

```http
GET /api/recipes
```

Mengambil daftar semua resep.

### Detail Resep

```http
GET /api/recipe/detail/:slug
```

Mengambil detail resep berdasarkan slug.

## Artikel

### Kategori Artikel

```http
GET /api/articles/categories
```

Mengambil daftar kategori artikel.

### Periksa Slug Artikel

```http
GET /api/article-check-slug/:slug
```

Memeriksa ketersediaan slug artikel.

### Suka Artikel

```http
POST /api/article/like/:id_article
```

Menambahkan suka pada artikel.

**Headers:**
- `Authorization` (String, required): Token autentikasi.

### Buat Artikel

```http
POST /api/article/
```

Membuat artikel baru.

**Headers:**
- `Authorization` (String, required): Token autentikasi.

**Body Parameters:**
- `slug` (String, required): Slug artikel.
- `title` (String, required): Judul artikel.
- `category` (String, required): Kategori artikel.
- `description` (String, required): Deskripsi artikel.
- `thumbnail` (File, optional): Gambar thumbnail artikel.

### Hapus Artikel

```http
DELETE /api/article/
```

Menghapus artikel.

**Headers:**
- `Authorization` (String, required): Token autentikasi.

### Daftar Artikel

```http
GET /api/articles/
```

Mengambil daftar semua artikel.

### Detail Artikel

```http
GET /api/article/detail/:slug
```

Mengambil detail artikel berdasarkan slug.

## Komentar

### Komentar Resep

```http
GET /api/recipe/comments/:id_recipe/:nth_page
```

Mengambil daftar komentar pada resep.

```http
POST /api/recipe/comments/:id_recipe
```

Menambahkan komentar pada resep.

**Headers:**
- `Authorization` (String, required): Token autentikasi.

**Body Parameters:**
- `msg` (String, required): Komentar.

### Komentar Artikel

```http
GET /api/article/comments/:id_article/:nth_page
```

Mengambil daftar komentar pada artikel.

```http
POST /api/article/comments/:id_article
```

Menambahkan komentar pada artikel.

**Headers:**
- `Authorization` (String, required): Token autentikasi.

**Body Parameters:**
- `msg` (String, required): Komentar.

## Popular

### Artikel Populer

```http
GET /api/popular-articles
```

Mengambil daftar artikel populer.

### Resep Populer

```http
GET /api/popular-recipes
```

Mengambil daftar resep populer.

---

## Kontak dan Informasi Lebih Lanjut

Dengan dokumentasi ini, Anda diharapkan dapat memahami bagaimana menggunakan API Qulinery untuk mengelola resep, artikel, komentar, dan lain-lain. Jika ada pertanyaan atau masalah, jangan ragu untuk menghubungi kami melalui kontak yang tersedia.