const fs = require('fs');

const files = [
  'sentry.server.config.js',
  'sentry.edge.config.js', 
  'sentry.client.config.js',
  'pages/_error.jsx',
  'lib/errorLogger.js',
  'instrumentation.ts'
];

for (const file of files) {
  const path = `./${file}`;
  if (!fs.existsSync(path)) {
    console.log(`Nao encontrado: ${file}`);
    continue;
  }
  
  let content = fs.readFileSync(path, 'utf8');
  
  // Remove imports do Sentry
  content = content.replace(/import \* as Sentry from ["']@sentry\/nextjs["'];?\n?/g, '');
  
  // Remove chamadas Sentry.init
  content = content.replace(/Sentry\.init\(\{[\s\S]*?\}\);?\n?/g, '');
  
  // Remove Sentry.replayIntegration
  content = content.replace(/Sentry\.replayIntegration\(\{[\s\S]*?\}\),?\n?/g, '');
  
  // Remove Sentry.captureUnderscoreErrorException
  content = content.replace(/await Sentry\.captureUnderscoreErrorException\([^)]*\);?\n?/g, '');
  
  // Remove Sentry.withScope
  content = content.replace(/Sentry\.withScope\(\(scope\) => \{[\s\S]*?\}\);?\n?/g, '');
  
  // Remove Sentry.captureException
  content = content.replace(/Sentry\.captureException\([^)]*\);?\n?/g, '');
  
  // Remove Sentry.captureRequestError
  content = content.replace(/Sentry\.captureRequestError/g, '');
  
  // Remove console.warn do Sentry
  content = content.replace(/console\.warn\(\["']\[Sentry[^"]*["']\);?\n?/g, '');
  
  // Remove linhas vazias duplicadas
  content = content.replace(/\n{3,}/g, '\n\n');
  
  fs.writeFileSync(path, content);
  console.log(`Limpo: ${file}`);
}

// Deleta os arquivos de config do Sentry
const configFiles = ['sentry.server.config.js', 'sentry.edge.config.js', 'sentry.client.config.js'];
for (const file of configFiles) {
  const path = `./${file}`;
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
    console.log(`Deletado: ${file}`);
  }
}

console.log('Sentry removido.');