const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const sampleBase64Jpeg = 
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

// Avatar generator helper using SVG Base64 (renders perfectly in <img src=...>)
function generateAvatarBase64(initials, bgColor = '#1e3a8a') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" rx="100" fill="${bgColor}"/>
    <text x="50%" y="54%" font-family="Arial, Helvetica, sans-serif" font-size="70" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function generateAttendanceProofBase64(name, type, time) {
  const bgColor = type === 'IN' ? '#047857' : '#b91c1c';
  const label = type === 'IN' ? 'CHECK-IN' : 'CHECK-OUT';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#1e293b"/>
    <circle cx="200" cy="110" r="60" fill="${bgColor}"/>
    <text x="200" y="115" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${label}</text>
    <rect x="20" y="200" width="360" height="80" rx="8" fill="#334155"/>
    <text x="35" y="235" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#f8fafc">${name}</text>
    <text x="35" y="260" font-family="Arial, sans-serif" font-size="14" fill="#94a3b8">Waktu: ${time} WIB | Snapshot Valid</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function runMigrationAndSeed() {
  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'dexa_attendance_db',
  });

  try {
    await client.connect();
    console.log('[DB] Terhubung ke PostgreSQL (Native Windows)');

    // 1. Ekstensi UUID
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 2. Skema Tabel Baseline Idempotent
    console.log('[DB] Membuat tabel skema baseline jika belum ada...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles_division (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kode VARCHAR(50) NOT NULL UNIQUE,
        nama VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS jabatans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kode VARCHAR(50) NOT NULL UNIQUE,
        nama VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS status_works (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kode VARCHAR(50) NOT NULL UNIQUE,
        nama VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS status_employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kode VARCHAR(50) NOT NULL UNIQUE,
        nama VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nama VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('HRD', 'EMPLOYEE')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        nik VARCHAR(30) NOT NULL UNIQUE,
        nama_lengkap VARCHAR(150) NOT NULL,
        photo_profile TEXT NULL,
        status_employee_id UUID NOT NULL REFERENCES status_employees(id),
        tanggal_lahir DATE NOT NULL,
        tanggal_masuk DATE NOT NULL,
        tinggi_badan NUMERIC(5,2) NOT NULL,
        berat_badan NUMERIC(5,2) NOT NULL,
        golongan_darah VARCHAR(5) NOT NULL CHECK (golongan_darah IN ('A', 'B', 'AB', 'O')),
        status_work_id UUID NOT NULL REFERENCES status_works(id),
        tanggal_mulai_kontrak DATE NULL,
        tanggal_akhir_kontrak DATE NULL,
        role_division_id UUID NOT NULL REFERENCES roles_division(id),
        jabatan_id UUID NOT NULL REFERENCES jabatans(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS attendances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        attendance_date DATE NOT NULL,
        check_in_time TIMESTAMPTZ NOT NULL,
        check_in_photo TEXT NOT NULL,
        check_out_time TIMESTAMPTZ NULL,
        check_out_photo TEXT NULL,
        work_duration_seconds INTEGER NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_employee_attendance_date UNIQUE (employee_id, attendance_date)
      );

      CREATE INDEX IF NOT EXISTS idx_attendances_emp_date ON attendances(employee_id, attendance_date DESC);
      CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(attendance_date DESC);
      CREATE INDEX IF NOT EXISTS idx_employees_nik ON employees(nik);
    `);

    console.log('[DB] Skema baseline berhasil divalidasi/dibuat.');

    // 3. Seeding Master Data: roles_division
    const divisions = [
      { kode: 'IT', nama: 'IT' },
      { kode: 'RD', nama: 'R&D obat' },
      { kode: 'FIN', nama: 'Finance' },
      { kode: 'HRGA', nama: 'HR&GA' },
      { kode: 'SLS', nama: 'Sales' },
    ];
    for (const d of divisions) {
      await client.query(
        `INSERT INTO roles_division (kode, nama) VALUES ($1, $2) ON CONFLICT (kode) DO NOTHING;`,
        [d.kode, d.nama]
      );
    }

    // 4. Seeding Master Data: jabatans
    const jabatans = [
      { kode: 'JR', nama: 'Junior' },
      { kode: 'SR', nama: 'Senior' },
      { kode: 'LD', nama: 'Lead' },
      { kode: 'PM', nama: 'Project Manajer' },
      { kode: 'JM', nama: 'Junior Manajer' },
      { kode: 'DIR', nama: 'Direksi' },
      { kode: 'INT', nama: 'Intern' },
    ];
    for (const j of jabatans) {
      await client.query(
        `INSERT INTO jabatans (kode, nama) VALUES ($1, $2) ON CONFLICT (kode) DO NOTHING;`,
        [j.kode, j.nama]
      );
    }

    // 5. Seeding Master Data: status_works
    const statusWorks = [
      { kode: 'KTR', nama: 'kontrak' },
      { kode: 'TTP', nama: 'karyawan tetap' },
      { kode: 'MGN', nama: 'magang' },
    ];
    for (const sw of statusWorks) {
      await client.query(
        `INSERT INTO status_works (kode, nama) VALUES ($1, $2) ON CONFLICT (kode) DO NOTHING;`,
        [sw.kode, sw.nama]
      );
    }

    // 6. Seeding Master Data: status_employees
    const statusEmployees = [
      { kode: 'AKT', nama: 'aktif' },
      { kode: 'RSG', nama: 'resign' },
      { kode: 'PHK', nama: 'phk' },
      { kode: 'UND', nama: 'undefined' },
    ];
    for (const se of statusEmployees) {
      await client.query(
        `INSERT INTO status_employees (kode, nama) VALUES ($1, $2) ON CONFLICT (kode) DO NOTHING;`,
        [se.kode, se.nama]
      );
    }

    // 7. Ambil referensi master IDs
    const divRes = await client.query(`SELECT id, nama FROM roles_division;`);
    const divMap = Object.fromEntries(divRes.rows.map(r => [r.nama, r.id]));

    const jabRes = await client.query(`SELECT id, nama FROM jabatans;`);
    const jabMap = Object.fromEntries(jabRes.rows.map(r => [r.nama, r.id]));

    const swRes = await client.query(`SELECT id, nama FROM status_works;`);
    const swMap = Object.fromEntries(swRes.rows.map(r => [r.nama, r.id]));

    const seRes = await client.query(`SELECT id, nama FROM status_employees;`);
    const seMap = Object.fromEntries(seRes.rows.map(r => [r.nama, r.id]));

    // 8. Seeding User & Employee (HRD & Karyawan)
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    const initialUsers = [
      {
        nama: 'Sarah Wijaya (HRD)',
        email: 'hrd@dexagroup.com',
        role: 'HRD',
        nik: '3171012304900001',
        divisi: 'HR&GA',
        jabatan: 'Senior Manajer' in jabMap ? 'Senior Manajer' : 'Junior Manajer',
        statusWork: 'karyawan tetap',
        statusEmployee: 'aktif',
        birthDate: '1990-04-23',
        joinDate: '2020-01-15',
        height: 165,
        weight: 55,
        bloodType: 'O',
        color: '#dc2626',
      },
      {
        nama: 'Ahmad Fauzi',
        email: 'ahmad.fauzi@dexagroup.com',
        role: 'EMPLOYEE',
        nik: '3273011508920002',
        divisi: 'IT',
        jabatan: 'Senior',
        statusWork: 'karyawan tetap',
        statusEmployee: 'aktif',
        birthDate: '1992-08-15',
        joinDate: '2021-03-01',
        height: 172,
        weight: 68,
        bloodType: 'A',
        color: '#2563eb',
      },
      {
        nama: 'Budi Santoso',
        email: 'budi.santoso@dexagroup.com',
        role: 'EMPLOYEE',
        nik: '3273021903950003',
        divisi: 'R&D obat',
        jabatan: 'Lead',
        statusWork: 'karyawan tetap',
        statusEmployee: 'aktif',
        birthDate: '1995-03-19',
        joinDate: '2021-06-15',
        height: 175,
        weight: 72,
        bloodType: 'B',
        color: '#059669',
      },
      {
        nama: 'Citra Lestari',
        email: 'citra.lestari@dexagroup.com',
        role: 'EMPLOYEE',
        nik: '3174032511980004',
        divisi: 'Finance',
        jabatan: 'Junior',
        statusWork: 'kontrak',
        contractStart: '2024-01-01',
        contractEnd: '2025-12-31',
        statusEmployee: 'aktif',
        birthDate: '1998-11-25',
        joinDate: '2024-01-01',
        height: 160,
        weight: 50,
        bloodType: 'AB',
        color: '#d97706',
      },
      {
        nama: 'Dewi Anggraeni',
        email: 'dewi.anggraeni@dexagroup.com',
        role: 'EMPLOYEE',
        nik: '3175041002990005',
        divisi: 'Sales',
        jabatan: 'Junior',
        statusWork: 'magang',
        statusEmployee: 'aktif',
        birthDate: '1999-02-10',
        joinDate: '2024-06-01',
        height: 163,
        weight: 52,
        bloodType: 'O',
        color: '#7c3aed',
      },
      {
        nama: 'Eko Prasetyo',
        email: 'eko.prasetyo@dexagroup.com',
        role: 'EMPLOYEE',
        nik: '3275051206940006',
        divisi: 'IT',
        jabatan: 'Project Manajer',
        statusWork: 'karyawan tetap',
        statusEmployee: 'aktif',
        birthDate: '1994-06-12',
        joinDate: '2019-11-01',
        height: 178,
        weight: 75,
        bloodType: 'A',
        color: '#0891b2',
      },
    ];

    for (const u of initialUsers) {
      // 8a. Insert / Upsert user
      let userRes = await client.query(`SELECT id FROM users WHERE email = $1;`, [u.email]);
      let userId;
      if (userRes.rows.length === 0) {
        const insertUser = await client.query(
          `INSERT INTO users (nama, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id;`,
          [u.nama, u.email, defaultPasswordHash, u.role]
        );
        userId = insertUser.rows[0].id;
        console.log(`[SEED] Created user: ${u.email} (${u.role})`);
      } else {
        userId = userRes.rows[0].id;
      }

      // 8b. Insert employee profile
      let empRes = await client.query(`SELECT id FROM employees WHERE user_id = $1;`, [userId]);
      let empId;
      if (empRes.rows.length === 0) {
        const initials = u.nama.split(' ').map(n => n[0]).slice(0, 2).join('');
        const avatarBase64 = generateAvatarBase64(initials, u.color);

        const insertEmp = await client.query(
          `INSERT INTO employees (
            user_id, nik, nama_lengkap, photo_profile,
            status_employee_id, tanggal_lahir, tanggal_masuk,
            tinggi_badan, berat_badan, golongan_darah,
            status_work_id, tanggal_mulai_kontrak, tanggal_akhir_kontrak,
            role_division_id, jabatan_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id;`,
          [
            userId,
            u.nik,
            u.nama,
            avatarBase64,
            seMap[u.statusEmployee] || seMap['aktif'],
            u.birthDate,
            u.joinDate,
            u.height,
            u.weight,
            u.bloodType,
            swMap[u.statusWork] || swMap['karyawan tetap'],
            u.contractStart || null,
            u.contractEnd || null,
            divMap[u.divisi] || divMap['IT'],
            jabMap[u.jabatan] || jabMap['Junior'],
          ]
        );
        empId = insertEmp.rows[0].id;
        console.log(`[SEED] Created employee: ${u.nama} (NIK: ${u.nik})`);
      } else {
        empId = empRes.rows[0].id;
      }

      // 8c. Seeding beberapa data absensi lampau untuk grafik & pengujian
      const historyDays = [
        { date: '2026-10-28', inH: '07:55:10', outH: '17:05:20', durSec: 33010 },
        { date: '2026-10-29', inH: '08:02:15', outH: '17:15:40', durSec: 33205 },
        { date: '2026-10-30', inH: '08:30:00', outH: '17:35:10', durSec: 32710 },
        { date: '2026-10-31', inH: '07:45:00', outH: '16:50:00', durSec: 32700 },
      ];

      for (const h of historyDays) {
        const checkInTime = `${h.date}T${h.inH}+07:00`;
        const checkOutTime = `${h.date}T${h.outH}+07:00`;
        const checkInPhoto = generateAttendanceProofBase64(u.nama, 'IN', `${h.date} ${h.inH}`);
        const checkOutPhoto = generateAttendanceProofBase64(u.nama, 'OUT', `${h.date} ${h.outH}`);

        await client.query(
          `INSERT INTO attendances (
            employee_id, attendance_date, check_in_time, check_in_photo,
            check_out_time, check_out_photo, work_duration_seconds
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (employee_id, attendance_date) DO NOTHING;`,
          [empId, h.date, checkInTime, checkInPhoto, checkOutTime, checkOutPhoto, h.durSec]
        );
      }
    }

    console.log('[SEED] Seluruh master data, user default, dan riwayat absensi berhasil diinisialisasi.');
  } catch (err) {
    console.error('[DB ERROR]', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrationAndSeed();
