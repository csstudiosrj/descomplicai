// Icon.jsx — Descomplicaí Design System
// 67 ícones SVG exclusivos, desenhados à mão
// API: <Icon name="edit" size={20} color="#8B6F5E" className="" />
// viewBox 24×24 · stroke-width 1.5 · strokeLinecap round · strokeLinejoin round · outline only

const icons = {

  // ─── EXISTENTES REDESENHADOS ───────────────────────────────────────────────

  home: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5z" />
      <path d="M9 21V13h6v8" />
    </g>
  ),

  users: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3.5" />
      <path d="M2 21c0-4 3.1-7 7-7s7 3 7 7" />
      <path d="M16 3.5c1.8.5 3 2.1 3 4s-1.2 3.5-3 4" />
      <path d="M22 21c0-3.5-2-6-5-6.5" />
    </g>
  ),

  checklist: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8l2 2 4-4" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </g>
  ),

  dollar: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20" />
      <path d="M17 6.5A4 4 0 0 0 12 5a4 4 0 0 0 0 8 4 4 0 0 1 0 8 4 4 0 0 1-5-1.5" />
    </g>
  ),

  calendar: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 2v4M16 2v4" />
      <rect x="7" y="13" width="3" height="3" rx="0.5" />
      <rect x="14" y="13" width="3" height="3" rx="0.5" />
    </g>
  ),

  clock: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 3.5" />
    </g>
  ),

  alert: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L2 20h20L12 3z" />
      <path d="M12 10v5" />
      <circle cx="12" cy="17.5" r="0.75" fill="currentColor" stroke="none" />
    </g>
  ),

  check: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12l5.5 6L20 6" />
    </g>
  ),

  plus: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v16M4 12h16" />
    </g>
  ),

  trash: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6" />
      <path d="M3 6h18" />
      <path d="M5 6l1.5 14a1 1 0 0 0 1 .9h9a1 1 0 0 0 1-.9L19 6" />
      <path d="M10 11v5M14 11v5" />
    </g>
  ),

  edit: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.5 3.5a2.12 2.12 0 0 1 3 3L7 18l-4 1 1-4L15.5 3.5z" />
      <path d="M13 6l3 3" />
    </g>
  ),

  search: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </g>
  ),

  download: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v13" />
      <path d="M7 12l5 5 5-5" />
      <path d="M3 19h18" />
    </g>
  ),

  upload: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V3" />
      <path d="M7 8l5-5 5 5" />
      <path d="M3 19h18" />
    </g>
  ),

  arrowRight: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16" />
      <path d="M13 6l6 6-6 6" />
    </g>
  ),

  arrowLeft: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12H4" />
      <path d="M11 6L5 12l6 6" />
    </g>
  ),

  menu: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h18M3 12h18M3 17h18" />
    </g>
  ),

  close: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5l14 14M19 5L5 19" />
    </g>
  ),

  mail: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 7l10 8 10-8" />
    </g>
  ),

  phone: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 3h3l1.5 4-2.5 1.5A11 11 0 0 0 14.5 14L16 11.5l4 1.5v3C20 18.9 18.8 20 17.5 20A15.5 15.5 0 0 1 4 6.5C4 5.2 5.1 4 6.5 3z" />
    </g>
  ),

  file: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8L14 2z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h5" />
    </g>
  ),

  chart: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18" />
      <path d="M7 20V12" />
      <path d="M12 20V6" />
      <path d="M17 20v-8" />
    </g>
  ),

  logout: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </g>
  ),

  store: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* fachada: vitrine + porta + janelas */}
      <rect x="2" y="10" width="20" height="12" rx="1" />
      <path d="M2 10l2-6h16l2 6" />
      <rect x="4" y="12" width="6" height="5" rx="1" />
      <rect x="9" y="15" width="6" height="7" rx="1" />
      <rect x="14" y="12" width="6" height="5" rx="1" />
    </g>
  ),

  list: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </g>
  ),

  grid: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </g>
  ),

  // ─── NAVEGAÇÃO E AÇÕES ────────────────────────────────────────────────────

  filter: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h18M6 10h12M9 15h6M11 20h2" />
    </g>
  ),

  sort: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </g>
  ),

  export: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3" />
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
    </g>
  ),

  moreOptions: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </g>
  ),

  back: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </g>
  ),

  settings: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </g>
  ),

  warning: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
    </g>
  ),

  info: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6" />
      <circle cx="12" cy="8" r="0.75" fill="currentColor" stroke="none" />
    </g>
  ),

  copy: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </g>
  ),

  link: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </g>
  ),

  eye: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12C3 6 7 3 12 3s9 3 11 9c-2 6-6 9-11 9S3 18 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </g>
  ),

  eyeOff: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5 0-9-3-11-8a10 10 0 0 1 2.53-4.05M9.9 4.24A9.12 9.12 0 0 1 12 4c5 0 9 3 11 8a9.77 9.77 0 0 1-1.67 2.84" />
      <path d="M3 3l18 18" />
      <path d="M10.73 10.73A3 3 0 0 0 14 14" />
    </g>
  ),

  drag: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
    </g>
  ),

  // ─── SEÇÕES DO PAINEL ─────────────────────────────────────────────────────

  fornecedores: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* vitrine: fachada plana com grande janela, divisória e porta */}
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M2 9h20" />
      <path d="M2 14h20" />
      <rect x="5" y="16" width="5" height="5" rx="1" />
      <rect x="14" y="16" width="5" height="5" rx="1" />
      <rect x="5" y="11" width="14" height="3" rx="0.5" />
    </g>
  ),

  financeiro: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="16" rx="2" />
      <path d="M2 10h20" />
      <path d="M12 5V3" />
      <path d="M12 14v-2.5" />
      <path d="M14.5 12a2.5 2.5 0 0 0-2.5-1.5A2 2 0 0 0 12 14.5a2 2 0 0 1 0 4 2.5 2.5 0 0 1-2.5-1.5" />
      <path d="M12 18.5V21" />
    </g>
  ),

  convidados: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="7" r="3" />
      <circle cx="16" cy="7" r="3" />
      <path d="M2 20c0-3.3 2.7-6 6-6h8c3.3 0 6 2.7 6 6" />
    </g>
  ),

  mesas: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* planta baixa: mesa oval central + 6 cadeiras ao redor */}
      <ellipse cx="12" cy="12" rx="5" ry="3.5" />
      {/* cadeiras: pequenos retângulos ao redor da elipse */}
      <rect x="9.5" y="3" width="5" height="3" rx="1" />
      <rect x="9.5" y="18" width="5" height="3" rx="1" />
      <rect x="2" y="7" width="3" height="3" rx="1" />
      <rect x="19" y="7" width="3" height="3" rx="1" />
      <rect x="2" y="14" width="3" height="3" rx="1" />
      <rect x="19" y="14" width="3" height="3" rx="1" />
    </g>
  ),

  cronograma: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 2v4M16 2v4" />
      <path d="M7 13h2v3H7z" />
      <path d="M11 13h6M11 17h4" />
    </g>
  ),

  memorial: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* vela com chama */}
      <path d="M12 7c-1 0-1.5-1-1-2s1.5-2 1-3c-.5 1-1 2 0 3.5" />
      <path d="M10 7h4v10a2 2 0 0 1-2 2 2 2 0 0 1-2-2V7z" />
      <path d="M8 19h8" />
      <path d="M9 10.5h6" />
      <path d="M9 13.5h6" />
    </g>
  ),

  colaborador: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7" />
      <path d="M18 3l2 2-2 2" />
      <path d="M20 5h-3" />
    </g>
  ),

  // ─── CATEGORIAS DE FORNECEDOR ─────────────────────────────────────────────

  fotografia: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="8" width="20" height="13" rx="2" />
      <path d="M16 8l-2-4H10L8 8" />
      <circle cx="12" cy="14.5" r="3.5" />
      <circle cx="18" cy="11" r="1" fill="currentColor" stroke="none" />
    </g>
  ),

  filmagem: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="14" height="10" rx="2" />
      <path d="M16 10l6-3v10l-6-3V10z" />
    </g>
  ),

  buffet: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* cloche: cúpula suave + pega + prato */}
      <path d="M12 4c-1 0-1.5.5-1.5 1s.5.8 1.5.8 1.5-.3 1.5-.8S13 4 12 4z" />
      <path d="M4.5 14c0-4.1 3.4-8.2 7.5-8.2S19.5 9.9 19.5 14" />
      <path d="M3 14h18" />
      <path d="M4 17h16" />
      <path d="M6 17c0 1.7 2.7 3 6 3s6-1.3 6-3" />
    </g>
  ),

  bar: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3h8l1 6H7L8 3z" />
      <path d="M7 9c0 3 2 5 5 5s5-2 5-5" />
      <path d="M12 14v4" />
      <path d="M8 18h8" />
      <path d="M6 21h12" />
    </g>
  ),

  bolo: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c-.5 0-1 .5-1 1s.5 1 1 1 1-.5 1-1-.5-1-1-1z" />
      <path d="M12 4v3" />
      <rect x="4" y="7" width="16" height="6" rx="1" />
      <rect x="2" y="13" width="20" height="8" rx="1" />
      <path d="M2 17h20" />
      <path d="M7 13v8M12 13v8M17 13v8" />
    </g>
  ),

  decoracao: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.5 7H22l-6 4.5 2.5 7L12 17l-6.5 3.5 2.5-7L2 9h7.5L12 2z" />
    </g>
  ),

  flores: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="2.5" />
      <path d="M12 7.5C12 5 10 3 8 4s-2 5 0 6" />
      <path d="M12 7.5C12 5 14 3 16 4s2 5 0 6" />
      <path d="M12 12.5C10 13 8 15.5 9.5 17S13 17.5 14 16" />
      <path d="M12 12.5C14 13 16 15.5 14.5 17S11 17.5 10 16" />
      <path d="M12 17v5" />
    </g>
  ),

  musica: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V6l12-2v12" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </g>
  ),

  banda: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* microfone */}
      <rect x="9" y="2" width="6" height="10" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </g>
  ),

  dj: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* vinil/disco */}
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <path d="M12 3c2.5 0 5 1 6.5 2.5" />
    </g>
  ),

  beleza: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* tesoura */}
      <circle cx="7" cy="7" r="3" />
      <circle cx="7" cy="17" r="3" />
      <path d="M9.5 9.5L20 20" />
      <path d="M9.5 14.5L20 4" />
      <path d="M20 4l-1 1M20 20l-1-1" />
    </g>
  ),

  vestuario: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 8l-4-5-4 3-4-3-4 5 3 1v12h10V9l3-1z" />
    </g>
  ),

  cerimonia: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* arco com duas colunas */}
      <path d="M4 20V8a8 8 0 0 1 16 0v12" />
      <path d="M4 20h16" />
      <path d="M4 8h16" />
    </g>
  ),

  celebrante: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="3" />
      <path d="M8 9.5c-2 1-4 3-4 6h16c0-3-2-5-4-6" />
      <path d="M9 21l3-5 3 5" />
      <path d="M9 21h6" />
    </g>
  ),

  local: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.7 2 6 4.7 6 8c0 5.2 6 13 6 13s6-7.8 6-13c0-3.3-2.7-6-6-6z" />
      <circle cx="12" cy="8" r="2.5" />
    </g>
  ),

  transporte: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3V9l3-5h12l3 5v8h-2" />
      <circle cx="7.5" cy="17" r="2.5" />
      <circle cx="16.5" cy="17" r="2.5" />
      <path d="M10 17h4" />
      <path d="M3 12h18" />
    </g>
  ),

  papelaria: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8L14 2z" />
      <path d="M14 2v6h6" />
      <path d="M12 11l-3 8" />
      <path d="M9 15h6" />
      <path d="M15 11l-3 8" />
    </g>
  ),

  seguranca: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11C7.5 20 4 16 4 11V5l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </g>
  ),

  animacaoInfantil: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* balão de festa */}
      <ellipse cx="12" cy="9" rx="6" ry="7" />
      <path d="M12 16c-.5 1-1 2-1 3" />
      <path d="M11 19h2" />
      <path d="M8 5C7 3.5 8 2 9.5 2" />
    </g>
  ),

  drone: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="9" width="8" height="6" rx="2" />
      <path d="M4 4h3v3H4zM17 4h3v3h-3zM4 17h3v3H4zM17 17h3v3h-3z" />
      <path d="M7 5.5h3M14 5.5h3M7 18.5h3M14 18.5h3" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </g>
  ),

  refreshCw: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-2.64-6.36L21 3" />
      <path d="M21 3v6h-6" />
    </g>
  ),

  checkCircle: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l2.5 2.5L16 9" />
    </g>
  ),

  alertCircle: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
    </g>
  ),

  save: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </g>
  ),

  fileText: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8L14 2z" />
      <path d="M14 2v6h6" />
      <path d="M8 9h2" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </g>
  ),

  fogos: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21v-3" />
      <path d="M12 14a3 3 0 0 0 3-3V9" />
      <path d="M15 9c0-2-1-4-3-5-2 1-3 3-3 5a3 3 0 0 0 3 3" />
      <path d="M5 7l1.5 1.5M18 7l-1.5 1.5M3 14h2M19 14h2M6.5 19.5L8 18M18 18l-1.5 1.5" />
    </g>
  ),

};

export default function Icon({ name, size = 24, color = 'currentColor', className = '' }) {
  const icon = icons[name];

  if (!icon) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Icon] ícone não encontrado: "${name}"`);
    }
    return null;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color, display: 'inline-block', flexShrink: 0 }}
      aria-hidden="true"
    >
      {icon}
    </svg>
  );
}