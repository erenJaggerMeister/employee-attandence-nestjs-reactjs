import React, { useState, useEffect } from 'react';
import { api } from '../../../shared/api';
import { ArrowLeft, Edit3, User, Calendar, Briefcase, Heart, Award, RefreshCw } from 'lucide-react';

export default function EmployeeDetail({ employeeId, onBack, onEdit }) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [employeeId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await api.getEmployeeDetail(employeeId);
      setEmployee(data);
    } catch (err) {
      console.error('Failed to load employee detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <RefreshCw className="animate-spin" size={32} style={{ color: '#2563eb' }} />
        <p style={{ marginTop: 12, color: '#64748b' }}>Memuat profil lengkap pegawai...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="webcam-card" style={{ padding: '40px 20px' }}>
        <p style={{ color: '#dc2626' }}>Data pegawai tidak ditemukan.</p>
        <button onClick={onBack} className="btn btn-outline" style={{ marginTop: 16 }}>
          <ArrowLeft size={16} /> Kembali
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Top action bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <button onClick={onBack} className="btn btn-outline">
          <ArrowLeft size={16} /> Kembali ke Grid 3x3
        </button>

        <button onClick={() => onEdit(employee)} className="btn btn-primary">
          <Edit3 size={16} /> Perbarui Data Pegawai
        </button>
      </div>

      {/* Main Detail Container */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}>
        {/* Profile Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          padding: '36px 32px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}>
          {/* Foto Profil Karyawan (Base64 dari PostgreSQL) */}
          <div style={{ position: 'relative' }}>
            <img
              src={employee.photoProfile || 'https://via.placeholder.com/120'}
              alt={employee.namaLengkap}
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                backgroundColor: '#ffffff',
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 24, fontWeight: 700 }}>{employee.namaLengkap}</h2>
              <span style={{
                background: employee.statusEmployeeName === 'aktif' ? '#10b981' : '#ef4444',
                color: '#fff',
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                {employee.statusEmployeeName}
              </span>
            </div>

            <p style={{ fontSize: 13, opacity: 0.85, marginTop: 4, fontFamily: 'monospace' }}>
              NIK KTP: {employee.nik}
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <span style={{ background: 'rgba(255,255,255,0.18)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                Divisi: {employee.divisiName}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.18)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                Jabatan: {employee.jabatanName}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Detail Sections */}
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
            {/* Section 1: Informasi Pribadi & Fisik */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <User size={18} /> INFORMASI PRIBADI & FISIK
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>Tanggal Lahir</span>
                  <strong>{formatDate(employee.tanggalLahir)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>Golongan Darah</span>
                  <strong style={{ color: '#dc2626' }}>Tipe {employee.golonganDarah}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>Tinggi Badan</span>
                  <strong>{employee.tinggiBadan} cm</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>Berat Badan</span>
                  <strong>{employee.beratBadan} kg</strong>
                </div>
              </div>
            </div>

            {/* Section 2: Informasi Kepegawaian & Kontrak */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Briefcase size={18} /> STATUS PEKERJAAN & KONTRAK
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>Tanggal Masuk Perusahaan</span>
                  <strong>{formatDate(employee.tanggalMasuk)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>Status Bekerja</span>
                  <strong style={{ textTransform: 'capitalize', color: '#059669' }}>
                    {employee.statusWorkName}
                  </strong>
                </div>

                {employee.statusWorkName === 'kontrak' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                      <span style={{ color: '#64748b' }}>Tanggal Mulai Kontrak</span>
                      <strong>{formatDate(employee.tanggalMulaiKontrak)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                      <span style={{ color: '#64748b' }}>Tanggal Akhir Kontrak</span>
                      <strong style={{ color: '#d97706' }}>{formatDate(employee.tanggalAkhirKontrak)}</strong>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>ID Referensi Sistem</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>{employee.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
