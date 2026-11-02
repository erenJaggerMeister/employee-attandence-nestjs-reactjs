const { spawn } = require('child_process');
const path = require('path');

const services = [
  // MSM Layer 2 (Port 6001 - 6007)
  { name: 'msm_user', dir: path.join(__dirname, 'msm_user') },
  { name: 'msm_employee', dir: path.join(__dirname, 'msm_employee') },
  { name: 'msm_attendance', dir: path.join(__dirname, 'msm_attendance') },
  { name: 'msm_role', dir: path.join(__dirname, 'msm_role') },
  { name: 'msm_jabatan', dir: path.join(__dirname, 'msm_jabatan') },
  { name: 'msm_status_work', dir: path.join(__dirname, 'msm_status_work') },
  { name: 'msm_status_employee', dir: path.join(__dirname, 'msm_status_employee') },
  // MSF Layer 1 (Port 5000 - 5002)
  { name: 'msf_auth', dir: path.join(__dirname, 'msf_auth') },
  { name: 'msf_employee', dir: path.join(__dirname, 'msf_employee') },
  { name: 'msf_attendance', dir: path.join(__dirname, 'msf_attendance') },
];

console.log('=== MEMULAI SEMUA 10 MICROSERVICE BACKEND DEXA GROUP ===');

services.forEach(svc => {
  const child = spawn(process.execPath, ['main.js'], {
    cwd: svc.dir,
    env: { ...process.env, NODE_PATH: path.join(__dirname, 'node_modules') },
    stdio: 'inherit',
  });

  child.on('error', err => {
    console.error(`[${svc.name}] Gagal start:`, err);
  });

  child.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.warn(`[${svc.name}] Berhenti dengan kode: ${code}`);
    }
  });
});
