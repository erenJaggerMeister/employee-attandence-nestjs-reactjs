import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../shared/api';
import { Camera, CheckCircle, Clock, AlertCircle, LogOut, RefreshCw } from 'lucide-react';

export default function AttendanceCheckIn({ user, onStatusChange }) {
  const [attendanceState, setAttendanceState] = useState(null); // 'NOT_CHECKED_IN', 'WORKING', 'CHECKED_OUT'
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [wantToCheckout, setWantToCheckout] = useState(false);
  const [liveDuration, setLiveDuration] = useState('00:00:00');
  const [notification, setNotification] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // Inisialisasi status kehadiran hari ini
  useEffect(() => {
    loadTodayStatus();
    return () => {
      stopCamera();
    };
  }, []);

  const loadTodayStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getTodayStatus();
      setTodayData(res);
      if (!res.hasCheckedIn) {
        setAttendanceState('NOT_CHECKED_IN');
        startCamera();
      } else if (res.isWorking) {
        setAttendanceState('WORKING');
        stopCamera();
      } else if (res.hasCheckedOut) {
        setAttendanceState('CHECKED_OUT');
        stopCamera();
      }
    } catch (err) {
      console.error('Failed to load status:', err);
      setNotification({ type: 'error', text: 'Gagal memuat status kehadiran hari ini' });
    } finally {
      setLoading(false);
    }
  };

  // Timer live berjalan jika sedang bekerja
  useEffect(() => {
    let interval = null;
    if (attendanceState === 'WORKING' && todayData && todayData.checkInTime) {
      const startTime = new Date(todayData.checkInTime).getTime();

      const updateCounter = () => {
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
        const hrs = String(Math.floor(diffSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((diffSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(diffSeconds % 60).padStart(2, '0');
        setLiveDuration(`${hrs}:${mins}:${secs}`);
      };

      updateCounter();
      interval = setInterval(updateCounter, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [attendanceState, todayData]);

  // Manajemen Kamera Webcam
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        stopCamera();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera stream error:', err);
      setCameraActive(false);
      setCameraError('Kamera tidak aktif atau izin akses ditolak. Harap izinkan akses kamera agar tombol Hadir dapat dibuka.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Snapshot Foto Base64 dari Webcam
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 640, 480);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Aksi 1: Klik 'Hadir'
  const handleCheckIn = async () => {
    if (!cameraActive) {
      alert('Kamera belum aktif!');
      return;
    }
    try {
      setActionLoading(true);
      const photoBase64 = captureSnapshot();
      if (!photoBase64) {
        throw new Error('Gagal mengambil snapshot kamera');
      }

      await api.checkIn(photoBase64);
      stopCamera();
      setNotification({ type: 'success', text: 'Absensi Hadir berhasil dicatat ke database!' });
      await loadTodayStatus();
      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Gagal melakukan check-in',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Aksi 2: Klik 'Sedang Bekerja' untuk mau pulang
  const handleWantToLeave = () => {
    setWantToCheckout(true);
    startCamera();
  };

  // Aksi 3: Klik 'Keluar'
  const handleCheckOut = async () => {
    if (!cameraActive) {
      alert('Kamera belum aktif!');
      return;
    }
    try {
      setActionLoading(true);
      const photoBase64 = captureSnapshot();
      if (!photoBase64) {
        throw new Error('Gagal mengambil snapshot kamera');
      }

      await api.checkOut(photoBase64);
      stopCamera();
      setWantToCheckout(false);
      setNotification({ type: 'success', text: 'Absensi Keluar berhasil! Selamat beristirahat.' });
      await loadTodayStatus();
      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        text: err.response?.data?.message || 'Gagal melakukan check-out',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <RefreshCw className="animate-spin" size={32} style={{ color: '#2563eb' }} />
        <p style={{ marginTop: 12, color: '#64748b' }}>Memuat status kehadiran...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Banner Notifikasi */}
      {notification && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 8,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: notification.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: notification.type === 'error' ? '#991b1b' : '#166534',
          border: `1px solid ${notification.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
        }}>
          {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>{notification.text}</span>
        </div>
      )}

      {/* Hidden Canvas untuk Capture Snapshot Base64 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* KONDISI 1: BELUM ABSEN MASUK */}
      {attendanceState === 'NOT_CHECKED_IN' && (
        <div className="webcam-card">
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Pencatatan Kehadiran Masuk</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Kamera akan mengambil foto bukti kehadiran Anda secara otomatis saat tombol 'Hadir' ditekan.
            </p>
          </div>

          {/* Frame Video Kamera */}
          <div className="video-frame">
            <video ref={videoRef} autoPlay playsInline muted className="video-element" />
            <div className="camera-status-indicator">
              <span className={`dot ${cameraActive ? 'dot-green' : 'dot-red'}`} />
              {cameraActive ? 'Kamera Aktif & Siap' : 'Kamera Terputus / Non-aktif'}
            </div>
          </div>

          {/* Peringatan jika kamera bermasalah */}
          {cameraError && (
            <div style={{
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '10px 14px',
              borderRadius: 6,
              fontSize: 12.5,
              marginBottom: 16,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <AlertCircle size={18} />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Tombol Hadir dengan VALIDASI MUTLAK: disabled jika kamera mati */}
          <button
            onClick={handleCheckIn}
            disabled={!cameraActive || actionLoading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
          >
            {actionLoading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                <span>Menyimpan Foto ke Database...</span>
              </>
            ) : (
              <>
                <Camera size={20} />
                <span>Hadir</span>
              </>
            )}
          </button>

          {!cameraActive && (
            <button
              onClick={startCamera}
              className="btn btn-outline"
              style={{ marginTop: 12, width: '100%' }}
            >
              <RefreshCw size={16} /> Coba Hubungkan Kamera Ulang
            </button>
          )}
        </div>
      )}

      {/* KONDISI 2: SEDANG BEKERJA (Live Duration Running) */}
      {attendanceState === 'WORKING' && !wantToCheckout && (
        <div style={{ textAlign: 'center' }}>
          <div className="live-timer-box">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
              <Clock size={16} />
              STATUS: SEDANG BEKERJA
            </div>

            <div className="timer-digits">{liveDuration}</div>

            <p style={{ fontSize: 13, opacity: 0.9 }}>
              Jam Masuk: {todayData?.record?.checkInTime ? new Date(todayData.record.checkInTime).toLocaleTimeString('id-ID') : '-'} WIB
            </p>
          </div>

          <div className="webcam-card" style={{ marginTop: 20 }}>
            <p style={{ fontSize: 13.5, color: '#475569', marginBottom: 16 }}>
              Kamera saat ini otomatis <strong>OFF</strong>. Saat Anda ingin pulang, silakan klik tombol status di bawah untuk mengaktifkan kamera kembali.
            </p>

            <button
              onClick={handleWantToLeave}
              className="btn btn-success btn-lg"
              style={{ width: '100%' }}
            >
              <Clock size={20} />
              <span>Sedang Bekerja (Klik untuk Pulang)</span>
            </button>
          </div>
        </div>
      )}

      {/* KONDISI 2B: SEDANG BEKERJA -> Mau Pulang (Kamera Aktif kembali, tombol 'Keluar') */}
      {attendanceState === 'WORKING' && wantToCheckout && (
        <div className="webcam-card">
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Konfirmasi Absensi Keluar (Pulang)</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Kamera aktif kembali untuk mengambil snapshot kepulangan Anda.
            </p>
          </div>

          <div className="video-frame">
            <video ref={videoRef} autoPlay playsInline muted className="video-element" />
            <div className="camera-status-indicator">
              <span className={`dot ${cameraActive ? 'dot-green' : 'dot-red'}`} />
              {cameraActive ? 'Kamera Pulang Aktif' : 'Menghubungkan Kamera...'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => { setWantToCheckout(false); stopCamera(); }}
              className="btn btn-outline"
              style={{ flex: 1 }}
            >
              Batal
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!cameraActive || actionLoading}
              className="btn btn-danger btn-lg"
              style={{ flex: 2 }}
            >
              {actionLoading ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  <span>Menyimpan Bukti Keluar...</span>
                </>
              ) : (
                <>
                  <LogOut size={20} />
                  <span>Keluar</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* KONDISI 3: TELAH PULANG (Selesai Hari Ini) */}
      {attendanceState === 'CHECKED_OUT' && (
        <div className="webcam-card" style={{ padding: '40px 28px' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <CheckCircle size={36} />
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
            Status: Telah Pulang
          </h3>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
            Anda telah menyelesaikan absensi masuk dan keluar untuk hari ini.
          </p>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '16px 20px',
            textAlign: 'left',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            fontSize: 13,
          }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600 }}>JAM MASUK</span>
              <strong style={{ fontSize: 14 }}>
                {todayData?.record?.checkInTime ? new Date(todayData.record.checkInTime).toLocaleTimeString('id-ID') : '-'} WIB
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600 }}>JAM KELUAR</span>
              <strong style={{ fontSize: 14 }}>
                {todayData?.record?.checkOutTime ? new Date(todayData.record.checkOutTime).toLocaleTimeString('id-ID') : '-'} WIB
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600 }}>TOTAL DURASI KERJA</span>
              <strong style={{ fontSize: 14, color: '#059669' }}>
                {todayData?.workDurationFormatted || '-'}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
