const fs = require('fs');
const { execSync } = require('child_process');

const ZIP = 'descomplica-fix.zip';
if (!fs.existsSync(ZIP)) { console.error('ERRO:', ZIP, 'nao encontrado'); process.exit(1); }

const B = '.bkp-fix-' + Math.floor(Date.now()/1000);
fs.mkdirSync(B, {recursive: true});
if (fs.existsSync('styles/globals.css')) fs.copyFileSync('styles/globals.css', B + '/globals.css');
console.log('BKP:', B);

execSync('unzip -o "' + ZIP + '" -d /tmp/dc-fix', {stdio:'inherit'});

fs.copyFileSync('/tmp/dc-fix/styles/globals.css', 'styles/globals.css');
console.log('OK: styles/globals.css');

execSync('rm -rf /tmp/dc-fix');

console.log('\nFazendo commit...');
execSync('git add -A && git commit -m "fix: main-content padding + footer visivel" && git push', {stdio:'inherit'});
