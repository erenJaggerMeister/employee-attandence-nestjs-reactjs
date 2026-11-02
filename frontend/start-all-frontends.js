const { spawn } = require('child_process');
const path = require('path');

const apps = [
  { name: 'host-shell', port: 3000, dir: path.join(__dirname, 'host-shell') },
  { name: 'mfe-attendance', port: 3001, dir: path.join(__dirname, 'mfe-attendance') },
  { name: 'mfe-employee', port: 3002, dir: path.join(__dirname, 'mfe-employee') },
];

console.log('=== MEMULAI SEMUA 3 MICRO FRONTEND (MFE) DEXA GROUP ===');

apps.forEach(app => {
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const child = spawn(npxCmd, ['vite', '--host', '127.0.0.1', '--port', String(app.port)], {
    cwd: app.dir,
    env: { ...process.env, NODE_PATH: path.join(__dirname, 'node_modules') },
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', err => {
    console.error(`[${app.name}] Error:`, err);
  });
});
