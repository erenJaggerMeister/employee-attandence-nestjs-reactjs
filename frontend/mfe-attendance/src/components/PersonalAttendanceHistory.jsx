import React, { useState, useEffect } from 'react';
import { api } from '../../../shared/api';
import { Calendar, Clock, RefreshCw, Eye, ShieldCheck, Image as ImageIcon } from 'lucide-react';

export default function PersonalAttendanceHistory({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);
  const [nowTime, setNowTime] = useState(Date.now());

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // Update timer live untuk baris absensi yang statusnya masih bekerja (belum keluar)
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Mengakses endpoint spesifik: /api/msf_attendance/user/{userId} dengan Bearer Token
      const data = await api.getUserAttendanceHistory(user.id);
      setHistory(data || []);
    } catch (err) {
      console.error('Failed to fetch personal history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatTimeOnly = (isoStr) => {
    if (!isoStr) return '-';
    return new Date(isoStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  };

  // Menghitung durasi live jika belum checkout, atau fix jika sudah checkout
  const computeDuration = (item) => {
    if (item.workDurationFormatted && item.workDurationFormatted !== '-') {
      return item.workDurationFormatted;
    }
    if (item.checkInTime && !item.checkOutTime) {
      const start = new Date(item.checkInTime).getTime();
      const diff = Math.max(0, Math.floor((nowTime - start) / 1000));
      const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const secs = String(diff % 60).padStart(2, '0');
      return (
        <span style={{ color: '#2563eb', fontWeight: 700 }}>
          {hrs}:{mins}:{secs} (Live)
        </span>
      );
    }
    return '-';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <RefreshCw className="animate-spin" size={32} style={{ color: '#2563eb' }} />
        <p style={{ marginTop: 12, color: '#64748b' }}>Memuat riwayat kehadiran pribadi...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: '#eff6ff',
            padding: 8,
            borderRadius: 8,
            color: '#1d4ed8',
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Riwayat Kehadiran Pribadi</h3>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Pegawai: <strong>{user?.nama}</strong> | Strict Token Isolation: Terproteksi Read-Only
            </p>
          </div>
        </div>

        <button onClick={fetchHistory} className="btn btn-outline" style={{ fontSize: 13 }}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {history.length === 0 ? (
        <div className="webcam-card" style={{ padding: '50px 20px' }}>
          <Clock size={40} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>Belum ada log riwayat absensi untuk akun Anda.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60, textAlign: 'center' }}>No</th>
                <th>Tanggal Absensi</th>
                <th>Jam Masuk</th>
                <th style={{ textAlign: 'center' }}>Foto Capture Masuk</th>
                <th>Jam Keluar</th>
                <th style={{ textAlign: 'center' }}>Foto Capture Keluar</th>
                <th>Durasi Kerja</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                  <td>
                    <strong>{formatDateIndo(item.attendanceDate)}</strong>
                  </td>
                  <td>{formatTimeOnly(item.checkInTime)}</td>
                  <td style={{ textAlign: 'center' }}>
                    {item.checkInPhoto ? (
                      <img
                        src={item.checkInPhoto}
                        alt="Bukti Masuk"
                        className="table-photo-thumb"
                        title="Klik untuk perbesar"
                        onClick={() => setModalImage({ title: `Foto Masuk - ${formatDateIndo(item.attendanceDate)}`, src: item.checkInPhoto })}
                      />
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>-</span>
                    )}
                  </td>
                  <td>{item.checkOutTime ? formatTimeOnly(item.checkOutTime) : <span style={{ color: '#94a3b8' }}>-</span>}</td>
                  <td style={{ textAlign: 'center' }}>
                    {item.checkOutPhoto ? (
                      <img
                        src={item.checkOutPhoto}
                        alt="Bukti Keluar"
                        className="table-photo-thumb"
                        title="Klik untuk perbesar"
                        onClick={() => setModalImage({ title: `Foto Keluar - ${formatDateIndo(item.attendanceDate)}`, src: item.checkOutPhoto })}
                      />
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>-</span>
                    )}
                  </td>
                  <td>{computeDuration(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Lightbox Foto Base64 */}
      {modalImage && (
        <div className="modal-overlay" onClick={() => setModalImage(null)}>
          <div className="modal-content" style={{ maxWidth: 500, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{modalImage.title}</h4>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#000', marginBottom: 16 }}>
              <img src={modalImage.src} alt="Snapshot Preview" style={{ width: '100%', display: 'block', maxHeight: 420, objectFit: 'contain' }} />
            </div>
            <button onClick={() => setModalImage(null)} className="btn btn-outline" style={{ width: '100%' }}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
