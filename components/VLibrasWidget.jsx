import { useEffect, useRef } from 'react';

export default function VLibrasWidget() {
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialized.current) return;
    initialized.current = true;

    // Evita duplicar
    if (document.getElementById('vlibras-script')) {
      console.log('[VLibras] Script já carregado');
      return;
    }

    // Cria container com estilos mínimos para garantir visibilidade
    const container = document.createElement('div');
    container.setAttribute('vw', '');
    container.classList.add('enabled');
    container.style.position = 'fixed';
    container.style.right = '0';
    container.style.bottom = '0';
    container.style.zIndex = '9999';
    container.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `;
    document.body.appendChild(container);

    // Carrega script oficial
    const script = document.createElement('script');
    script.id = 'vlibras-script';
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;

    script.onload = () => {
      console.log('[VLibras] Script carregado');
      if (window.VLibras && window.VLibras.Widget) {
        try {
          new window.VLibras.Widget({
            position: 'R',
            opacity: 1,
            avatar: 'random',
          });
          console.log('[VLibras] Widget inicializado');
        } catch (err) {
          console.warn('[VLibras] Erro ao inicializar:', err);
        }
      } else {
        console.warn('[VLibras] window.VLibras não disponível');
      }
    };

    script.onerror = () => {
      console.warn('[VLibras] Falha ao carregar script do governo');
    };

    document.body.appendChild(script);
  }, []);

  return null;
}