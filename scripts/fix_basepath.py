#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_basepath.py — Substitui todos os fetch('/api/...') e fetch(`/api/...`)
pelo helper fetchAPI em todos os arquivos do projeto.

RODE NA RAIZ DO PROJETO:
    python3 scripts/fix_basepath.py

O script:
1. Cria o helper utils/fetchAPI.js (se nao existir)
2. Faz backup dos arquivos originais em .backup/fix-basepath/
3. Adiciona import do fetchAPI em cada arquivo modificado
4. Substitui fetch('/api/...') por fetchAPI('/api/...')
5. Substitui fetch(`/api/...`) por fetchAPI(`/api/...`)
6. Substitui fetch('/api/...', { por fetchAPI('/api/...', {
7. Substitui fetch(`/api/...`, { por fetchAPI(`/api/...`, {
8. Substitui fetch dentro de Promise.all([...]) por fetchAPI
"""

import os
import re
import shutil
from pathlib import Path

# Diretorios a varrer
DIRETORIOS = ['components', 'pages', 'utils', 'hooks']

# Extensoes a processar
EXTENSOES = ['.jsx', '.js']

# Excluir
EXCLUIR_DIRS = {'node_modules', '.next', '.backup', '.git', '__pycache__'}

# Regex para encontrar fetch('/api/...') e fetch(`/api/...`)
PATTERN_FETCH_SINGLE = re.compile(r"fetch\s*\(\s*'/api/")
PATTERN_FETCH_TEMPLATE = re.compile(r'fetch\s*\(\s*`/api/')
PATTERN_FETCH_DOUBLE = re.compile(r'fetch\s*\(\s*"/api/')

# Padrao para detectar se ja tem import do fetchAPI
PATTERN_IMPORT_FETCHAPI = re.compile(r'import\s+.*fetchAPI.*from\s+["\'].*fetchAPI["\']')


def criar_helper():
    """Cria o helper utils/fetchAPI.js se nao existir."""
    helper_path = Path('utils/fetchAPI.js')

    if helper_path.exists():
        print("  [Helper] utils/fetchAPI.js ja existe (mantido)")
        return

    helper_path.parent.mkdir(parents=True, exist_ok=True)

    helper_content = """/**
 * utils/fetchAPI.js
 * Helper centralizado para chamadas de API com basePath automatico.
 *
 * O Next.js basePath (/descomplicai) nao e aplicado automaticamente
 * em fetch() do cliente. Este helper prefixa o caminho corretamente.
 *
 * Se o basePath mudar no next.config.js, altere apenas a constante
 * BASE_PATH abaixo.
 */

const BASE_PATH = '/descomplicai';

/**
 * Prefixa um caminho de API com o basePath da aplicacao.
 * Funciona tanto em dev quanto em prod.
 *
 * @param {string} path - Caminho da API (ex: '/api/memorial/salvar')
 * @returns {string} Caminho completo com basePath (ex: '/descomplicai/api/memorial/salvar')
 */
export function apiPath(path) {
  if (!path || typeof path !== 'string') return path;
  // Nao prefixa URLs absolutas (http://, https://)
  if (path.startsWith('http')) return path;
  // Nao prefixa se ja estiver com basePath
  if (BASE_PATH && path.startsWith(BASE_PATH)) return path;
  return `${BASE_PATH}${path}`;
}

/**
 * Wrapper de fetch que automaticamente prefixa o basePath.
 * Aceita a mesma assinatura do fetch nativo.
 *
 * @param {string} path - Caminho da API
 * @param {RequestInit} [options] - Opcoes do fetch
 * @returns {Promise<Response>}
 */
export default function fetchAPI(path, options) {
  return fetch(apiPath(path), options);
}

export { fetchAPI, apiPath };
"""

    helper_path.write_text(helper_content, encoding='utf-8')
    print(f"  [Helper] Criado: {helper_path}")


def calcular_import_path(arquivo_path):
    """Calcula o caminho relativo do import para o fetchAPI."""
    partes = arquivo_path.parts
    profundidade = len(partes) - 1

    if profundidade == 0:
        return "./utils/fetchAPI"
    elif profundidade == 1:
        return "../utils/fetchAPI"
    elif profundidade == 2:
        return "../../utils/fetchAPI"
    elif profundidade == 3:
        return "../../../utils/fetchAPI"
    elif profundidade == 4:
        return "../../../../utils/fetchAPI"
    else:
        return "/".join([".."] * profundidade) + "/utils/fetchAPI"


def adicionar_import(conteudo, import_path):
    """Adiciona o import do fetchAPI no topo do arquivo, se ainda nao tiver."""
    if PATTERN_IMPORT_FETCHAPI.search(conteudo):
        return conteudo

    # Detecta se o arquivo usa aspas simples ou duplas nos imports
    if re.search(r'import\s+.*from\s+"', conteudo):
        import_line = f'import fetchAPI from "{import_path}";\n'
    else:
        import_line = f"import fetchAPI from '{import_path}';\n"

    lines = conteudo.split('\n')

    insert_idx = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('import ') or stripped.startswith('//') or stripped.startswith('/*'):
            insert_idx = i + 1

    if insert_idx == 0 and lines and (lines[0].strip().startswith('//') or lines[0].strip().startswith('/*')):
        for i, line in enumerate(lines):
            if '*/' in line:
                insert_idx = i + 1
                break

    lines.insert(insert_idx, import_line.rstrip())
    return '\n'.join(lines)


def substituir_fetchs(conteudo):
    """Substitui fetch('/api/...') e fetch(`/api/...`) por fetchAPI(...)."""

    # Padrao 1: fetch('/api/...) -> fetchAPI('/api/...)
    # Usa lookbehind negativo para nao pegar fetchAPI('/api/... que ja foi substituido
    conteudo = re.sub(
        r'(?<!fetchAPI)\bfetch\s*\(\s*(\'/api/)',
        r'fetchAPI(\1',
        conteudo
    )

    # Padrao 2: fetch(`/api/...) -> fetchAPI(`/api/...)
    conteudo = re.sub(
        r'(?<!fetchAPI)\bfetch\s*\(\s*(`/api/)',
        r'fetchAPI(\1',
        conteudo
    )

    # Padrao 3: fetch("/api/...) -> fetchAPI("/api/...)
    conteudo = re.sub(
        r'(?<!fetchAPI)\bfetch\s*\(\s*("/api/)',
        r'fetchAPI(\1',
        conteudo
    )

    return conteudo


def processar_arquivo(arquivo_path, backup_dir):
    """Processa um arquivo: backup, import, substituicao."""
    try:
        conteudo = arquivo_path.read_text(encoding='utf-8')
    except Exception as e:
        print(f"  [ERRO] Nao foi possivel ler {arquivo_path}: {e}")
        return False

    tem_fetch_single = bool(PATTERN_FETCH_SINGLE.search(conteudo))
    tem_fetch_template = bool(PATTERN_FETCH_TEMPLATE.search(conteudo))
    tem_fetch_double = bool(PATTERN_FETCH_DOUBLE.search(conteudo))

    if not tem_fetch_single and not tem_fetch_template and not tem_fetch_double:
        return False

    # Backup
    backup_path = backup_dir / arquivo_path.name
    contador = 1
    while backup_path.exists():
        backup_path = backup_dir / f"{arquivo_path.stem}_{contador}{arquivo_path.suffix}"
        contador += 1

    shutil.copy2(arquivo_path, backup_path)

    # Adiciona import
    import_path = calcular_import_path(arquivo_path)
    conteudo = adicionar_import(conteudo, import_path)

    # Substitui fetchs
    conteudo = substituir_fetchs(conteudo)

    try:
        arquivo_path.write_text(conteudo, encoding='utf-8')
        return True
    except Exception as e:
        print(f"  [ERRO] Nao foi possivel escrever {arquivo_path}: {e}")
        shutil.copy2(backup_path, arquivo_path)
        return False


def main():
    print("=" * 50)
    print("  FIX BASEPATH — Substituicao automatica")
    print("=" * 50)
    print()

    if not Path('next.config.js').exists():
        print("ERRO: Execute este script na raiz do projeto (onde esta next.config.js)")
        print(f"Diretorio atual: {os.getcwd()}")
        return 1

    print("[1/4] Criando helper utils/fetchAPI.js...")
    criar_helper()

    backup_dir = Path('.backup/fix-basepath')
    backup_dir.mkdir(parents=True, exist_ok=True)

    print()
    print("[2/4] Encontrando arquivos com fetch('/api/...')...")

    arquivos = []
    for dir_name in DIRETORIOS:
        dir_path = Path(dir_name)
        if not dir_path.exists():
            continue
        for ext in EXTENSOES:
            for arquivo in dir_path.rglob(f'*{ext}'):
                if any(excl in arquivo.parts for excl in EXCLUIR_DIRS):
                    continue
                if 'fetchAPI.js' in arquivo.name:
                    continue
                try:
                    conteudo = arquivo.read_text(encoding='utf-8')
                    if (PATTERN_FETCH_SINGLE.search(conteudo) or 
                        PATTERN_FETCH_TEMPLATE.search(conteudo) or
                        PATTERN_FETCH_DOUBLE.search(conteudo)):
                        arquivos.append(arquivo)
                except:
                    pass

    total = len(arquivos)
    print(f"      {total} arquivos encontrados")

    if total == 0:
        print()
        print("Nenhum arquivo com fetch('/api/...') encontrado. Nada a fazer.")
        return 0

    print()
    print("[3/4] Fazendo backup e substituindo...")

    modificados = 0
    for i, arquivo in enumerate(arquivos, 1):
        print(f"      [{i}/{total}] {arquivo}")
        if processar_arquivo(arquivo, backup_dir):
            modificados += 1

    print()
    print("[4/4] Verificando se sobrou algum fetch('/api/...')...")

    restantes = []
    for dir_name in DIRETORIOS:
        dir_path = Path(dir_name)
        if not dir_path.exists():
            continue
        for ext in EXTENSOES:
            for arquivo in dir_path.rglob(f'*{ext}'):
                if any(excl in arquivo.parts for excl in EXCLUIR_DIRS):
                    continue
                if 'fetchAPI.js' in arquivo.name:
                    continue
                try:
                    conteudo = arquivo.read_text(encoding='utf-8')
                    has_fetch = (PATTERN_FETCH_SINGLE.search(conteudo) or 
                               PATTERN_FETCH_TEMPLATE.search(conteudo) or
                               PATTERN_FETCH_DOUBLE.search(conteudo))
                    has_fetchAPI = 'fetchAPI' in conteudo
                    if has_fetch and not has_fetchAPI:
                        restantes.append(str(arquivo))
                except:
                    pass

    if restantes:
        print()
        print("ALERTA: Ainda existem fetch('/api/...') nao substituidos:")
        for r in restantes:
            print(f"  - {r}")
        print()
        print("Verifique manualmente os arquivos acima.")
    else:
        print("      Nenhum fetch('/api/...') restante encontrado.")

    print()
    print("=" * 50)
    print("  Concluido!")
    print("=" * 50)
    print()
    print(f"Arquivos encontrados: {total}")
    print(f"Arquivos modificados: {modificados}")
    print(f"Backups salvos em: {backup_dir}")
    print()
    print("Proximos passos:")
    print("  1. Verifique se os imports do fetchAPI estao corretos nos arquivos")
    print("  2. Teste o build: npm run build")
    print("  3. git add . && git commit -m 'fix: basePath em todas as chamadas de API'")
    print("  4. git push")
    print()

    return 0


if __name__ == '__main__':
    exit(main())