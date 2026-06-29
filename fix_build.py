import os
import re

BASE = "components/memorial/steps"

# ============ 1. Corrigir assinatura quebrada (5 arquivos) ============
ASSINATURA_FILES = [
    "Step07dSimbolica.jsx",
    "Step32PadrinhosCriancas.jsx",
    "StepA15TradicaoFamiliar.jsx",
    "StepB16DefiniramEntrada.jsx",
    "StepE9DocumentacaoEstrangeiro.jsx",
]

for fname in ASSINATURA_FILES:
    path = os.path.join(BASE, fname)
    if not os.path.exists(path):
        print(f"⚠️  Não encontrado: {path}")
        continue

    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    fixed = False
    while i < len(lines):
        line = lines[i]
        # Detecta: export default function Nome({
        if 'export default function' in line and line.rstrip().endswith('({'):
            # Verifica se as próximas 2 linhas são o padrão quebrado
            if (i + 2 < len(lines) and
                'const perfil = estadoAtual?.perfilCasal' in lines[i+1] and
                'const termos = getTermos(perfil); onSelect, estadoAtual }) {' in lines[i+2]):

                # Extrai nome da função
                match = re.search(r'export default function (\w+)', line)
                func_name = match.group(1) if match else 'Unknown'

                # Corrige a assinatura
                new_lines.append(f'export default function {func_name}({{ onSelect, estadoAtual }}) {{\n')
                # Mantém const perfil
                new_lines.append(lines[i+1])
                # Corrige const termos (remove o lixo da assinatura)
                new_lines.append('  const termos = getTermos(perfil);\n')
                i += 3
                fixed = True
                continue
        new_lines.append(line)
        i += 1

    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    status = "✅ Corrigido" if fixed else "⏭️  Sem alteração"
    print(f"{status}: {fname}")

# ============ 2. Corrigir \n literal no header (2 arquivos) ============
HEADER_FILES = [
    "Step00Casal.jsx",
    "Step01Modo.jsx",
]

for fname in HEADER_FILES:
    path = os.path.join(BASE, fname)
    if not os.path.exists(path):
        print(f"⚠️  Não encontrado: {path}")
        continue

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove \n literal que aparece após */ no header
    # Padrão: " */ */\n" ou " */\n" literal
    new_content = content.replace(' */\\n', ' */')
    # Também trata caso tenha espaço antes: " */\n" -> " */"
    new_content = new_content.replace(' */\\n', ' */')

    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ Corrigido header: {fname}")
    else:
        print(f"⏭️  Header OK: {fname}")

print("\n🎉 Script concluído. Rode 'npm run build' para verificar.")
PYEOF

python3 /tmp/fix_build.py