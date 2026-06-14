const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BASE_DIR = 'public/images';
const MAX_WIDTH = 800;
const QUALITY = 75;

async function comprimir() {
  let totalOriginal = 0, totalNovo = 0, arquivos = 0;
  
  for (const raiz of fs.readdirSync(BASE_DIR)) {
    const pasta = path.join(BASE_DIR, raiz);
    if (!fs.statSync(pasta).isDirectory()) continue;
    
    for (const arquivo of fs.readdirSync(pasta)) {
      if (!/\.(jpg|jpeg|png|webp)$/i.test(arquivo)) continue;
      
      const caminho = path.join(pasta, arquivo);
      const original = fs.statSync(caminho).size;
      totalOriginal += original;
      
      try {
        let img = sharp(caminho).resize(MAX_WIDTH, null, { withoutEnlargement: true }).jpeg({ quality: QUALITY, mozjpeg: true });
        await img.toFile(caminho + '.tmp');
        fs.renameSync(caminho + '.tmp', caminho);
        
        const novo = fs.statSync(caminho).size;
        totalNovo += novo;
        arquivos++;
        console.log(`✓ ${caminho}: ${(original/1024).toFixed(0)}KB → ${(novo/1024).toFixed(0)}KB`);
      } catch(e) {
        console.log(`✗ ERRO: ${caminho} - ${e.message}`);
      }
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Arquivos: ${arquivos}`);
  console.log(`Original: ${(totalOriginal/1024/1024).toFixed(1)} MB`);
  console.log(`Final: ${(totalNovo/1024/1024).toFixed(1)} MB`);
  console.log(`Economia: ${((1-totalNovo/totalOriginal)*100).toFixed(0)}%`);
  console.log(`${'='.repeat(50)}`);
}

comprimir();
