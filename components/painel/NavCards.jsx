import Link from 'next/link';
import Icon from '../ui/Icon';

const PAGES = [
  { href: '/painel/fornecedores', icon: 'store', label: 'Fornecedores', desc: 'Gestão de contratos' },
  { href: '/painel/financeiro', icon: 'dollar', label: 'Financeiro', desc: 'Orçamento e pagamentos' },
  { href: '/painel/checklist', icon: 'checklist', label: 'Checklist', desc: 'Tarefas e prazos' },
  { href: '/painel/convidados', icon: 'users', label: 'Convidados', desc: 'Lista e confirmações' },
  { href: '/painel/mesas', icon: 'mesas', label: 'Mesas', desc: 'Distribuição e mapa visual' },
  { href: '/painel/cronograma', icon: 'clock', label: 'Cronograma', desc: 'Dia do casamento' },
  { href: '/painel/contratos', icon: 'contratos', label: 'Contratos', desc: 'Documentos e assinaturas' },
];

export default function NavCards() {
  return (
    <div style={styles.grid}>
      {PAGES.map((page) => (
        <Link key={page.href} href={page.href} style={styles.link}>
          <div style={styles.card}>
            <div style={styles.iconWrap}>
              <Icon name={page.icon} size={24} color="var(--color-brand)" />
            </div>
            <div style={styles.text}>
              <span style={styles.label}>{page.label}</span>
              <span style={styles.desc}>{page.desc}</span>
            </div>
            <Icon name="arrowRight" size={16} color="var(--color-text-muted)" />
          </div>
        </Link>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 'var(--space-3)',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    background: 'var(--color-white)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-4)',
    border: '1px solid var(--color-border)',
    transition: 'box-shadow var(--transition-fast), transform var(--transition-fast)',
    cursor: 'pointer',
  },
  iconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-off-white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  label: {
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-text-primary)',
  },
  desc: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },
};