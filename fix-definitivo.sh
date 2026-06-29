cat > fix-definitivo.sh <<'SCRIPT'
#!/bin/bash
set -e
echo "▶️ Corrigindo todos os Step*.jsx..."

for arquivo in components/memorial/steps/Step*.jsx; do
  [ -f "$arquivo" ] || continue
  echo "Processando $arquivo..."

  # Corrige opcao. para o. ou op. conforme o callback
  if grep -q '\.map((o)' "$arquivo"; then
    sed -i 's/opcao\./o\./g' "$arquivo"
    sed -i 's/opcao,/'o,'/g' "$arquivo"
  elif grep -q '\.map((op)' "$arquivo"; then
    sed -i 's/opcao\./op\./g' "$arquivo"
    sed -i 's/opcao,/'op,'/g' "$arquivo"
  fi

  # Se usa termos. mas não tem getTermos, adiciona
  if grep -q 'termos\.' "$arquivo"; then
    if ! grep -q 'getTermos' "$arquivo"; then
      sed -i '1i import { getTermos } from "../../../utils/linguagemCasal";' "$arquivo"
      sed -i '/export default function/,/return/ {
        /return/! {
          /{/ {
            /const termos/! {
              s/^{/{\n  const perfil = estadoAtual?.perfilCasal || "nao-especificar";\n  const termos = getTermos(perfil);/
            }
          }
        }
      }' "$arquivo"
    fi
  fi
done

echo "✅ Correção concluída!"
SCRIPT

chmod +x fix-definitivo.sh
bash fix-definitivo.sh