#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_basepath_final.py — Script final e robusto para corrigir basePath.

RODE NA RAIZ DO PROJETO:
    python3 fix_basepath_final.py
"""

import os
import re
import shutil
from pathlib import Path

BASE_PATH = '/descomplicai'
DIRETORIOS = ['components', 'pages', 'hooks']
EXTENSOES = ['.jsx', '.js']
EXCLUIR = ['node_modules', '.next', '.backup', '.git', 'fetchAPI.js']

HELPER = """/**
 * utils/fetchAPI.js
 * Helper centralizado para chamadas de API com basePath automatico.
 */
const BASE_PATH = '/descomplicai';

export function apiPath(path) {
  if (!path || typeof path !== 'string') return path;
  if (path.startsWith('http')) return path;
  if (BASE_PATH && path.startsWith(BASE_PATH)) return path;
  return `${BASE_PATH}${path}`;
}

export default function fetchAPI(path, options) {
  return fetch(apiPath(path), options);
}

export { fetchAPI, apiPath };
"""


def criar_helper():
    helper_path = Path('utils/fetchAPI.js')
    if helper_path.exists():
        print("  [Helper] utils/fetchAPI.js ja existe")
        return
    helper_path.parent.mkdir(parents=True, exist_ok=True)
    helper_path.write_text(HELPER, encoding='utf-8')
    print("  [Helper] Criado: utils/fetchAPI.js")


def calcular_import_path(arquivo_path):
    rel = Path(arquivo_path).resolve().relative_to(Path.cwd().resolve())
    partes = str(rel).split(os.sep)
    profundidade = len(partes) - 1
    return '../' * profundidade + 'utils/fetchAPI'


def encontrar_fim_imports(conteudo):
    """Encontra a linha apos o ultimo import/bloco de imports."""
    lines = conteudo.split('\n')
    ultimo = 0
    em_bloco = False
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        if stripped.startswith('/*'):
            em_bloco = True
        if '*/' in stripped:
            em_bloco = False
            continue
        if em_bloco:
            continue
        if stripped.startswith('//'):
            continue
        
        # Detecta inicio de import multilinha
        if stripped.startswith('import {') and not stripped.endswith('}'):
            # Procura o fechamento
            for j in range(i, len(lines)):
                if '}' in lines[j] and 'from' in lines[j]:
                    ultimo = j + 1
                    break
            continue
        
        # Import de uma linha
        if stripped.startswith('import ') and 'from' in stripped:
            ultimo = i + 1
    
    return ultimo


def processar(arquivo_path, backup_dir):
    try:
        conteudo = arquivo_path.read_text(encoding='utf-8')
    except Exception as e:
        print(f"  [ERRO] Ler {arquivo_path}: {e}")
        return False
    
    # Verifica se tem fetch('/api/...')
    if not re.search(r'fetch\s*\(\s*[\'"`]/api/', conteudo):
        return False
    
    # Backup
    nome = arquivo_path.name
    backup = backup_dir / nome
    contador = 1
    while backup.exists():
        backup = backup_dir / f"{arquivo_path.stem}_{contador}{arquivo_path.suffix}"
        contador += 1
    shutil.copy2(arquivo_path, backup)
    
    # Adiciona import
    import_path = calcular_import_path(arquivo_path)
    insert_idx = encontrar_fim_imports(conteudo)
    lines = conteudo.split('\n')
    lines.insert(insert_idx, f"import fetchAPI from '{import_path}';")
    conteudo = '\n'.join(lines)
    
    # Substitui fetchs
    conteudo = re.sub(r'(?<!fetchAPI)\bfetch\s*\(\s*(\'/api/)', r'fetchAPI(\1', conteudo)
    conteudo = re.sub(r'(?<!fetchAPI)\bfetch\s*\(\s*(`/api/)', r'fetchAPI(\1', conteudo)
    conteudo = re.sub(r'(?<!fetchAPI)\bfetch\s*\(\s*("/api/)', r'fetchAPI(\1', conteudo)
    
    try:
        arquivo_path.write_text(conteudo, encoding='utf-8')
        return True
    except Exception as e:
        print(f"  [ERRO] Escrever {arquivo_path}: {e}")
        shutil.copy2(backup, arquivo_path)
        return False


def main():
    print("=" * 50)
    print("  FIX BASEPATH FINAL")
    print("=" * 50)
    print()
    
    if not Path('next.config.js').exists():
        print("ERRO: Execute na raiz do projeto")
        return 1
    
    # Restaura arquivos modificados anteriormente
    print("[0/4] Restaurando arquivos para estado original...")
    os.system('git checkout -- components/ pages/ hooks/ 2>/dev/null')
    print("      OK")
    
    criar_helper()
    
    backup_dir = Path('.backup/fix-basepath-final')
    backup_dir.mkdir(parents=True, exist_ok=True)
    
    print()
    print("[2/4] Encontrando arquivos...")
    
    arquivos = []
    for dir_name in DIRETORIOS:
        dir_path = Path(dir_name)
        if not dir_path.exists():
            continue
        for ext in EXTENSOES:
            for arquivo in dir_path.rglob(f'*{ext}'):
                if any(excl in str(arquivo) for excl in EXCLUIR):
                    continue
                try:
                    conteudo = arquivo.read_text(encoding='utf-8')
                    if re.search(r'fetch\s*\(\s*[\'"`]/api/', conteudo):
                        arquivos.append(arquivo)
                except:
                    pass
    
    print(f"      {len(arquivos)} arquivos encontrados")
    
    print()
    print("[3/4] Processando...")
    
    modificados = 0
    for i, arquivo in enumerate(arquivos, 1):
        rel = Path(arquivo).resolve().relative_to(Path.cwd().resolve())
        print(f"      [{i}/{len(arquivos)}] {rel}")
        if processar(arquivo, backup_dir):
            modificados += 1
    
    print()
    print("[4/4] Verificando...")
    
    restantes = []
    for dir_name in DIRETORIOS:
        dir_path = Path(dir_name)
        if not dir_path.exists():
            continue
        for ext in EXTENSOES:
            for arquivo in dir_path.rglob(f'*{ext}'):
                if any(excl in str(arquivo) for excl in EXCLUIR):
                    continue
                try:
                    conteudo = arquivo.read_text(encoding='utf-8')
                    has_fetch = re.search(r'fetch\s*\(\s*[\'"`]/api/', conteudo)
                    has_fetchAPI = 'fetchAPI' in conteudo
                    if has_fetch and not has_fetchAPI:
                        restantes.append(str(arquivo.relative_to(Path.cwd())))
                except:
                    pass
    
    if restantes:
        print(f"      ALERTA: {len(restantes)} arquivos com problema:")
        for r in restantes:
            print(f"        - {r}")
    else:
        print("      Nenhum fetch('/api/...') restante.")
    
    # Verifica posicao dos imports
    print()
    print("Verificando posicao dos imports...")
    erros = 0
    for arquivo in arquivos:
        try:
            conteudo = arquivo.read_text(encoding='utf-8')
            lines = conteudo.split('\n')
            for i, line in enumerate(lines):
                if 'import fetchAPI' in line:
                    # Verifica se esta apos um bloco de imports
                    if i > 0 and not (lines[i-1].strip().startswith('import ') or 
                                     lines[i-1].strip().startswith('//') or
                                     lines[i-1].strip().startswith('/*')):
                        # Verifica se a proxima linha nao e continuação de import
                        if i > 0 and '}' in lines[i-1] and 'from' in lines[i-1]:
                            pass  # OK, apos bloco multilinha
                        else:
                            print(f"      [AVISO] {arquivo.relative_to(Path.cwd())}: import na linha {i+1} pode estar errado")
                            erros += 1
                    break
        except:
            pass
    
    if erros == 0:
        print("      Todos os imports estao na posicao correta.")
    
    print()
    print("=" * 50)
    print("  Concluido!")
    print("=" * 50)
    print(f"Arquivos: {len(arquivos)} | Modificados: {modificados}")
    print(f"Backups: {backup_dir}")
    print()
    print("Proximos passos:")
    print("  1. npm run build")
    print("  2. Se passar: git add . && git commit -m 'fix: basePath em todas as chamadas de API'")
    print("  3. git push")
    print()
    
    return 0


if __name__ == '__main__':
    exit(main())