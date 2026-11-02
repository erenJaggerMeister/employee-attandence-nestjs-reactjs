import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../shared/api';
import { X, Upload, Camera, Check, RefreshCw, AlertCircle } from 'lucide-react';

export default function EmployeeFormModal({ isOpen, onClose, employeeToEdit, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nik: '',
    namaLengkap: '',
    photoProfile: '',
    statusEmployeeId: '',
    tanggalLahir: '',
    tanggalMasuk: new Date().toISOString().split('T')[0],
    tinggiBadan: 170,
    beratBadan: 65,
    golonganDarah: 'O',
    statusWorkId: '',
    tanggalMulaiKontrak: '',
    tanggalAkhirKontrak: '',
    roleDivisionId: '',
    jabatanId: '',
  });

  const [masters, setMasters] = useState({
    divisions: [],
    jabatans: [],
    statusWorks: [],
    statusEmployees: [],
  });

  const [loadingMasters, setLoadingMasters] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadMasters();
    }
  }, [isOpen]);

  const loadMasters = async () => {
    try {
      setLoadingMasters(true);
      const res = await api.getLookups();
      setMasters(res);

      if (employeeToEdit) {
        setFormData({
          nik: employeeToEdit.nik || '',
          namaLengkap: employeeToEdit.namaLengkap || '',
          photoProfile: employeeToEdit.photoProfile || '',
          statusEmployeeId: employeeToEdit.statusEmployeeId || res.statusEmployees[0]?.id,
          tanggalLahir: employeeToEdit.tanggalLahir || '',
          tanggalMasuk: employeeToEdit.tanggalMasuk || '',
          tinggiBadan: employeeToEdit.tinggiBadan || 170,
          beratBadan: employeeToEdit.beratBadan || 65,
          golonganDarah: employeeToEdit.golonganDarah || 'O',
          statusWorkId: employeeToEdit.statusWorkId || res.statusWorks[0]?.id,
          tanggalMulaiKontrak: employeeToEdit.tanggalMulaiKontrak || '',
          tanggalAkhirKontrak: employeeToEdit.tanggalAkhirKontrak || '',
          roleDivisionId: employeeToEdit.roleDivisionId || res.divisions[0]?.id,
          jabatanId: employeeToEdit.jabatanId || res.jabatans[0]?.id,
        });
      } else {
        setFormData({
          email: '',
          password: 'password123',
          nik: '',
          namaLengkap: '',
          photoProfile: '',
          statusEmployeeId: res.statusEmployees[0]?.id || '',
          tanggalLahir: '1995-01-01',
          tanggalMasuk: new Date().toISOString().split('T')[0],
          tinggiBadan: 170,
          beratBadan: 65,
          golonganDarah: 'O',
          statusWorkId: res.statusWorks[0]?.id || '',
          tanggalMulaiKontrak: '',
          tanggalAkhirKontrak: '',
          roleDivisionId: res.divisions[0]?.id || '',
          jabatanId: res.jabatans[0]?.id || '',
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memuat data master referensi');
    } finally {
      setLoadingMasters(false);
    }
  };

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Ukuran file foto maksimal 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFormData(prev => ({ ...prev, photoProfile: uploadEvent.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedWorkName = masters.statusWorks.find(w => w.id === formData.statusWorkId)?.nama;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      setSubmitting(true);
      if (employeeToEdit) {
        await api.updateEmployee(employeeToEdit.id, formData);
      } else {
        await api.createEmployee(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data pegawai');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            {employeeToEdit ? 'Perbarui Data Pegawai' : 'Tambah Pegawai Baru'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Foto Profil Preview & Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <img
              src={formData.photoProfile || 'https://via.placeholder.com/80?text=Foto'}
              alt="Preview"
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #cbd5e1' }}
            />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Foto Profil Pegawai</p>
              <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>Disimpan langsung ke PostgreSQL sebagai string Base64 Data URI</p>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline"
                style={{ fontSize: 12, padding: '6px 12px' }}
              >
                <Upload size={14} /> Pilih Foto dari Komputer
              </button>
            </div>
          </div>

          <div className="form-grid">
            {!employeeToEdit && (
              <>
                <div className="form-group">
                  <label className="form-label">Email Perusahaan (untuk Akun Login) *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="form-control"
                    placeholder="nama.pegawai@dexagroup.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password Default *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="form-control"
                    placeholder="password123"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">NIK (Nomor KTP 16 Digit) *</label>
              <input
                type="text"
                required
                disabled={!!employeeToEdit}
                value={formData.nik}
                onChange={e => setFormData({ ...formData, nik: e.target.value })}
                className="form-control"
                placeholder="317101..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={formData.namaLengkap}
                onChange={e => setFormData({ ...formData, namaLengkap: e.target.value })}
                className="form-control"
                placeholder="Ahmad Fauzi"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Divisi *</label>
              <select
                required
                value={formData.roleDivisionId}
                onChange={e => setFormData({ ...formData, roleDivisionId: e.target.value })}
                className="form-control"
              >
                {masters.divisions.map(d => (
                  <option key={d.id} value={d.id}>{d.nama}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Jabatan *</label>
              <select
                required
                value={formData.jabatanId}
                onChange={e => setFormData({ ...formData, jabatanId: e.target.value })}
                className="form-control"
              >
                {masters.jabatans.map(j => (
                  <option key={j.id} value={j.id}>{j.nama}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status Keaktifan Pegawai *</label>
              <select
                required
                value={formData.statusEmployeeId}
                onChange={e => setFormData({ ...formData, statusEmployeeId: e.target.value })}
                className="form-control"
              >
                {masters.statusEmployees.map(se => (
                  <option key={se.id} value={se.id}>{se.nama}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status Bekerja *</label>
              <select
                required
                value={formData.statusWorkId}
                onChange={e => setFormData({ ...formData, statusWorkId: e.target.value })}
                className="form-control"
              >
                {masters.statusWorks.map(sw => (
                  <option key={sw.id} value={sw.id}>{sw.nama}</option>
                ))}
              </select>
            </div>

            {selectedWorkName === 'kontrak' && (
              <>
                <div className="form-group">
                  <label className="form-label">Tanggal Mulai Kontrak</label>
                  <input
                    type="date"
                    value={formData.tanggalMulaiKontrak}
                    onChange={e => setFormData({ ...formData, tanggalMulaiKontrak: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Akhir Kontrak</label>
                  <input
                    type="date"
                    value={formData.tanggalAkhirKontrak}
                    onChange={e => setFormData({ ...formData, tanggalAkhirKontrak: e.target.value })}
                    className="form-control"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Tanggal Lahir *</label>
              <input
                type="date"
                required
                value={formData.tanggalLahir}
                onChange={e => setFormData({ ...formData, tanggalLahir: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tanggal Masuk Perusahaan *</label>
              <input
                type="date"
                required
                value={formData.tanggalMasuk}
                onChange={e => setFormData({ ...formData, tanggalMasuk: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Golongan Darah *</label>
              <select
                required
                value={formData.golonganDarah}
                onChange={e => setFormData({ ...formData, golonganDarah: e.target.value })}
                className="form-control"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tinggi Badan (cm) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.tinggiBadan}
                onChange={e => setFormData({ ...formData, tinggiBadan: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Berat Badan (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.beratBadan}
                onChange={e => setFormData({ ...formData, beratBadan: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Batal
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
              <span>{employeeToEdit ? 'Simpan Perubahan' : 'Simpan Karyawan Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
