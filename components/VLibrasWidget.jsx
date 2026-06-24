import { useEffect, useRef } from 'react';

export default function VLibrasWidget() {
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialized.current) return;
    initialized.current = true;

    if (document.getElementById('vlibras-script')) return;

    // 1. CSS oficial do governo
    const css = document.createElement('link');
    css.id = 'vlibras-css';
    css.rel = 'stylesheet';
    css.href = 'https://vlibras.gov.br/app/vlibras-plugin.css';
    document.head.appendChild(css);

    // 2. Só força o container a ser visível e fixed — o CSS oficial cuida do botão
    const style = document.createElement('style');
    style.id = 'vlibras-fix';
    style.textContent = `
      [vw].enabled {
        position: fixed !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 9999 !important;
        display: block !important;
      }
    `;
    document.head.appendChild(style);

    // 3. Container exatamente como o governo espera
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

    // 4. Script
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

    document.body.appendChild(script);
  }, []);

  return null;
}