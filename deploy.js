const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ZIP = 'descomplica-auth-pages.zip';
if (!fs.existsSync(ZIP)) { console.error('ERRO:', ZIP, 'nao encontrado'); process.exit(1); }

const B = '.bkp-' + Math.floor(Date.now()/1000);
fs.mkdirSync(B, {recursive: true});
['pages/index.js','pages/login.jsx','pages/cerimonialista/cadastro.jsx'].forEach(f => {
  if (fs.existsSync(f)) fs.copyFileSync(f, path.join(B, path.basename(f)));
});
console.log('BKP:', B);

execSync('unzip -o "' + ZIP + '" -d /tmp/dc-auth', {stdio:'inherit'});

const map = {
  'pages/index.js': 'pages/index.js',
  'pages/login.jsx': 'pages/login.jsx',
  'pages/cerimonialista/login.jsx': 'pages/cerimonialista/login.jsx',
  'pages/cerimonialista/cadastro.jsx': 'pages/cerimonialista/cadastro.jsx',
  'pages/fornecedor/login.jsx': 'pages/fornecedor/login.jsx',
  'pages/fornecedor/cadastro.jsx': 'pages/fornecedor/cadastro.jsx',
  'pages/api/fornecedor/cadastro.js': 'pages/api/fornecedor/cadastro.js',
};

for (const [src, dst] of Object.entries(map)) {
  const srcPath = path.join('/tmp/dc-auth', src);
  const dstPath = path.join('.', dst);
  fs.mkdirSync(path.dirname(dstPath), {recursive: true});
  fs.copyFileSync(srcPath, dstPath);
  console.log('OK:', dst);
}

execSync('rm -rf /tmp/dc-auth');
console.log('\nSQL Supabase > sql/criar_fornecedores_plataforma.sql');
console.log('git add . && git commit -m "feat: auth" && git push');
