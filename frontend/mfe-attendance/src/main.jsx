import React from 'react';
import ReactDOM from 'react-dom/client';
import AttendanceCheckIn from './components/AttendanceCheckIn';
import PersonalAttendanceHistory from './components/PersonalAttendanceHistory';
import '../../shared/styles.css';

const dummyUser = {
  id: 'b2f6c0a1-4321-4fba-8e9a-9876543210fe',
  nama: 'Ahmad Fauzi (Standalone MFE Attendance)',
  email: 'ahmad.fauzi@dexagroup.com',
  role: 'EMPLOYEE',
};

function StandaloneAttendanceApp() {
  const [tab, setTab] = React.useState('checkin');
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 20 }}>
      <header style={{ marginBottom: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a8a' }}>MFE Attendance (Port 3001)</h1>
        <p style={{ color: '#64748b' }}>Micro Frontend Remote Domain: Presensi & Riwayat Kehadiran</p>
      </header>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
        <button onClick={() => setTab('checkin')} className={`btn ${tab === 'checkin' ? 'btn-primary' : 'btn-outline'}`}>
          Kehadiran Masuk / Keluar
        </button>
        <button onClick={() => setTab('history')} className={`btn ${tab === 'history' ? 'btn-primary' : 'btn-outline'}`}>
          Riwayat Absensi Pribadi
        </button>
      </div>
      {tab === 'checkin' ? <AttendanceCheckIn user={dummyUser} /> : <PersonalAttendanceHistory user={dummyUser} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StandaloneAttendanceApp />
  </React.StrictMode>
);
