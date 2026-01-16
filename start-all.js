import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const serverDir = path.join(rootDir, 'server');
const mobileDir = path.join(rootDir, 'vini-mobile');

const colors = {
    backend: '\x1b[34m', // Blue
    frontend: '\x1b[32m', // Green
    mobile: '\x1b[35m', // Magenta
    reset: '\x1b[0m'
};

function startProcess(name, command, args, cwd, color) {
    console.log(`${color}[${name}] Starting...${colors.reset}`);

    const proc = spawn(command, args, {
        cwd: cwd,
        shell: true,
        stdio: 'pipe'
    });

    proc.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                console.log(`${color}[${name}] ${line.trim()}${colors.reset}`);
            }
        });
    });

    proc.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                console.error(`${color}[${name}] ERROR: ${line.trim()}${colors.reset}`);
            }
        });
    });

    proc.on('close', (code) => {
        console.log(`${color}[${name}] Exited with code ${code}${colors.reset}`);
    });

    return proc;
}

// Start Backend
startProcess('Backend', 'npm', ['run', 'dev'], serverDir, colors.backend);

// Start Frontend
startProcess('Frontend', 'npm', ['run', 'dev'], rootDir, colors.frontend);

// Start Mobile
startProcess('Mobile', 'npm', ['start'], mobileDir, colors.mobile);

console.log('All servers starting...');
console.log('Press Ctrl+C to stop all servers.');
