const fs = require('fs');

const path = './public/manifest.json';
const content = fs.readFileSync(path, 'utf8');

const fixed = content
  .replace(/"src": "\/icons\//g, '"src": "/descomplicai/icons/')
  .replace(/"start_url": "\/"/g, '"start_url": "/descomplicai/"')
  .replace(/"scope": "\/"/g, '"scope": "/descomplicai/"');

fs.writeFileSync(path, fixed);
console.log('manifest.json corrigido');