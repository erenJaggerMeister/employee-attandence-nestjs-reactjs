class EmployeeMapper {
  static toResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      nik: row.nik,
      namaLengkap: row.nama_lengkap,
      photoProfile: row.photo_profile,
      statusEmployeeId: row.status_employee_id,
      statusEmployeeName: row.status_employee_name || 'aktif',
      tanggalLahir: row.tanggal_lahir ? new Date(row.tanggal_lahir).toISOString().split('T')[0] : null,
      tanggalMasuk: row.tanggal_masuk ? new Date(row.tanggal_masuk).toISOString().split('T')[0] : null,
      tinggiBadan: parseFloat(row.tinggi_badan),
      beratBadan: parseFloat(row.berat_badan),
      golonganDarah: row.golongan_darah,
      statusWorkId: row.status_work_id,
      statusWorkName: row.status_work_name || 'karyawan tetap',
      tanggalMulaiKontrak: row.tanggal_mulai_kontrak ? new Date(row.tanggal_mulai_kontrak).toISOString().split('T')[0] : null,
      tanggalAkhirKontrak: row.tanggal_akhir_kontrak ? new Date(row.tanggal_akhir_kontrak).toISOString().split('T')[0] : null,
      roleDivisionId: row.role_division_id,
      divisiName: row.divisi_name || 'IT',
      jabatanId: row.jabatan_id,
      jabatanName: row.jabatan_name || 'Junior',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static toResponseList(rows) {
    return (rows || []).map(r => this.toResponse(r));
  }
}

module.exports = { EmployeeMapper };
