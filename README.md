# Dexa Group - HR Attendance & Employee Master Solution

Solusi Fullstack Enterprise untuk **Skill Test Dexa Group**:
- **Backend:** NestJS (JavaScript) Two-Tier Microservice Architecture
  - **Layer 1 - MSF (Microservice Federation):** `msf_auth` (Port 5000), `msf_employee` (Port 5001), `msf_attendance` (Port 5002)
  - **Layer 2 - MSM (Microservice Master):** `msm_user` (6001), `msm_employee` (6002), `msm_attendance` (6003), `msm_role` (6004), `msm_jabatan` (6005), `msm_status_work` (6006), `msm_status_employee` (6007)
- **Frontend:** Micro Frontend (MFE) React.js
  - **Host Shell Container** (Port 3000)
  - **MFE Attendance** (Port 3001)
  - **MFE Employee Master** (Port 3002)
- **Database:** PostgreSQL Native Windows (Seluruh PK & FK UUID v4 via `gen_random_uuid()`)
- **Penyimpanan Foto:** 100% disimpan langsung ke database PostgreSQL sebagai string Base64 Data URI (`TEXT`) tanpa file fisik di disk.
- **Keamanan:** Bearer Token JWT, Strict Token & User Isolation (`/api/msf_attendance/user/{userId}`), RBAC Guard (HTTP 403 Forbidden untuk akses role non-HRD).
- **Laporan:** ExcelJS Multi-Sheet (`Sheet1`: Data Tabel, `Sheet2`: 2 Visual Bar Chart Distribusi Jam Masuk & Jam Keluar).

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal

### 1. Prasyarat
- Node.js v18+ atau v20+ / v22+
- PostgreSQL aktif secara lokal pada port 5432

### 2. Konfigurasi Lingkungan (.env)
Salin `.env.example` menjadi `.env` di root project:
```bash
cp .env.example .env
```
Pastikan kredensial user & password database PostgreSQL lokal Anda sudah sesuai di file `.env`.

### 3. Migrasi Skema Database & Seeding Awal
Jalankan script baseline idempotent untuk membuat tabel dan mengisi akun default:
```bash
node backend/database/init-db.js
```

### 4. Menjalankan Semua Layanan Backend (10 Microservices)
```bash
node backend/start-all-services.js
```

### 5. Menjalankan Semua Layanan Frontend (3 Micro Frontends)
Buka terminal baru:
```bash
node frontend/start-all-frontends.js
```

Buka browser di: **http://127.0.0.1:3000**

---

## 👤 Akun Demo Default

| Role | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Admin HRD** | `hrd@dexagroup.com` | `password123` | Absensi Diri Sendiri + Master Data Karyawan (Grid 3x3, Detail, CRUD) + Riwayat Perusahaan & Ekspor Excel (+ 2 Bar Charts) |
| **Karyawan** | `ahmad.fauzi@dexagroup.com` | `password123` | Absensi Diri Sendiri (Webcam Base64, Live Duration Timer) + Riwayat Pribadi Sahaja (Master Karyawan Disembunyikan) |

---

## 🧪 Menjalankan Automated End-to-End Test Suite

Untuk memverifikasi seluruh fungsionalitas API, JWT token, guard RBAC, token isolation, check-in, check-out, dan ekspor excel:
```bash
node backend/test-e2e-api.js
```
