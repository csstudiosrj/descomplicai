import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { getPainelServerSideProps } from '../../utils/painelServer';

export default function FinanceiroPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <FinanceiroContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function FinanceiroContent({ readOnly }) {
  const { evento, signOut, supabase } = useAuth();
  const [pagamentos, setPagamentos] = useState([]);

  useEffect(() => {
    if (evento) buscar();
  }, [evento]);

  const buscar = async () => {
    const { data } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('evento_id', evento.id)
      .order('data_vencimento');
    setPagamentos(data || []);
  };

  const resumo = useMemo(() => {
    const total = evento?.orcamento_total || 0;
    const comprometido = pagamentos.reduce((s, p) => s + (p.valor_total || 0), 0);
    const pago = pagamentos.reduce((s, p) => s + (p.valor_pago || 0), 0);
    const saldo = comprometido - pago;
    return { total, comprometido, pago, saldo };
  }, [evento, pagamentos]);

  const porCategoria = useMemo(() => {
    const map = {};
    pagamentos.forEach((p) => {
      const cat = p.categoria || 'Outros';
      map[cat] = (map[cat] || 0) + (p.valor_total || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [pagamentos]);

  const nomeCasal = evento
    ? `${evento.nome_pessoa1 || ''} & ${evento.nome_pessoa2 || ''}`
    : '';

  return (
    <>
      <Head><title>Financeiro | descomplicaí</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} onLogout={signOut} />
        <main style={styles.main}>
          {readOnly && (
            <div style={styles.readOnlyBanner}><span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span></div>
          )}
          <h1 style={styles.title}>Financeiro</h1>

          <div style={styles.cards}>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Orçamento Total</span>
              <span style={styles.cardValue}>R$ {resumo.total.toLocaleString('pt-BR')}</span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Comprometido</span>
              <span style={styles.cardValue}>R$ {resumo.comprometido.toLocaleString('pt-BR')}</span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Pago</span>
              <span style={styles.cardValue}>R$ {resumo.pago.toLocaleString('pt-BR')}</span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Saldo a Pagar</span>
              <span style={styles.cardValue}>R$ {resumo.saldo.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Distribuição por Categoria</h2>
            <div style={styles.chart}>
              {porCategoria.map(([cat, val]) => {
                const pct = resumo.comprometido > 0 ? (val / resumo.comprometido) * 100 : 0;
                return (
                  <div key={cat} style={styles.chartRow}>
                    <span style={styles.chartLabel}>{cat}</span>
                    <div style={styles.chartTrack}>
                      <div style={{ ...styles.chartFill, width: `${pct}%` }} />
                    </div>
                    <span style={styles.chartValue}>R$ {val.toLocaleString('pt-BR')}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Vencimentos</h2>
            <div style={styles.list}>
              {pagamentos.map((p) => (
                <div key={p.id} style={styles.listItem}>
                  <div style={styles.listInfo}>
                    <span style={styles.listName}>{p.nome}</span>
                    <span style={styles.listDate}>
                      <Icon name="calendar" size={12} /> {p.data_vencimento}
                    </span>
                  </div>
                  <span style={styles.listValue}>R$ {(p.valor_saldo || 0).toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  return getPainelServerSideProps(context);
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-fundo)' },
  main: { maxWidth: '960px', margin: '0 auto', padding: '20px 16px 40px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-primary)', marginBottom: '20px' },
  cards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' },
  cardLabel: { fontSize: '12px', color: 'var(--color-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardValue: { fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' },
  section: { marginBottom: '24px' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-primary)', marginBottom: '12px' },
  chart: { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' },
  chartRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  chartLabel: { width: '100px', fontSize: '12px', color: 'var(--color-text)', flexShrink: 0 },
  chartTrack: { flex: 1, height: '8px', background: 'var(--color-secondary)', borderRadius: '4px', overflow: 'hidden' },
  chartFill: { height: '100%', background: 'var(--color-primary)', borderRadius: '4px' },
  chartValue: { width: '80px', fontSize: '12px', color: 'var(--color-text-soft)', textAlign: 'right', flexShrink: 0 },
  list: { background: '#fff', borderRadius: '12px', border: '1px solid var(--color-secondary)', overflow: 'hidden' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--color-secondary)' },
  listInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  listName: { fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' },
  listDate: { fontSize: '12px', color: 'var(--color-text-soft)', display: 'flex', alignItems: 'center', gap: '4px' },
  listValue: { fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
};