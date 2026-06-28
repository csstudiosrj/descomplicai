const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ZIP = 'descomplica-final.zip';
if (!fs.existsSync(ZIP)) { console.error('ERRO:', ZIP, 'nao encontrado'); process.exit(1); }

const B = '.bkp-final-' + Math.floor(Date.now()/1000);
fs.mkdirSync(B, {recursive: true});
['components/ui/Header.jsx','components/ui/Footer.jsx','components/layout/MainLayout.jsx','styles/globals.css'].forEach(f => {
  if (fs.existsSync(f)) fs.copyFileSync(f, path.join(B, path.basename(f)));
});
console.log('BKP:', B);

execSync('unzip -o "' + ZIP + '" -d /tmp/dc-final', {stdio:'inherit'});

const map = {
  'components/ui/Header.jsx': 'components/ui/Header.jsx',
  'components/ui/Footer.jsx': 'components/ui/Footer.jsx',
  'components/layout/MainLayout.jsx': 'components/layout/MainLayout.jsx',
  'styles/globals.css': 'styles/globals.css',
};

for (const [src, dst] of Object.entries(map)) {
  const srcPath = path.join('/tmp/dc-final', src);
  const dstPath = path.join('.', dst);
  fs.mkdirSync(path.dirname(dstPath), {recursive: true});
  fs.copyFileSync(srcPath, dstPath);
  console.log('OK:', dst);
}

execSync('rm -rf /tmp/dc-final');

console.log('\nFazendo commit...');
execSync('git add -A && git commit -m "fix: header border + footer visivel + padding main" && git push', {stdio:'inherit'});
