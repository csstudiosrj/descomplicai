#!/bin/bash
# limpar_raiz.sh — Limpa lixo da raiz com verificação de segurança

set -e
echo "=========================================="
echo "LIMPEZA DA RAIZ — MODO VERIFICAÇÃO"
echo "=========================================="

# 1. Verifica se steps na raiz existem também na pasta correta
echo ""
echo "🔍 Verificando steps JSX soltos na raiz..."
for step in StepB11ReservouTemplo.jsx StepB12DefiniuChupa.jsx StepB13EscolheuCelebrante.jsx StepB14AgendouCartorio.jsx StepB15PadrinhosEscolhidos.jsx StepB16DefiniramEntrada.jsx StepB17MusicosCerimonia.jsx StepB18CertidaoBatismo.jsx; do
  if [ -f "components/memorial/steps/$step" ]; then
    echo "   ✅ $step existe em components/memorial/steps/ — pode deletar da raiz"
  else
    echo "   ⚠️  $step NÃO existe em components/memorial/steps/ — MANTER na raiz!"
  fi
done

# 2. Lista o que vai ser deletado
echo ""
echo "🗑️  ITENS QUE SERÃO DELETADOS:"
echo "   • correcoes-admin.zip"
echo "   • fix-login-admin-css.zip"
echo "   • next.config.mjs.BAK"
echo "   • fix-manifest.js"
echo "   • fix-schema.js"
echo "   • instalar.sh"
echo "   • install.sh"
echo "   • auditoria_raiz.sh"
echo "   • memorial_fix_o/ (pasta temporária)"
echo "   • Steps JSX da raiz (se confirmado acima)"

echo ""
read -p "Quer ver o comando de deleção? (s/n) " resp
if [ "$resp" = "s" ]; then
  echo ""
  echo "Comando para copiar e colar:"
  echo ""
  echo "rm -rf memorial_fix_o \\"
  echo "  correcoes-admin.zip \\"
  echo "  fix-login-admin-css.zip \\"
  echo "  next.config.mjs.BAK \\"
  echo "  fix-manifest.js \\"
  echo "  fix-schema.js \\"
  echo "  instalar.sh \\"
  echo "  install.sh \\"
  echo "  auditoria_raiz.sh \\"
  echo "  StepB11ReservouTemplo.jsx \\"
  echo "  StepB12DefiniuChupa.jsx \\"
  echo "  StepB13EscolheuCelebrante.jsx \\"
  echo "  StepB14AgendouCartorio.jsx \\"
  echo "  StepB15PadrinhosEscolhidos.jsx \\"
  echo "  StepB16DefiniramEntrada.jsx \\"
  echo "  StepB17MusicosCerimonia.jsx \\"
  echo "  StepB18CertidaoBatismo.jsx"
fi