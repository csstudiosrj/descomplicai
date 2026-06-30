# Ícones PWA

Os arquivos SVG nesta pasta são placeholders. Você precisa convertê-los para PNG:

1. Use um gerador online (ex: https://convertio.co/svg-png/)
2. Ou use o ImageMagick:
   ```bash
   convert icon-192x192.svg icon-192x192.png
   convert icon-512x512.svg icon-512x512.png
   ```
3. Substitua os arquivos na pasta `public/icons/`
4. Adicione também screenshots para o manifest (opcional):
   - `screenshot-wide.png` (1280x720)
   - `screenshot-narrow.png` (390x844)
