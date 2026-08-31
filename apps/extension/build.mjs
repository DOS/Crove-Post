import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { build } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, 'dist');
const zipFile = path.resolve(__dirname, 'extension.zip');

console.log('1. Cleaning dist directory and old zip...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
if (fs.existsSync(zipFile)) {
  fs.rmSync(zipFile, { force: true });
}

console.log('2. Running Vite build...');
await build();

console.log('3. Copying manifest.json and static assets...');
const manifestSrc = path.resolve(__dirname, 'manifest.json');
const manifestDest = path.resolve(distDir, 'manifest.json');
if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, manifestDest);
}

// Copy public assets if directory exists
const publicDir = path.resolve(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true });
}

console.log('4. Creating extension.zip...');
try {
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Compress-Archive -Path '${distDir}/*' -DestinationPath '${zipFile}' -Force"`, {
      stdio: 'inherit',
    });
  } else {
    execSync(`cd "${distDir}" && zip -r "${zipFile}" .`, {
      stdio: 'inherit',
    });
  }
  console.log('✅ Extension zip archive created:', zipFile);
} catch (e) {
  console.warn('Warning: Could not create zip archive:', e.message);
}

console.log('✅ Extension build completed successfully in', distDir);
