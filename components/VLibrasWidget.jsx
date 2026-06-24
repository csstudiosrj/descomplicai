import { useEffect, useRef } from 'react';

const VLIBRAS_SRC = 'https://vlibras.gov.br/app/vlibras-plugin.js';

export default function VLibrasWidget() {
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialized.current) return;
    initialized.current = true;

    // Verifica se já existe
    if (document.getElementById('vlibras-script')) return;

    // Cria estrutura do widget
    const container = document.createElement('div');
    container.setAttribute('vw', '');
    container.classList.add('enabled');
    container.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `;
    document.body.appendChild(container);

    // Carrega script
    const script = document.createElement('script');
    script.id = 'vlibras-script';
    script.src = VLIBRAS_SRC;
    script.async = true;

    script.onload = () => {
      if (window.VLibras && window.VLibras.Widget) {
        try {
          new window.VLibras.Widget({
            position: 'R',
            opacity: 1,
            avatar: 'random',
          });
        } catch (err) {
          console.warn('VLibras init error:', err);
        }
      }
    };

    script.onerror = () => {
      console.warn('VLibras script failed to load');
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup opcional — não remove em SPA para não quebrar navegação
    };
  }, []);

  return null;
}