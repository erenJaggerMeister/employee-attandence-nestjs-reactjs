import React, { useState, useEffect } from 'react';
import { api, getAuthHeaders, URLS } from '../../../shared/api';
import axios from 'axios';
import { FileSpreadsheet, Download, RefreshCw, Eye, ShieldAlert, BarChart3 } from 'lucide-react';

export default function CompanyAttendanceHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  useEffect(() => {
    fetchCompanyHistory();
  }, []);

  const fetchCompanyHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanyHistory();
      setRecords(data || []);
    } catch (err) {
      console.error('Failed to load company history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setDownloading(true);
      const res = await axios.get(`${URLS.ATTENDANCE}/export-excel`, {
        headers: getAuthHeaders(),
        responseType: 'blob',
      });

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      link.setAttribute('download', `Attendance_Report_DexaGroup_${dateStr}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Gagal mengunduh file Excel. Pastikan Anda login sebagai HRD.');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div>
      {/* Header & Export Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            Riwayat Kehadiran Seluruh Karyawan Perusahaan
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Integritas Data: View-Only (Dilarang Mengedit) | Multi-Divisi Dexa Group
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={fetchCompanyHistory} className="btn btn-outline">
            <RefreshCw size={15} /> Refresh
          </button>

          <button
            onClick={handleExportExcel}
            disabled={downloading}
            className="btn btn-success"
            style={{ boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)' }}
          >
            {downloading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Menyiapkan Excel & Grafik...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet size={16} />
                <span>Export Excel (+ 2 Bar Charts)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Card mengenai Excel Export */}
      <div style={{
        background: '#ecfdf5',
        border: '1px solid #a7f3d0',
        borderRadius: 10,
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <BarChart3 size={24} style={{ color: '#059669', flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: '#065f46' }}>
          <strong>Fitur Laporan Excel Enterprise:</strong> File Excel yang diunduh terdiri dari <strong>Sheet 1</strong> (Tabel data absensi lengkap) dan <strong>Sheet 2</strong> (2 buah Bar Chart visual distribusi jam masuk dan jam keluar seluruh karyawan).
        </div>
      </div>

      {/* Data Table View-Only */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <RefreshCw className="animate-spin" size={32} style={{ color: '#2563eb' }} />
          <p style={{ marginTop: 12, color: '#64748b' }}>Memuat riwayat kehadiran perusahaan...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="webcam-card" style={{ padding: '40px 20px' }}>
          <p style={{ color: '#64748b' }}>Belum ada transaksi riwayat kehadiran yang tercatat.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 50, textAlign: 'center' }}>No</th>
                <th>Tanggal</th>
                <th>NIK</th>
                <th>Nama Karyawan</th>
                <th>Divisi</th>
                <th>Jabatan</th>
                <th>Jam Masuk</th>
                <th style={{ textAlign: 'center' }}>Bukti Masuk</th>
                <th>Jam Keluar</th>
                <th style={{ textAlign: 'center' }}>Bukti Keluar</th>
                <th>Durasi Kerja</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={r.attendanceId}>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                  <td><strong>{formatDate(r.attendanceDate)}</strong></td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.nik}</td>
                  <td><strong>{r.namaLengkap}</strong></td>
                  <td><span className="badge badge-divisi">{r.divisi}</span></td>
                  <td><span className="badge badge-jabatan">{r.jabatan}</span></td>
                  <td>{r.checkInTimeFormatted}</td>
                  <td style={{ textAlign: 'center' }}>
                    {r.checkInPhoto ? (
                      <img
                        src={r.checkInPhoto}
                        alt="Foto Masuk"
                        className="table-photo-thumb"
                        title="Klik untuk perbesar"
                        onClick={() => setPreviewPhoto({ title: `Foto Masuk - ${r.namaLengkap}`, src: r.checkInPhoto })}
                      />
                    ) : '-'}
                  </td>
                  <td>{r.checkOutTimeFormatted}</td>
                  <td style={{ textAlign: 'center' }}>
                    {r.checkOutPhoto ? (
                      <img
                        src={r.checkOutPhoto}
                        alt="Foto Keluar"
                        className="table-photo-thumb"
                        title="Klik untuk perbesar"
                        onClick={() => setPreviewPhoto({ title: `Foto Keluar - ${r.namaLengkap}`, src: r.checkOutPhoto })}
                      />
                    ) : <span style={{ color: '#94a3b8' }}>-</span>}
                  </td>
                  <td>
                    <strong style={{ color: r.workDurationFormatted !== '-' ? '#059669' : '#64748b' }}>
                      {r.workDurationFormatted}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Lightbox Foto Base64 */}
      {previewPhoto && (
        <div className="modal-overlay" onClick={() => setPreviewPhoto(null)}>
          <div className="modal-content" style={{ maxWidth: 500, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{previewPhoto.title}</h4>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#000', marginBottom: 16 }}>
              <img src={previewPhoto.src} alt="Snapshot Preview" style={{ width: '100%', display: 'block', maxHeight: 420, objectFit: 'contain' }} />
            </div>
            <button onClick={() => setPreviewPhoto(null)} className="btn btn-outline" style={{ width: '100%' }}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
