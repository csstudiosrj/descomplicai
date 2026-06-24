import { useEffect, useRef } from 'react';

export default function VLibrasWidget() {
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialized.current) return;
    initialized.current = true;

    if (document.getElementById('vlibras-script')) return;

    // Estilos mínimos para garantir visibilidade do botão
    const style = document.createElement('style');
    style.id = 'vlibras-force-style';
    style.textContent = `
      [vw] { position: fixed !important; right: 0 !important; bottom: 0 !important; z-index: 9999 !important; }
      [vw-access-button] {
        width: 60px !important;
        height: 60px !important;
        background: #003366 !important;
        border-radius: 50% !important;
        position: fixed !important;
        right: 16px !important;
        bottom: 16px !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
      }
      [vw-access-button]::after {
        content: '' !important;
        width: 30px !important;
        height: 30px !important;
        background: url('https://vlibras.gov.br/app/assets/logo.svg') center/contain no-repeat !important;
        filter: brightness(0) invert(1) !important;
      }
      [vw-plugin-wrapper] {
        position: fixed !important;
        right: 0 !important;
        bottom: 80px !important;
        width: 320px !important;
        height: 400px !important;
        z-index: 9998 !important;
      }
    `;
    document.head.appendChild(style);

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