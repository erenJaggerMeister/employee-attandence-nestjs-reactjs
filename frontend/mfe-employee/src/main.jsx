import React from 'react';
import ReactDOM from 'react-dom/client';
import EmployeeMasterGrid from './components/EmployeeMasterGrid';
import EmployeeDetail from './components/EmployeeDetail';
import EmployeeFormModal from './components/EmployeeFormModal';
import CompanyAttendanceHistory from './components/CompanyAttendanceHistory';
import '../../shared/styles.css';

function StandaloneEmployeeApp() {
  const [tab, setTab] = React.useState('grid');
  const [selectedId, setSelectedId] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editData, setEditData] = React.useState(null);

  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: 20 }}>
      <header style={{ marginBottom: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a8a' }}>MFE Employee Master (Port 3002)</h1>
        <p style={{ color: '#64748b' }}>Micro Frontend Remote Domain: Katalog Pegawai & Laporan Absensi Perusahaan</p>
      </header>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
        <button onClick={() => { setTab('grid'); setSelectedId(null); }} className={`btn ${tab === 'grid' ? 'btn-primary' : 'btn-outline'}`}>
          Katalog Pegawai (Grid 3x3)
        </button>
        <button onClick={() => setTab('company-history')} className={`btn ${tab === 'company-history' ? 'btn-primary' : 'btn-outline'}`}>
          Riwayat Absensi Perusahaan & Export Excel
        </button>
      </div>

      {tab === 'grid' && !selectedId && (
        <EmployeeMasterGrid
          onSelectEmployee={(id) => setSelectedId(id)}
          onAddNew={() => { setEditData(null); setShowModal(true); }}
        />
      )}

      {tab === 'grid' && selectedId && (
        <EmployeeDetail
          employeeId={selectedId}
          onBack={() => setSelectedId(null)}
          onEdit={(emp) => { setEditData(emp); setShowModal(true); }}
        />
      )}

      {tab === 'company-history' && <CompanyAttendanceHistory />}

      {showModal && (
        <EmployeeFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          employeeToEdit={editData}
          onSuccess={() => { setShowModal(false); setSelectedId(null); }}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StandaloneEmployeeApp />
  </React.StrictMode>
);
