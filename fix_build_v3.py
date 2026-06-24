#!/usr/bin/env python3
import os
import re

STEPS = [
  "components/memorial/steps/Step18Iluminacao.jsx",
  "components/memorial/steps/Step19Velas.jsx",
  "components/memorial/steps/Step20Mobiliario.jsx",
  "components/memorial/steps/Step21Backdrop.jsx",
  "components/memorial/steps/Step22Tecidos.jsx",
  "components/memorial/steps/Step24Loucas.jsx",
  "components/memorial/steps/Step25Talheres.jsx",
  "components/memorial/steps/Step26Tacas.jsx",
  "components/memorial/steps/Step27CentroMesa.jsx",
  "components/memorial/steps/Step28Guardanapo.jsx",
  "components/memorial/steps/Step29CartaoLugar.jsx",
  "components/memorial/steps/Step31MusicaCerimonia.jsx",
  "components/memorial/steps/Step32PadrinhosCriancas.jsx",
  "components/memorial/steps/Step33RituaisSaida.jsx",
  "components/memorial/steps/Step39BoloDocesBar.jsx",
  "components/memorial/steps/Step40MusicaEntretenimento.jsx",
  "components/memorial/steps/Step50IdentidadeVisual.jsx",
  "components/memorial/steps/Step55BelezaPadronizacao.jsx",
  "components/memorial/steps/StepA4Criancas.jsx",
  "components/memorial/steps/StepA6DataPrevista.jsx",
  "components/memorial/steps/StepB5CriancasCerimonia.jsx",
  "components/memorial/steps/StepB6DuracaoCerimonia.jsx",
  "components/memorial/steps/StepB7MusicaCerimoniaViva.jsx",
  "components/memorial/steps/StepC4Estacionamento.jsx",
  "components/memorial/steps/StepC5CozinhaApoio.jsx",
  "components/memorial/steps/StepC6CapacidadeLocal.jsx",
  "components/memorial/steps/StepC7GeradorLocal.jsx",
  "components/memorial/steps/StepG10MenuInfantil.jsx",
  "components/memorial/steps/StepG8MesaFrios.jsx",
  "components/memorial/steps/StepG9BebidasPorPessoa.jsx",
  "components/memorial/steps/StepH3FogosSparklers.jsx",
  "components/memorial/steps/StepH4MesaDocesExposta.jsx",
  "components/memorial/steps/StepH5AulaDanca.jsx",
  "components/memorial/steps/StepI4AulasDanca.jsx",
  "components/memorial/steps/StepI5MudancaLook.jsx",
  "components/memorial/steps/StepI6QuantasMadrinhas.jsx",
  "components/memorial/steps/StepL1Aliancas.jsx",
  "components/memorial/steps/StepL2CivilJunto.jsx",
  "components/memorial/steps/StepL3TransporteEspecialNoivos.jsx",
  "components/memorial/steps/StepL4CarroNoivos.jsx",
  "components/memorial/steps/StepL5TransporteConvidados.jsx",
  "components/memorial/steps/StepL6Seguranca.jsx",
  "components/memorial/steps/StepM1LuaDeMel.jsx",
  "components/memorial/steps/StepM2FotosLuaDeMel.jsx",
]

def fix_v3(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content

    # Fix 1: style={ seguido de espaco (inline) → style={{
    content = re.sub(r'style=\{\s(?!\{)', 'style={{ ', content)

    # Fix 2: style={\n (multilinha) → style={{\n
    content = re.sub(r'style=\{\n', 'style={{\n', content)

    # Fix 3: } sozinho em uma linha, seguido de /> na proxima → }} antes do />
    # Pega: linha com } (com indentacao), newline, linha com />
    content = re.sub(
        r'^(\s*)\}(\s*\n\s*/>)',
        r'\1}}\2',
        content,
        flags=re.MULTILINE
    )

    # Fix 4: }> inline (quando style fecha na mesma linha da tag)
    content = re.sub(
        r"(\'[^\']+\'|\d+px|var\(--[^)]+\)|\d+\s*%)\s*\}>",
        r"\1 }}>",
        content
    )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

print("Fixing style braces v3...")
fixed = 0
for step in STEPS:
    if os.path.exists(step):
        if fix_v3(step):
            fixed += 1
            print(f"  OK {step}")
        else:
            print(f"  SKIP {step}")
    else:
        print(f"  MISSING {step}")

print(f"\n  {fixed} files fixed.")
print("\nDone. Run 'npm run build'.")