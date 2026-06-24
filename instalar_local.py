#!/usr/bin/env python3
import os, shutil, zipfile, sys
PROJECT = os.getcwd()
ZIP = os.path.join(PROJECT, "descomplicai-expansao-completo.zip")
EXTRACT = "/tmp/descomplicai-expansao"
STEPS = os.path.join(PROJECT, "components", "memorial", "steps")
UTILS = os.path.join(PROJECT, "utils")
MEMORIAL = os.path.join(PROJECT, "components", "memorial")

print("="*50)
print("  Descomplicaí — Instalador (ZIP local)")
print("="*50)

if not os.path.exists(ZIP):
    print(f"  ❌ ZIP não encontrado: {ZIP}")
    sys.exit(1)
print(f"  ✅ ZIP encontrado ({os.path.getsize(ZIP)/1024:.1f} KB)")

for d in [STEPS, UTILS, MEMORIAL]: os.makedirs(d, exist_ok=True)
print("  ✅ Diretórios OK")

if os.path.exists(EXTRACT): shutil.rmtree(EXTRACT)
os.makedirs(EXTRACT)
with zipfile.ZipFile(ZIP, 'r') as z: z.extractall(EXTRACT)
print("  ✅ Extração OK")

src_steps = os.path.join(EXTRACT, "components", "memorial", "steps")
src_utils = os.path.join(EXTRACT, "utils")
src_orch = os.path.join(EXTRACT, "components", "memorial", "MemorialOrchestrator.jsx")

step_files = [f for f in os.listdir(src_steps) if f.endswith('.jsx')]
util_files = [f for f in os.listdir(src_utils) if f.endswith('.js')]

for f in step_files: shutil.copy2(os.path.join(src_steps, f), STEPS)
for f in util_files: shutil.copy2(os.path.join(src_utils, f), UTILS)
shutil.copy2(src_orch, os.path.join(MEMORIAL, "MemorialOrchestrator.jsx"))
print(f"  ✅ {len(step_files)} steps + {len(util_files)} utils copiados")

old = ["Step17Flores.jsx","Step23Toalha.jsx","Step30Entrada.jsx","Step38Coquetel.jsx","Step49Convites.jsx","Step54Vestido.jsx"]
for o in old:
    p = os.path.join(STEPS, o)
    if os.path.exists(p): os.remove(p); print(f"  🗑️  {o}")

final = len([f for f in os.listdir(STEPS) if f.endswith('.jsx')])
print(f"\n{'='*50}\n  ✅ PRONTO — {final} steps no projeto\n  🚀 Rode: npm run dev\n{'='*50}")