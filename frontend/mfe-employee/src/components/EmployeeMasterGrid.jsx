import React, { useState, useEffect } from 'react';
import { api } from '../../../shared/api';
import { Users, Search, Plus, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function EmployeeMasterGrid({ onSelectEmployee, onAddNew }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [divisions, setDivisions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    fetchGrid();
  }, [page, divisionFilter]);

  const loadLookups = async () => {
    try {
      const res = await api.getLookups();
      setDivisions(res.divisions || []);
    } catch (err) {
      console.error('Failed to load lookups:', err);
    }
  };

  const fetchGrid = async () => {
    try {
      setLoading(true);
      const res = await api.getEmployeeGrid({
        page,
        limit: 9, // Tepat 9 kartu per halaman untuk format Grid 3x3
        search,
        divisionId: divisionFilter || undefined,
      });
      setCards(res.cards || []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load employee grid:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchGrid();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'aktif':
        return 'badge-status-aktif';
      case 'resign':
        return 'badge-status-resign';
      case 'phk':
        return 'badge-status-phk';
      default:
        return 'badge-divisi';
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: '#eff6ff',
            padding: 8,
            borderRadius: 8,
            color: '#1d4ed8',
          }}>
            <Users size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Data Informasi Karyawan</h3>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Tampilan Grid Card 3x3 (Total {total} Pegawai Terdaftar)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onAddNew} className="btn btn-primary" style={{ fontSize: 13 }}>
            <Plus size={16} /> Tambah Karyawan Baru
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        background: '#ffffff',
        padding: '14px 18px',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        marginBottom: 24,
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Cari berdasarkan nama lengkap atau NIK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: 34, width: '100%' }}
            />
            <Search size={16} style={{ position: 'absolute', left: 10, top: 11, color: '#94a3b8' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 14px' }}>
            Cari
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} style={{ color: '#64748b' }} />
          <select
            value={divisionFilter}
            onChange={(e) => { setDivisionFilter(e.target.value); setPage(1); }}
            className="form-control"
            style={{ width: 170 }}
          >
            <option value="">Semua Divisi</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Konten Grid 3x3 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <RefreshCw className="animate-spin" size={32} style={{ color: '#2563eb' }} />
          <p style={{ marginTop: 12, color: '#64748b' }}>Memuat katalog pegawai...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="webcam-card" style={{ padding: '40px 20px' }}>
          <p style={{ color: '#64748b' }}>Tidak ada data pegawai yang sesuai dengan filter pencarian.</p>
        </div>
      ) : (
        <>
          <div className="grid-3x3">
            {cards.map((emp) => (
              <div
                key={emp.id}
                className="employee-card"
                onClick={() => onSelectEmployee(emp.id)}
                title="Klik untuk melihat detail lengkap pegawai"
              >
                {/* Foto Profil Karyawan (Base64) */}
                <img
                  src={emp.photoProfile || 'https://via.placeholder.com/80'}
                  alt={emp.namaLengkap}
                  className="card-avatar"
                />

                {/* Nama Karyawan */}
                <h4 className="card-name">{emp.namaLengkap}</h4>

                {/* NIK */}
                <span className="card-nik">NIK: {emp.nik}</span>

                {/* Badges: Divisi & Jabatan */}
                <div className="card-meta-row">
                  <span className="badge badge-divisi">{emp.divisiName}</span>
                  <span className="badge badge-jabatan">{emp.jabatanName}</span>
                </div>

                {/* Status Aktif */}
                <div>
                  <span className={`badge ${getStatusBadgeClass(emp.statusEmployeeName)}`}>
                    Status: {emp.statusEmployeeName}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            padding: '12px 20px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
          }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
            </span>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn btn-outline"
                style={{ padding: '6px 12px' }}
              >
                <ChevronLeft size={16} /> Sebelumnya
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn btn-outline"
                style={{ padding: '6px 12px' }}
              >
                Selanjutnya <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
