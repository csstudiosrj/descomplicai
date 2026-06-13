import os
import shutil

ORIGEM = "public/images/descomplicaí banco de imagens"
DESTINO = "public/images"

# Garantir que as pastas existam
pastas = [
    "flores", "vestidos", "traje-noivo", "mesa", "decoracao",
    "cerimonia", "local", "alimentacao", "entretenimento",
    "beleza", "papelaria", "detalhes", "planejamento"
]

for pasta in pastas:
    os.makedirs(os.path.join(DESTINO, pasta), exist_ok=True)

movidos = 0
nao_encontrados = 0

def mover(nome_origem, destino_relativo):
    global movidos, nao_encontrados

    # Procura o arquivo em qualquer subpasta da origem (busca por substring para ser mais flexível)
    origem_caminho = None
    for raiz, dirs, arquivos in os.walk(ORIGEM):
        for arquivo in arquivos:
            if nome_origem.lower() in arquivo.lower() or arquivo.lower() in nome_origem.lower():
                origem_caminho = os.path.join(raiz, arquivo)
                break
        if origem_caminho:
            break

    destino_caminho = os.path.join(DESTINO, destino_relativo)

    if origem_caminho and os.path.exists(origem_caminho):
        shutil.move(origem_caminho, destino_caminho)
        print(f"✓ {nome_origem} → {destino_relativo}")
        movidos += 1
    else:
        print(f"✗ NÃO ENCONTRADO: {nome_origem}")
        nao_encontrados += 1

# ========== CORREÇÕES DE NOME + NOVAS IMAGENS ==========

# TRAJE NOIVO (correção)
mover("550park-luxury-wedding-films-ANqOsdiX1g8", "traje-noivo/making-of-noivo-1.jpg")

# BELEZA (correções)
mover("550park-luxury-wedding-films-DPs4XTZXvhU", "beleza/madrinhas-1.jpg")
mover("briana-autran-LA9s_6cEYWA", "beleza/making-of-noiva-3.jpg")
mover("caroline-attilio-je6xWZS2N08", "beleza/acessorios-noiva-2.jpg")
mover("emmalee-couturier-ciX9fOHgmik", "beleza/acessorios-noiva-4.jpg")
mover("kari-bjorn-photography-1r9J77ATMuM", "beleza/madrinhas-3.jpg")
mover("katelyn-macmillan-5VhSc5jCA2g", "beleza/making-of-noiva-21.jpg")

# LOCAL (correções)
mover("alexander-mass-egFubUTSI6c", "local/local-salao-2.jpg")
mover("colton-sturgeon-Mc4TqYOiJlA", "local/local-salao-5.jpg")

# DETALHES (correções)
mover("alexander-mass-j7LMXBkE3Pk", "detalhes/buque-2.jpg")
mover("mahsa-QjHwYGjBzYA", "detalhes/buque-21.jpg")
mover("rodrigo-rodrigues-wolf", "detalhes/aliancas-20.jpg")
mover("shardayyy-photography-fJzmPe-a0eU", "detalhes/sapatos-noiva-13.jpg")
mover("tetiana-thiel-ZueZt8hMdvw", "detalhes/sapatos-noiva-14.jpg")
mover("joeyy-lee-tkRlOnPtF4c", "detalhes/aliancas-13.jpg")

# DECORAÇÃO (correções)
mover("aurela-redenica-9vHAhn_gUtg", "decoracao/decor-minimalista-1.jpg")
mover("jose-marroquin-zWv16O3t2wI", "decoracao/decor-rustico-5.jpg")
mover("luwadlin-bosman-FFhZrVwkv6E", "decoracao/decor-minimalista-8.jpg")
mover("obi-A2rLX0UWKio", "decoracao/decor-minimalista-9.jpg")
mover("raissa-lara-lutolf-fasel", "decoracao/decor-default-8.jpg")
mover("lucas-t-photography-T5v5i67QYGk", "decoracao/decor-classico-10.jpg")

# CERIMÔNIA (correções)
mover("guy-basabose-xo318M8bemw", "cerimonia/cerimonia-beijo-3.jpg")
mover("javier-reyes-J6a4hgVw-hM", "cerimonia/cerimonia-corredor-4.jpg")
mover("photos-by-lanty-O38Id_cyV4M", "cerimonia/cerimonia-entrada-noiva-7.jpg")
mover("sushanta-rokka-0X7I1QwuirM", "cerimonia/cerimonia-altar-16.jpg")
mover("victoria-priessnitz-SdfogwU9QnU", "cerimonia/cerimonia-altar-18.jpg")
mover("yoav-franco-Am7cnuf_T7M", "cerimonia/cerimonia-beijo-8.jpg")

# FLORES (correções)
mover("mieke-campbell-_lmX02vePr4", "flores/flores-do-campo-1.jpg")
mover("natali-hordiiuk-UMHU7OWEFT0", "flores/flores-default-15.jpg")

# VESTIDOS (correção - nome com espaço vs hífen)
mover("kura-tregenza-5JEbKNp9uNk-unsplash (1)", "vestidos/vestido-boho-1.jpg")
mover("maria-luisa-queiroz-iINBpyermdM", "vestidos/vestido-minimalista-2.jpg")

# ALIMENTAÇÃO (correções)
mover("joeyy-lee-3ctY-H53170", "alimentacao/mesa-doces-8.jpg")
mover("taylor-flowe-5Txrg2kz7wQ", "alimentacao/coquetel-drinks-3.jpg")

# NOVAS IMAGENS (não estavam no script original)
mover("fotografo-samuel-cruz-PXUElL-PPV0", "cerimonia/cerimonia-default-1.jpg")
mover("jonathan-borba-B_R3rmJPeSE", "beleza/making-of-noiva-37.jpg")
mover("soulseeker-creative-photography-5aCz1RXQqjg", "mesa/mesa-rustico-9.jpg")
mover("soulseeker-creative-photography-aRQrz0fclB8", "mesa/mesa-rustico-10.jpg")

# BRUNXS - tem 2 arquivos, um vai para detalhes e outro para traje-noivo
mover("brunxs-monochrome-ZpNBwBR38fA", "detalhes/aliancas-3.jpg")
mover("brunxs-monochrome", "traje-noivo/making-of-noivo-4.jpg")

print("")
print("=" * 44)
print("CONCLUÍDO - SEGUNDA RODADA")
print(f"Arquivos movidos: {movidos}")
print(f"Não encontrados: {nao_encontrados}")
print("=" * 44)