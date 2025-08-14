import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resourcesDir = path.join(__dirname, '..', 'resources', 'git');

const platform = os.platform(); 
const arch = os.arch(); 

function download(url, dest) {
  console.log(`Downloading Git from ${url}...`);
  execSync(`curl -L "${url}" -o "${dest}"`);
}

function extract(archive, dest) {
  if (archive.endsWith('.zip')) {
    execSync(`unzip -o "${archive}" -d "${dest}"`);
  } else if (archive.endsWith('.tar.gz')) {
    execSync(`tar -xzf "${archive}" -C "${dest}"`);
  }
}

function setupGit() {
  const targetDir = path.join(resourcesDir, `${platform}-${arch}`, 'bin');
  fs.mkdirSync(targetDir, { recursive: true });

  if (platform === 'win32') {
    const url = 'https://github.com/git-for-windows/git/releases/download/v2.45.2.windows.1/PortableGit-2.45.2-64-bit.zip';
    const zipPath = path.join(os.tmpdir(), 'git.zip');
    download(url, zipPath);
    extract(zipPath, targetDir);
  } 
  else if (platform === 'linux') {
    const url = 'https://github.com/shiftkey/desktop/releases/download/release-3.3.4-linux1/git-2.40.1-linux.tar.gz'; // Example portable Linux Git
    const tarPath = path.join(os.tmpdir(), 'git.tar.gz');
    download(url, tarPath);
    extract(tarPath, targetDir);
  } 
  else if (platform === 'darwin') {
    const url = 'https://github.com/your-org/git-macos/releases/download/latest/git-macos.tar.gz'; 
    // You build & host this via GitHub Actions (Option 1 earlier)
    const tarPath = path.join(os.tmpdir(), 'git.tar.gz');
    download(url, tarPath);
    extract(tarPath, targetDir);
  }
  
  console.log(`Git setup complete for ${platform}-${arch}`);
}

setupGit();
