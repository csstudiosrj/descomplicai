import Link from 'next/link';
import Icon from '../ui/Icon';

const PAGES = [
  { href: '/painel/fornecedores', icon: 'store', label: 'Fornecedores', desc: 'Gestao de contratos' },
  { href: '/painel/financeiro', icon: 'dollar', label: 'Financeiro', desc: 'Orcamento e pagamentos' },
  { href: '/painel/checklist', icon: 'checklist', label: 'Checklist', desc: 'Tarefas e prazos' },
  { href: '/painel/convidados', icon: 'users', label: 'Convidados', desc: 'Lista e confirmacoes' },
  { href: '/painel/mesas', icon: 'layout', label: 'Mesas', desc: 'Distribuicao e mapa visual' },
  { href: '/painel/cronograma', icon: 'clock', label: 'Cronograma', desc: 'Dia do casamento' },
];

export default function NavCards() {
  return (
    <div style={styles.grid}>
      {PAGES.map((page) => (
        <Link key={page.href} href={page.href} style={styles.link}>
          <div style={styles.card}>
            <div style={styles.iconWrap}>
              <Icon name={page.icon} size={24} color="var(--color-primary)" />
            </div>
            <div style={styles.text}>
              <span style={styles.label}>{page.label}</span>
              <span style={styles.desc}>{page.desc}</span>
            </div>
            <Icon name="arrowRight" size={16} color="var(--color-text-soft)" />
          </div>
        </Link>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '10px',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: '#fff',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid var(--color-secondary)',
    transition: 'box-shadow 0.2s, transform 0.2s',
    cursor: 'pointer',
  },
  iconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'var(--color-fundo)',
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
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  desc: {
    fontSize: '12px',
    color: 'var(--color-text-soft)',
  },
};