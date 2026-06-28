const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ZIP = 'descomplica-correcoes.zip';
if (!fs.existsSync(ZIP)) { console.error('ERRO:', ZIP, 'nao encontrado'); process.exit(1); }

const B = '.bkp-correcoes-' + Math.floor(Date.now()/1000);
fs.mkdirSync(B, {recursive: true});
['components/ui/Header.jsx','components/ui/Footer.jsx','utils/linguagemCasal.js'].forEach(f => {
  if (fs.existsSync(f)) fs.copyFileSync(f, path.join(B, path.basename(f)));
});
console.log('BKP:', B);

execSync('unzip -o "' + ZIP + '" -d /tmp/dc-correcoes', {stdio:'inherit'});

const map = {
  'Header.jsx': 'components/ui/Header.jsx',
  'Footer.jsx': 'components/ui/Footer.jsx',
  'linguagemCasal.js': 'utils/linguagemCasal.js',
};

for (const [src, dst] of Object.entries(map)) {
  const srcPath = path.join('/tmp/dc-correcoes', src);
  const dstPath = path.join('.', dst);
  fs.mkdirSync(path.dirname(dstPath), {recursive: true});
  fs.copyFileSync(srcPath, dstPath);
  console.log('OK:', dst);
}

execSync('rm -rf /tmp/dc-correcoes');
console.log('\ngit add . && git commit -m "fix: remove Planos header + corrige termos linguagem" && git push');
