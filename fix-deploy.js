const { execSync } = require('child_process');
const fs = require('fs');

const tempFiles = [
  'deploy.js',
  'descomplica-t8.zip',
  'descomplica-auth-pages.zip',
  'styles/t8-header-footer.css'
];

tempFiles.forEach(f => {
  if (fs.existsSync(f)) {
    fs.unlinkSync(f);
    console.log('Removido:', f);
  }
});

const dirs = fs.readdirSync('.');
dirs.forEach(d => {
  if (d.startsWith('.bkp-') || d.startsWith('.backup-')) {
    fs.rmSync(d, { recursive: true });
    console.log('Removido:', d);
  }
});

console.log('\nLimpando cache git...');
try { execSync('git rm -r --cached .bkp-* .backup-* deploy.js *.zip styles/t8-header-footer.css 2>/dev/null'); } catch(e) {}

console.log('\nFazendo commit de TUDO...');
execSync('git add -A && git commit -m "feat: T8 header dropdown + footer + landing page completo" && git push', { stdio: 'inherit' });
