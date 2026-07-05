import React, { useEffect, useState } from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import fetchAPI from '../../utils/fetchAPI';

const MODULOS = [
  { key: 'fornecedores', label: 'Fornecedores', icone: 'store' },
  { key: 'financeiro', label: 'Financeiro', icone: 'dollar' },
  { key: 'tarefas', label: 'Tarefas', icone: 'checklist' },
  { key: 'convidados', label: 'Convidados', icone: 'users' },
  { key: 'chat', label: 'Chat', icone: 'chat' },
  { key: 'cronograma', label: 'Cronograma', icone: 'cronograma' },
  { key: 'contratos', label: 'Contratos', icone: 'contratos' },
  { key: 'mesas', label: 'Mesas', icone: 'mesas' },
];

export default function PermissoesPainel({ eventoId, cerimonialistaId }) {
  const [permissoes, setPermissoes] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (!eventoId) return;
    buscarPermissoes();
  }, [eventoId]);

  const buscarPermissoes = async () => {
    setCarregando(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return;

      const res = await fetchAPI(`/api/cerimonialista/permissao?evento_id=${eventoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Evento sem cerimonialista vinculado ou sem permissão
        setPermissoes(null);
        setCarregando(false);
        return;
      }

      const json = await res.json();
      setPermissoes(json.permissoes);
    } catch (err) {
      console.error('Erro ao buscar permissões:', err);
    } finally {
      setCarregando(false);
    }
  };

  const toggleVer = (key) => {
    setPermissoes((prev) => {
      if (!prev) return prev;
      const novo = { ...prev };
      novo[`ver_${key}`] = !novo[`ver_${key}`];
      // Se desmarca "ver", desmarca "editar" também
      if (!novo[`ver_${key}`]) {
        novo[`editar_${key}`] = false;
      }
      return novo;
    });
    setSalvo(false);
  };

  const toggleEditar = (key) => {
    setPermissoes((prev) => {
      if (!prev) return prev;
      const novo = { ...prev };
      novo[`editar_${key}`] = !novo[`editar_${key}`];
      // Se marca "editar", marca "ver" também
      if (novo[`editar_${key}`]) {
        novo[`ver_${key}`] = true;
      }
      return novo;
    });
    setSalvo(false);
  };

  const salvar = async () => {
    if (!permissoes || !eventoId || !cerimonialistaId) return;
    setSalvando(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return;

      const payload = {
        evento_id: eventoId,
        cerimonialista_id: cerimonialistaId,
        ver_fornecedores: permissoes.ver_fornecedores,
        editar_fornecedores: permissoes.editar_fornecedores,
        ver_financeiro: permissoes.ver_financeiro,
        editar_financeiro: permissoes.editar_financeiro,
        ver_tarefas: permissoes.ver_tarefas,
        editar_tarefas: permissoes.editar_tarefas,
        ver_convidados: permissoes.ver_convidados,
        editar_convidados: permissoes.editar_convidados,
        ver_chat: permissoes.ver_chat,
        editar_chat: permissoes.editar_chat,
        ver_cronograma: permissoes.ver_cronograma,
        editar_cronograma: permissoes.editar_cronograma,
        ver_contratos: permissoes.ver_contratos,
        editar_contratos: permissoes.editar_contratos,
        ver_mesas: permissoes.ver_mesas,
        editar_mesas: permissoes.editar_mesas,
        ver_memorial: true,
      };

      const res = await fetchAPI('/api/cerimonialista/permissao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSalvo(true);
        setTimeout(() => setSalvo(false), 3000);
      }
    } catch (err) {
      console.error('Erro ao salvar permissões:', err);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div style={styles.loading}>
        <p style={styles.loadingText}>Carregando permissões...</p>
      </div>
    );
  }

  if (!permissoes) {
    return (
      <div style={styles.semCerimonialista}>
        <Icon name="info" size={24} color="var(--color-text-muted)" />
        <p style={styles.semCerimonialistaText}>
          Nenhum cerimonialista vinculado a este evento.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.titulo}>Acesso do cerimonialista</h3>
        <p style={styles.subtitulo}>
          Defina o que seu cerimonialista pode ver e editar no seu evento.
        </p>
      </div>

      <div style={styles.legenda}>
        <span style={styles.legendaItem}>
          <span style={styles.legendaIconeVer}><Icon name="eye" size={12} /></span>
          Visualizar
        </span>
        <span style={styles.legendaItem}>
          <span style={styles.legendaIconeEditar}><Icon name="edit" size={12} /></span>
          Editar
        </span>
      </div>

      <div style={styles.lista}>
        {MODULOS.map((mod) => {
          const verKey = `ver_${mod.key}`;
          const editarKey = `editar_${mod.key}`;
          const podeVer = permissoes[verKey];
          const podeEditar = permissoes[editarKey];

          return (
            <div key={mod.key} style={styles.item}>
              <div style={styles.itemInfo}>
                <Icon name={mod.icone} size={18} color="var(--color-text-muted)" />
                <span style={styles.itemLabel}>{mod.label}</span>
              </div>
              <div style={styles.itemAcoes}>
                <button
                  onClick={() => toggleVer(mod.key)}
                  style={styles.btnToggle(podeVer, 'ver')}
                  aria-label={podeVer ? `Remover visualização de ${mod.label}` : `Permitir visualização de ${mod.label}`}
                  aria-pressed={podeVer}
                >
                  <Icon name="eye" size={14} />
                  {podeVer ? 'Sim' : 'Não'}
                </button>
                <button
                  onClick={() => toggleEditar(mod.key)}
                  style={styles.btnToggle(podeEditar, 'editar')}
                  aria-label={podeEditar ? `Remover edição de ${mod.label}` : `Permitir edição de ${mod.label}`}
                  aria-pressed={podeEditar}
                  disabled={!podeVer}
                >
                  <Icon name="edit" size={14} />
                  {podeEditar ? 'Sim' : 'Não'}
                </button>
              </div>
            </div>
          );
        })}

        {/* Memorial — sempre visível, não editável */}
        <div key="memorial" style={styles.item}>
          <div style={styles.itemInfo}>
            <Icon name="memorial" size={18} color="var(--color-text-muted)" />
            <span style={styles.itemLabel}>Memorial</span>
          </div>
          <div style={styles.itemAcoes}>
            <span style={styles.badgeFixo}>
              <Icon name="eye" size={14} />
              Sempre visível
            </span>
            <span style={styles.badgeFixoDesabilitado}>
              <Icon name="edit" size={14} />
              Somente leitura
            </span>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <Button
          variant="primary"
          onClick={salvar}
          disabled={salvando}
          style={{ opacity: salvando ? 0.6 : 1 }}
        >
          {salvando ? 'Salvando...' : salvo ? 'Salvo!' : 'Salvar permissões'}
        </Button>
        {salvo && (
          <span style={styles.salvoMsg}>
            <Icon name="checkCircle" size={14} color="var(--color-success)" />
            Permissões atualizadas
          </span>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  header: {
    padding: 'var(--space-5)',
    borderBottom: '1px solid var(--color-border)',
  },
  titulo: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-lg)',
    color: 'var(--color-brand)',
    margin: 0,
    fontWeight: 'var(--font-normal)',
  },
  subtitulo: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    margin: 'var(--space-1) 0 0',
  },

  legenda: {
    display: 'flex',
    gap: 'var(--space-4)',
    padding: 'var(--space-3) var(--space-5)',
    backgroundColor: 'var(--color-off-white)',
    borderBottom: '1px solid var(--color-border-light)',
  },
  legendaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },
  legendaIconeVer: {
    color: 'var(--color-brand)',
  },
  legendaIconeEditar: {
    color: 'var(--color-success)',
  },

  lista: {
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-4) var(--space-5)',
    borderBottom: '1px solid var(--color-border-light)',
    gap: 'var(--space-4)',
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    flex: 1,
    minWidth: 0,
  },
  itemLabel: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
    fontWeight: 'var(--font-medium)',
  },
  itemAcoes: {
    display: 'flex',
    gap: 'var(--space-2)',
  },
  btnToggle: (ativo, tipo) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    border: `1.5px solid ${ativo ? (tipo === 'ver' ? 'var(--color-brand)' : 'var(--color-success)') : 'var(--color-border)'}`,
    backgroundColor: ativo ? (tipo === 'ver' ? 'var(--color-brand-light)' : 'var(--color-success-light)') : 'var(--color-surface)',
    color: ativo ? (tipo === 'ver' ? 'var(--color-brand)' : 'var(--color-success)') : 'var(--color-text-muted)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-medium)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  }),
  badgeFixo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--color-brand)',
    backgroundColor: 'var(--color-brand-light)',
    color: 'var(--color-brand)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-medium)',
  },
  badgeFixoDesabilitado: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-medium)',
  },

  footer: {
    padding: 'var(--space-4) var(--space-5)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  salvoMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-success)',
    fontWeight: 'var(--font-medium)',
  },

  loading: {
    padding: 'var(--space-8)',
    textAlign: 'center',
  },
  loadingText: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
  },
  semCerimonialista: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-5)',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
  },
  semCerimonialistaText: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    margin: 0,
  },
};
