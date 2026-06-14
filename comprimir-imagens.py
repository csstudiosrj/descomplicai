#!/usr/bin/env python3
"""
Script de compressão de imagens para o descomplicaí
Reduz todas as imagens de public/images/ para ~100KB cada
Mantém a estrutura de pastas intacta
"""

import os
import sys
from PIL import Image

BASE_DIR = "public/images"
MAX_WIDTH = 800
QUALITY = 75

if not os.path.exists(BASE_DIR):
    print(f"ERRO: Pasta {BASE_DIR} não encontrada")
    sys.exit(1)

total_original = 0
total_novo = 0
arquivos = 0

for raiz, dirs, files in os.walk(BASE_DIR):
    for arquivo in files:
        if not arquivo.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            continue

        caminho = os.path.join(raiz, arquivo)
        tamanho_original = os.path.getsize(caminho)
        total_original += tamanho_original

        try:
            img = Image.open(caminho)

            # Converter para RGB se necessário
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')

            # Redimensionar se maior que MAX_WIDTH
            if img.width > MAX_WIDTH:
                ratio = MAX_WIDTH / img.width
                new_height = int(img.height * ratio)
                img = img.resize((MAX_WIDTH, new_height), Image.LANCZOS)

            # Salvar com compressão JPEG
            img.save(caminho, 'JPEG', quality=QUALITY, optimize=True)

            tamanho_novo = os.path.getsize(caminho)
            total_novo += tamanho_novo
            arquivos += 1

            reducao = (1 - tamanho_novo / tamanho_original) * 100
            print(f"✓ {caminho}: {tamanho_original/1024:.0f}KB → {tamanho_novo/1024:.0f}KB ({reducao:.0f}% menor)")

        except Exception as e:
            print(f"✗ ERRO em {caminho}: {e}")

print(f"\n{'='*50}")
print(f"Arquivos processados: {arquivos}")
print(f"Tamanho original: {total_original/1024/1024:.1f} MB")
print(f"Tamanho final: {total_novo/1024/1024:.1f} MB")
print(f"Economia: {(1 - total_novo/total_original)*100:.1f}%")
print(f"{'='*50}")