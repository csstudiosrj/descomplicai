#!/bin/bash
set -e

# Baixa o ZIP
curl -L -o /tmp/expansao.zip "https://kimi-files.oss-cn-beijing.aliyuncs.com/sandbox/descomplicai-expansao-completo.zip"

# Descompacta
rm -rf /tmp/expansao && mkdir /tmp/expansao
unzip -q /tmp/expansao.zip -d /tmp/expansao

# Copia tudo pros lugares certos
cp /tmp/expansao/components/memorial/steps/*.jsx components/memorial/steps/
cp /tmp/expansao/utils/*.js utils/
cp /tmp/expansao/components/memorial/MemorialOrchestrator.jsx components/memorial/

# Apaga os 6 arquivos agrupados antigos (os q foram desmembrados)
rm -f components/memorial/steps/Step17Flores.jsx
rm -f components/memorial/steps/Step23Toalha.jsx
rm -f components/memorial/steps/Step30Entrada.jsx
rm -f components/memorial/steps/Step38Coquetel.jsx
rm -f components/memorial/steps/Step49Convites.jsx
rm -f components/memorial/steps/Step54Vestido.jsx

echo "✅ Pronto. Agora roda: npm run dev"