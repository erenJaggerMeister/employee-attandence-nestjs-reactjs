import React, { useState, useEffect } from 'react';
import { AuthService, api } from '../../shared/api';
import AttendanceCheckIn from '../../mfe-attendance/src/components/AttendanceCheckIn';
import PersonalAttendanceHistory from '../../mfe-attendance/src/components/PersonalAttendanceHistory';
import EmployeeMasterGrid from '../../mfe-employee/src/components/EmployeeMasterGrid';
import EmployeeDetail from '../../mfe-employee/src/components/EmployeeDetail';
import EmployeeFormModal from '../../mfe-employee/src/components/EmployeeFormModal';
import CompanyAttendanceHistory from '../../mfe-employee/src/components/CompanyAttendanceHistory';

import {
  Camera,
  History,
  Users,
  FileSpreadsheet,
  LogOut,
  Shield,
  UserCheck,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(AuthService.getUser());
  const [activeMenu, setActiveMenu] = useState('attendance-checkin'); // 'attendance-checkin' | 'attendance-history' | 'employee-grid' | 'employee-history'
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  // Form login state
  const [loginEmail, setLoginEmail] = useState('hrd@dexagroup.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Auto-switch to attendance if non-HRD attempts to access master data
  useEffect(() => {
    if (currentUser && currentUser.role === 'EMPLOYEE') {
      if (activeMenu.startsWith('employee-')) {
        setActiveMenu('attendance-checkin');
      }
    }
  }, [currentUser, activeMenu]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError(null);
    try {
      setLoginLoading(true);
      const res = await api.login(loginEmail, loginPassword);
      AuthService.setAuth(res.accessToken, res.user);
      setCurrentUser(res.user);
      setActiveMenu('attendance-checkin');
    } catch (err) {
      console.error(err);
      setLoginError(err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setLoginLoading(false);
    }
  };

  const quickLoginAs = async (email, password) => {
    setLoginEmail(email);
    setLoginPassword(password);
    setLoginError(null);
    try {
      setLoginLoading(true);
      const res = await api.login(email, password);
      AuthService.setAuth(res.accessToken, res.user);
      setCurrentUser(res.user);
      setActiveMenu('attendance-checkin');
    } catch (err) {
      console.error(err);
      setLoginError(err.response?.data?.message || 'Login cepat gagal');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    AuthService.clearAuth();
    setCurrentUser(null);
    setSelectedEmployeeId(null);
    setEmployeeToEdit(null);
  };

  // ========================================================
  // RENDER: LOGIN VIEW (Jika Belum Login)
  // ========================================================
  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%)',
        padding: 20,
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: 440,
          width: '100%',
          padding: '40px 36px',
        }}>
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
            }}>
              <Layers size={28} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Dexa Group HRMS
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Sistem Absensi Kehadiran & Master Data Pegawai
            </p>
          </div>

          {loginError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 20,
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Email Perusahaan</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="form-control"
                placeholder="nama@dexagroup.com"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="form-control"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 15 }}
            >
              {loginLoading ? 'Memverifikasi...' : 'Masuk ke Sistem (Login)'}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 12 }}>
              UJI RBAC CEPAT (PILIH ROLE):
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => quickLoginAs('hrd@dexagroup.com', 'password123')}
                className="btn btn-outline"
                style={{ fontSize: 12, padding: '8px 10px', borderColor: '#fca5a5', background: '#fff5f5' }}
              >
                <Shield size={14} color="#b91c1c" />
                <span style={{ color: '#b91c1c', fontWeight: 700 }}>Role HRD</span>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs('ahmad.fauzi@dexagroup.com', 'password123')}
                className="btn btn-outline"
                style={{ fontSize: 12, padding: '8px 10px', borderColor: '#bfdbfe', background: '#f0f7ff' }}
              >
                <UserCheck size={14} color="#1d4ed8" />
                <span style={{ color: '#1d4ed8', fontWeight: 700 }}>Role Pegawai</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER: AUTHENTICATED MFE HOST SHELL CONTAINER
  // ========================================================
  const isHRD = currentUser.role === 'HRD';

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION CONTAINER */}
      <aside className="sidebar">
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="logo-icon">DG</div>
          <div className="logo-text">
            <h1>Dexa Group</h1>
            <p>HR Attendance MFE</p>
          </div>
        </div>

        {/* Navigation Items with Strict Role Filtering */}
        <nav className="sidebar-nav">
          {/* MENU 1: ATTENDANCE (Bisa diakses Pegawai & HRD Pribadi) */}
          <div className="nav-section-title">Menu Attendance</div>

          <div
            className={`nav-item ${activeMenu === 'attendance-checkin' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('attendance-checkin'); setSelectedEmployeeId(null); }}
          >
            <Camera size={18} />
            <span>Kehadiran (Absensi)</span>
          </div>

          <div
            className={`nav-item ${activeMenu === 'attendance-history' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('attendance-history'); setSelectedEmployeeId(null); }}
          >
            <History size={18} />
            <span>Riwayat Pribadi</span>
          </div>

          {/* MENU 2: MASTER DATA KARYAWAN (HANYA MUNCUL JIKA ROLE HRD) */}
          {/* ATURAN BISNIS: KARYAWAN DILARANG KERAS MELIHAT/MENGAKSES MENU INI (DISEMBUNYIKAN) */}
          {isHRD && (
            <>
              <div className="nav-section-title" style={{ marginTop: 18 }}>
                Menu Master Data Karyawan (HRD)
              </div>

              <div
                className={`nav-item ${activeMenu === 'employee-grid' ? 'active' : ''}`}
                onClick={() => { setActiveMenu('employee-grid'); setSelectedEmployeeId(null); }}
              >
                <Users size={18} />
                <span>Data Informasi Karyawan</span>
              </div>

              <div
                className={`nav-item ${activeMenu === 'employee-history' ? 'active' : ''}`}
                onClick={() => { setActiveMenu('employee-history'); setSelectedEmployeeId(null); }}
              >
                <FileSpreadsheet size={18} />
                <span>Riwayat Kehadiran (PT)</span>
              </div>
            </>
          )}
        </nav>

        {/* Sidebar Footer: User Card Mini & Logout */}
        <div className="sidebar-footer">
          <div className="user-card-mini">
            <img
              src={currentUser.photoProfile || 'https://via.placeholder.com/40'}
              alt={currentUser.nama}
              className="user-avatar-mini"
            />
            <div className="user-info-mini">
              <div className="user-name-mini" title={currentUser.nama}>{currentUser.nama}</div>
              <span className={`user-role-badge ${isHRD ? 'role-hrd' : 'role-employee'}`}>
                {currentUser.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#f87171',
                padding: '8px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="page-title">
            <h2>
              {activeMenu === 'attendance-checkin' && 'Absensi Masuk & Keluar (Webcam Real-time)'}
              {activeMenu === 'attendance-history' && 'Log Riwayat Kehadiran Pribadi'}
              {activeMenu === 'employee-grid' && (selectedEmployeeId ? 'Detail Lengkap Pegawai' : 'Data Master Pegawai (Grid 3x3)')}
              {activeMenu === 'employee-history' && 'Monitoring Riwayat Kehadiran Seluruh Perusahaan'}
            </h2>
            <p>
              Dexa Group Skill Test Enterprise Architecture • Logged in as <strong>{currentUser.email}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              background: '#f1f5f9',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
            }}>
              ID Pegawai: {currentUser.employeeId ? currentUser.employeeId.slice(0, 8) + '...' : '-'}
            </span>
          </div>
        </header>

        {/* Content Body */}
        <div className="content-body">
          {/* SUBMENU 1A: ATTENDANCE KEHADIRAN (MFE Attendance) */}
          {activeMenu === 'attendance-checkin' && (
            <AttendanceCheckIn user={currentUser} />
          )}

          {/* SUBMENU 1B: ATTENDANCE RIWAYAT PRIBADI (MFE Attendance) */}
          {activeMenu === 'attendance-history' && (
            <PersonalAttendanceHistory user={currentUser} />
          )}

          {/* SUBMENU 2A: MASTER DATA KARYAWAN (MFE Employee - HRD Only) */}
          {isHRD && activeMenu === 'employee-grid' && !selectedEmployeeId && (
            <EmployeeMasterGrid
              onSelectEmployee={(id) => setSelectedEmployeeId(id)}
              onAddNew={() => { setEmployeeToEdit(null); setShowEmployeeModal(true); }}
            />
          )}

          {/* SUBMENU 2A-DETAIL: DETAIL PEGAWAI (MFE Employee - HRD Only) */}
          {isHRD && activeMenu === 'employee-grid' && selectedEmployeeId && (
            <EmployeeDetail
              employeeId={selectedEmployeeId}
              onBack={() => setSelectedEmployeeId(null)}
              onEdit={(emp) => { setEmployeeToEdit(emp); setShowEmployeeModal(true); }}
            />
          )}

          {/* SUBMENU 2B: RIWAYAT KEHADIRAN PERUSAHAAN (MFE Employee - HRD Only) */}
          {isHRD && activeMenu === 'employee-history' && (
            <CompanyAttendanceHistory />
          )}
        </div>
      </main>

      {/* Modal Tambah / Edit Karyawan */}
      {showEmployeeModal && (
        <EmployeeFormModal
          isOpen={showEmployeeModal}
          onClose={() => setShowEmployeeModal(false)}
          employeeToEdit={employeeToEdit}
          onSuccess={() => {
            setShowEmployeeModal(false);
            setSelectedEmployeeId(null);
            setActiveMenu('employee-grid');
          }}
        />
      )}
    </div>
  );
}
