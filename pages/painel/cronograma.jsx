import { useState, useEffect } from 'react';
import Head from 'next/head';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import HeaderPainel from '../../components/painel/HeaderPainel';
import Icon from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { getPainelServerSideProps } from '../../utils/painelServer';

export default function CronogramaPage({ readOnly }) {
  return (
    <ProtectedRoute>
      <CronogramaContent readOnly={readOnly} />
    </ProtectedRoute>
  );
}

function CronogramaContent({ readOnly }) {
  const { evento, signOut, supabase } = useAuth();
  const [itens, setItens] = useState([]);
  const [novoHorario, setNovoHorario] = useState('');
  const [novaAtividade, setNovaAtividade] = useState('');
  const [novoResponsavel, setNovoResponsavel] = useState('');
  const [editando, setEditando] = useState(null);

  useEffect(() => { if (evento) buscar(); }, [evento]);

  const buscar = async () => {
    const { data } = await supabase.from('cronograma').select('*').eq('evento_id', evento.id).order('horario');
    if (data?.length) { setItens(data); }
    else { gerarPadrao(); }
  };

  const gerarPadrao = () => {
    if (readOnly) { setItens([]); return; }
    const padrao = [
      { horario: '14:00', atividade: 'Chegada dos fornecedores', responsavel: 'Cerimonialista' },
      { horario: '15:30', atividade: 'Inicio da cerimonia', responsavel: 'Celebrante' },
      { horario: '16:30', atividade: 'Coquetel de recepcao', responsavel: 'Buffet' },
      { horario: '18:00', atividade: 'Inicio do jantar', responsavel: 'Buffet' },
      { horario: '20:00', atividade: 'Abertura da pista', responsavel: 'DJ/Banda' },
      { horario: '23:00', atividade: 'Saida dos noivos', responsavel: 'Cerimonialista' },
    ];
    setItens(padrao);
  };

  const salvar = async () => {
    if (readOnly || !novoHorario || !novaAtividade.trim()) return;
    const payload = { evento_id: evento.id, horario: novoHorario, atividade: novaAtividade, responsavel: novoResponsavel };
    if (editando) { await supabase.from('cronograma').update(payload).eq('id', editando); setEditando(null); }
    else { await supabase.from('cronograma').insert(payload); }
    setNovoHorario(''); setNovaAtividade(''); setNovoResponsavel(''); buscar();
  };

  const editar = (item) => {
    if (readOnly) return;
    setNovoHorario(item.horario); setNovaAtividade(item.atividade); setNovoResponsavel(item.responsavel || ''); setEditando(item.id);
  };

  const excluir = async (id) => {
    if (readOnly || !confirm('Excluir item?')) return;
    await supabase.from('cronograma').delete().eq('id', id); buscar();
  };

  const nomeCasal = evento?.nome_evento || '';

  return (
    <>
      <Head><title>Cronograma | descomplicaí</title></Head>
      <div style={styles.page}>
        <HeaderPainel nomeCasal={nomeCasal} dataEvento={evento?.data_evento} onLogout={signOut} />
        <main style={styles.main}>
          <h1 style={styles.title}>Cronograma do Dia</h1>
          {readOnly && (
            <div style={styles.readOnlyBanner}><span style={styles.readOnlyText}>Modo somente leitura. Assine para editar.</span></div>
          )}
          {!readOnly && (
            <div style={styles.form}>
              <input style={{ ...styles.input, width: '80px' }} type="time" value={novoHorario} onChange={e => setNovoHorario(e.target.value)} />
              <input style={styles.input} placeholder="Atividade" value={novaAtividade} onChange={e => setNovaAtividade(e.target.value)} />
              <input style={{ ...styles.input, width: '160px' }} placeholder="Responsavel" value={novoResponsavel} onChange={e => setNovoResponsavel(e.target.value)} />
              <button onClick={salvar} style={styles.btnPrimary}><Icon name={editando ? 'check' : 'plus'} size={16} color="#fff" /></button>
              {editando && <button onClick={() => { setEditando(null); setNovoHorario(''); setNovaAtividade(''); setNovoResponsavel(''); }} style={styles.btnSecondary}>Cancelar</button>}
            </div>
          )}

          <div style={styles.timeline}>
            <div style={styles.line} />
            {itens.sort((a, b) => a.horario.localeCompare(b.horario)).map((item, i) => (
              <div key={item.id || i} style={styles.item}>
                <div style={styles.dot} />
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.hora}>{item.horario}</span>
                    <span style={styles.titulo}>{item.atividade}</span>
                  </div>
                  <div style={styles.cardMeta}>
                    {item.responsavel && <span>Responsavel: {item.responsavel}</span>}
                  </div>
                  {!readOnly && (
                    <div style={styles.cardAcoes}>
                      <button onClick={() => editar(item)} style={styles.btnIcon}><Icon name="edit" size={14} /></button>
                      <button onClick={() => excluir(item.id)} style={styles.btnIcon}><Icon name="trash" size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
  main: { maxWidth: '720px', margin: '0 auto', padding: '20px 16px 40px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-primary)', marginBottom: '20px' },
  form: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-secondary)', fontSize: '14px', minWidth: '100px' },
  btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' },
  btnSecondary: { background: 'var(--color-secondary)', color: 'var(--color-text)', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-soft)' },
  timeline: { position: 'relative', paddingLeft: '28px' },
  line: { position: 'absolute', left: '10px', top: 0, bottom: 0, width: '2px', background: 'var(--color-secondary)' },
  item: { position: 'relative', marginBottom: '16px' },
  dot: { position: 'absolute', left: '-24px', top: '14px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)', border: '2px solid var(--color-fundo)' },
  card: { background: '#fff', borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--color-secondary)' },
  cardHeader: { display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' },
  hora: { fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' },
  titulo: { fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' },
  cardMeta: { fontSize: '12px', color: 'var(--color-text-soft)', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' },
  cardAcoes: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  readOnlyBanner: { background: '#FFF3E6', border: '1px solid #F9A825', borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '16px' },
  readOnlyText: { fontSize: '13px', color: '#8B6F5E', fontFamily: 'var(--font-body)' },
};