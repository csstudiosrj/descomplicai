import { useEffect, useRef } from 'react';

export default function VLibrasWidget() {
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialized.current) return;
    initialized.current = true;

    if (document.getElementById('vlibras-script')) return;

    // CSS oficial do VLibras
    const css = document.createElement('link');
    css.id = 'vlibras-css';
    css.rel = 'stylesheet';
    css.href = 'https://vlibras.gov.br/app/vlibras-plugin.css';
    document.head.appendChild(css);

    // Container
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

    // Script
    const script = document.createElement('script');
    script.id = 'vlibras-script';
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;

    script.onload = () => {
      if (window.VLibras && window.VLibras.Widget) {
        try {
          new window.VLibras.Widget({ position: 'R', opacity: 1, avatar: 'random' });
          console.log('[VLibras] Widget ativo');
        } catch (err) {
          console.warn('[VLibras] Erro:', err);
        }
      }
    };

    script.onerror = () => {
      console.warn('[VLibras] Script falhou');
    };

    document.body.appendChild(script);
  }, []);

  return null;
}