// utils/emailIcons.js
// Ícones SVG inline para e-mails do Descomplicaí
// Fallback para emoji se o cliente de e-mail não suportar SVG

const ICONS = {
    clock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;display:inline-block;"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 3.5"/></svg>`,
    
    alert: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;display:inline-block;"><path d="M12 3L2 20h20L12 3z"/><path d="M12 10v5"/><circle cx="12" cy="17.5" r="0.75" fill="#dc2626" stroke="none"/></svg>`,
    
    calendar: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;display:inline-block;"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 2v4M16 2v4"/><rect x="7" y="13" width="3" height="3" rx="0.5"/><rect x="14" y="13" width="3" height="3" rx="0.5"/></svg>`,
    
    rings: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;display:inline-block;"><circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/></svg>`,
    
    sparkle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;display:inline-block;"><path d="M12 2c0 5-2 8-2 10s2 5 2 10c0-5 2-8 2-10S12 7 12 2z"/><path d="M2 12c5 0 8 2 10 2s5-2 10-2c-5 0-8-2-10-2S7 12 2 12z"/></svg>`,
    
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;display:inline-block;"><path d="M4 12l5.5 6L20 6"/></svg>`,
    
    warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;display:inline-block;"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><circle cx="12" cy="16.5" r="0.75" fill="#f59e0b" stroke="none"/></svg>`,
    
    heart: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  };
  
  const FALLBACK = {
    clock: '⏰',
    alert: '⚠️',
    calendar: '📅',
    rings: '💍',
    sparkle: '✨',
    check: '✓',
    warning: '⚡',
    heart: '♥',
  };
  
  /**
   * Retorna ícone SVG inline com fallback para emoji
   * Clientes de e-mail que não suportam SVG ignoram a tag e mostram o texto
   */
  export function emailIcon(name) {
    const svg = ICONS[name] || '';
    const fallback = FALLBACK[name] || '';
    // O fallback fica como texto plano depois do SVG
    // Clientes que suportam SVG mostram o ícone
    // Clientes que não suportam mostram o emoji (ou nada, se o SVG quebrar)
    return `${svg}<span style="display:none;mso-hide:all;">${fallback}</span>`;
  }
  
  export { ICONS, FALLBACK };