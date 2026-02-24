const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting CodeAlpha Task-3 Website...');

function runCommand(command, args, cwd, name) {
    const proc = spawn(command, args, { cwd, shell: true });

    proc.stdout.on('data', (data) => {
        console.log(`[${name}] ${data.toString().trim()}`);
    });

    proc.stderr.on('data', (data) => {
        console.error(`[${name}] ERROR: ${data.toString().trim()}`);
    });

    proc.on('close', (code) => {
        console.log(`[${name}] Exited with code ${code}`);
    });

    return proc;
}

// 1. Start Backend
const serverDir = path.join(__dirname, 'server');
console.log('📂 Starting Backend Server...');
runCommand('node', ['index.js'], serverDir, 'Backend');

// 2. Start Frontend
const clientDir = path.join(__dirname, 'client');
console.log('📂 Starting Frontend Client (Vite)...');
runCommand('npm', ['run', 'dev'], clientDir, 'Frontend');

console.log('✨ All services are being started. Access the website at http://localhost:5173');
