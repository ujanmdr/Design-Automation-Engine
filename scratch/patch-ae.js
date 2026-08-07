const fs = require('fs');
const path = require('path');

const patchedContent = require(path.join(process.cwd(), 'node_modules', '@nexrender', 'core', 'src', 'assets', 'commandLineRenderer-2022.jsx'));
const target = 'C:/Program Files/Adobe/Adobe After Effects 2023/Support Files/Scripts/Startup/commandLineRenderer.jsx';
const backupDir = 'C:/Program Files/Adobe/Adobe After Effects 2023/Support Files/Backup.Scripts/Startup';
const backupFile = path.join(backupDir, 'commandLineRenderer.jsx');

try {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  if (!fs.existsSync(backupFile) && fs.existsSync(target)) {
    fs.copyFileSync(target, backupFile);
  }
  fs.writeFileSync(target, patchedContent, 'utf8');
  console.log('SUCCESS: Patched commandLineRenderer.jsx in After Effects 2023!');
} catch (err) {
  console.error('FAILED to patch:', err);
}
