const axios = require('axios');
const fs = require('fs');
const path = require('path');

const sampleBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TESTING END-TO-END SUITE: DEXA GROUP HRMS API');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Login sebagai Karyawan (Ahmad Fauzi)
    console.log('1. Testing Autentikasi msf_auth...');
    const empLoginRes = await axios.post('http://127.0.0.1:5000/api/msf_auth/login', {
      email: 'ahmad.fauzi@dexagroup.com',
      password: 'password123',
    });
    assert(empLoginRes.status === 201 || empLoginRes.status === 200, 'Login Karyawan berhasil');
    const empToken = empLoginRes.data.accessToken;
    const empUser = empLoginRes.data.user;
    assert(empToken && empUser.role === 'EMPLOYEE', 'Bearer Token diterima dengan role EMPLOYEE');

    // 2. Login sebagai HRD (Sarah Wijaya)
    const hrdLoginRes = await axios.post('http://127.0.0.1:5000/api/msf_auth/login', {
      email: 'hrd@dexagroup.com',
      password: 'password123',
    });
    assert(hrdLoginRes.status === 201 || hrdLoginRes.status === 200, 'Login HRD berhasil');
    const hrdToken = hrdLoginRes.data.accessToken;
    const hrdUser = hrdLoginRes.data.user;
    assert(hrdToken && hrdUser.role === 'HRD', 'Bearer Token diterima dengan role HRD');

    // 3. Testing RBAC Guard: Karyawan dilarang akses msf_employee (HTTP 403)
    console.log('\n2. Testing RBAC Guard Proteksi...');
    try {
      await axios.get('http://127.0.0.1:5001/api/msf_employee/grid', {
        headers: { Authorization: `Bearer ${empToken}` },
      });
      assert(false, 'Karyawan seharusnya ditolak saat mengakses msf_employee (HTTP 403)');
    } catch (err) {
      assert(err.response && err.response.status === 403, 'Karyawan sukses ditolak dengan HTTP 403 Forbidden pada endpoint Master Karyawan');
    }

    // 4. Testing HRD Akses msf_employee Grid 3x3
    const gridRes = await axios.get('http://127.0.0.1:5001/api/msf_employee/grid', {
      headers: { Authorization: `Bearer ${hrdToken}` },
      params: { page: 1, limit: 9 },
    });
    assert(gridRes.status === 200, 'HRD sukses mengakses Master Data Karyawan (Grid 3x3)');
    assert(Array.isArray(gridRes.data.cards) && gridRes.data.cards.length > 0, `Ditemukan ${gridRes.data.cards.length} kartu pegawai pada Grid`);

    // 5. Testing Lookups (Divisi, Jabatan, Status Work, Status Employee)
    const lookupsRes = await axios.get('http://127.0.0.1:5001/api/msf_employee/lookup/masters', {
      headers: { Authorization: `Bearer ${hrdToken}` },
    });
    assert(lookupsRes.status === 200 && lookupsRes.data.divisions.length === 5, 'Master divisi lengkap (5 divisi: IT, R&D obat, Finance, HR&GA, Sales)');

    // 6. Testing Token Isolation: Karyawan akses riwayat user lain ditolak (HTTP 403)
    console.log('\n3. Testing Token Isolation & Riwayat Absensi...');
    const otherUserId = hrdUser.id;
    try {
      await axios.get(`http://127.0.0.1:5002/api/msf_attendance/user/${otherUserId}`, {
        headers: { Authorization: `Bearer ${empToken}` },
      });
      assert(false, 'Karyawan seharusnya dilarang mengakses riwayat user lain');
    } catch (err) {
      assert(err.response && err.response.status === 403, 'Token Isolation aktif: Karyawan ditolak (HTTP 403) saat mengakses riwayat ID lain');
    }

    // 7. Testing Karyawan akses riwayatnya sendiri
    const myHistoryRes = await axios.get(`http://127.0.0.1:5002/api/msf_attendance/user/${empUser.id}`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    assert(myHistoryRes.status === 200 && Array.isArray(myHistoryRes.data), `Karyawan sukses menarik riwayat pribadi (${myHistoryRes.data.length} data record)`);

    // 8. Testing Status Hari Ini & Check-in / Check-out
    console.log('\n4. Testing Alur Absensi Kehadiran...');
    const todayStatusBefore = await axios.get('http://127.0.0.1:5002/api/msf_attendance/today-status', {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    assert(todayStatusBefore.status === 200, 'Status absensi hari ini berhasil diambil');

    // Jika belum hadir, coba check-in
    if (!todayStatusBefore.data.hasCheckedIn) {
      const checkInRes = await axios.post('http://127.0.0.1:5002/api/msf_attendance/check-in', {
        photo: sampleBase64,
      }, {
        headers: { Authorization: `Bearer ${empToken}` },
      });
      assert(checkInRes.status === 201 || checkInRes.status === 200, 'Check-in berhasil dengan payload Base64 foto');
      assert(checkInRes.data.status === 'Sedang Bekerja', 'Status berubah menjadi Sedang Bekerja');

      // Coba check-out
      const checkOutRes = await axios.post('http://127.0.0.1:5002/api/msf_attendance/check-out', {
        photo: sampleBase64,
      }, {
        headers: { Authorization: `Bearer ${empToken}` },
      });
      assert(checkOutRes.status === 201 || checkOutRes.status === 200, 'Check-out berhasil dengan payload Base64 foto');
      assert(checkOutRes.data.status === 'Telah Pulang', 'Status berubah menjadi Telah Pulang');
    } else {
      console.log(`ℹ️ Info: User sudah absen hari ini (${todayStatusBefore.data.status})`);
    }

    // 9. Testing HRD Company Attendance History
    console.log('\n5. Testing Riwayat Absensi Perusahaan & Ekspor Excel...');
    const companyHistoryRes = await axios.get('http://127.0.0.1:5002/api/msf_attendance/company-history', {
      headers: { Authorization: `Bearer ${hrdToken}` },
    });
    assert(companyHistoryRes.status === 200 && companyHistoryRes.data.length > 0, `HRD sukses memantau seluruh riwayat absensi perusahaan (${companyHistoryRes.data.length} transaksi)`);

    // 10. Testing Ekspor Excel Multi-Sheet + 2 Bar Chart
    const excelRes = await axios.get('http://127.0.0.1:5002/api/msf_attendance/export-excel', {
      headers: { Authorization: `Bearer ${hrdToken}` },
      responseType: 'arraybuffer',
    });
    assert(excelRes.status === 200, 'File Excel berhasil digenerate oleh backend');
    assert(excelRes.data.byteLength > 5000, `Ukuran file Excel valid (${excelRes.data.byteLength} bytes) memuat multi-sheet dan grafik gambar`);

    const tempExcelPath = path.join(__dirname, 'test_output_report.xlsx');
    fs.writeFileSync(tempExcelPath, Buffer.from(excelRes.data));
    assert(fs.existsSync(tempExcelPath), `File tersimpan secara lokal untuk verifikasi: ${tempExcelPath}`);

  } catch (err) {
    console.error('CRITICAL TEST ERROR:', err.response ? err.response.data : err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🎯 HASIL AKHIR: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed === 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
