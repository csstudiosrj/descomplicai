// pages/painel/index.jsx — Dashboard principal
import { useEffect, useState } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import ProgressBar from '../../components/painel/ProgressBar';
import AlertCards from '../../components/painel/AlertCards';
import NavCards from '../../components/painel/NavCards';
import { useAuth } from '../../hooks/useAuth';

export default function PainelPage() {
  return (
    <ProtectedRoute>
      <PainelContent />
    </ProtectedRoute>
  );
}

function PainelContent() {
  const { user, evento, signOut, supabase } = useAuth();
  const [progresso, setProgresso] = useState(0);
  const [pagamentos, setPagamentos] = useState([]);
  const [tarefas, setTarefas] = useState([]);

  useEffect(() => {
    if (!evento) return;
    buscarDados();
  }, [evento]);

  const buscarDados = async () => {
    const { data: tarefasData } = await supabase
      .from('tarefas')
      .select('*')
      .eq('evento_id', evento.id);

    if (tarefasData) {
      const total = tarefasData.length;
      const concluidas = tarefasData.filter(t => t.concluida).length;
      setProgresso(total > 0 ? Math.round((concluidas / total) * 100) : 0);

      const hoje = new Date();
      const tarefasComStatus = tarefasData.map(t => ({
        ...t,
        atrasada: t.prazo && new Date(t.prazo) < hoje && !t.concluida,
      }));
      setTarefas(tarefasComStatus);
    }

    const { data: pagosData } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('evento_id', evento.id)
      .eq('status', 'pendente');

    if (pagosData) {
      const hoje = new Date();
      const pagosComDias = pagosData.map(p => {
        const venc = new Date(p.data_vencimento);
        const dias = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
        return { ...p, dias };
      }).filter(p => p.dias <= 7 && p.dias >= 0);
      setPagamentos(pagosComDias);
    }
  };

  const nomeCasal = evento
    ? (evento.nome_pessoa1 && evento.nome_pessoa2
        ? `${evento.nome_pessoa1} & ${evento.nome_pessoa2}`
        : evento.nome_evento ? evento.nome_evento.split("&").map(n => n.trim().charAt(0).toUpperCase() + n.trim().slice(1)).join(" \evento.nome_evento || 'Seu Casamento' ") : "Seu Casamento")
    : '';

  return (
    <>
      <Head>
        <title>Painel | descomplicaí</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.page}>
        <HeaderPainel
          nomeCasal={nomeCasal}
          dataEvento={evento?.data_evento}
          onLogout={signOut}
        />

        <main style={styles.main}>
          <ProgressBar
            percentual={progresso}
            label="Progresso do planejamento"
          />

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Alertas</h2>
            <AlertCards pagamentos={pagamentos} tarefas={tarefas} />
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Navegação</h2>
            <NavCards />
          </section>
        </main>
      </div>

      <style jsx global>{`
        :root {
          --color-primary: #8B6F5E;
          --color-secondary: #E5E0D9;
          --color-tertiary: #F9F7F4;
          --color-fundo: #F9F7F4;
          --color-text: #1A1714;
          --color-text-soft: #5C534A;
          --font-display: 'Cormorant Garamond', Georgia, serif;
          --font-body: 'DM Sans', Helvetica, Arial, sans-serif;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: var(--font-body);
          color: var(--color-text);
          background: var(--color-fundo);
        }
      `}</style>
    </>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--color-fundo)',
  },
  main: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '20px 16px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    color: 'var(--color-primary)',
    fontWeight: 600,
  },
};