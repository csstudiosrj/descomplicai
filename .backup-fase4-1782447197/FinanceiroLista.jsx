import React from 'react';
import Icon from '../ui/Icon';

function formatarValor(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const data = new Date(dataStr + 'T00:00:00');
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function agruparPorMes(lancamentos) {
  const grupos = {};
  lancamentos.forEach((l) => {
    const data = l.data_vencimento ? new Date(l.data_vencimento + 'T00:00:00') : new Date();
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    const label = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    if (!grupos[chave]) grupos[chave] = { label, items: [] };
    grupos[chave].items.push(l);
  });
  return Object.entries(grupos).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function FinanceiroLista({ lancamentos, loading, tipos, categorias, onTogglePago, onEditar, onExcluir }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando lançamentos...</p>
      </div>
    );
  }

  if (lancamentos.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--space-12) var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <Icon name="receipt" size={48} color="var(--color-text-muted)" />
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-primary)',
            marginTop: 'var(--space-4)',
          }}
        >
          Nenhum lançamento
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
          Crie seu primeiro lançamento para começar.
        </p>
      </div>
    );
  }

  const grupos = agruparPorMes(lancamentos);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {grupos.map(([chave, { label, items }]) => {
        const totalMes = items.reduce((s, l) => s + (l.valor || 0), 0);
        return (
          <div key={chave}>
            {/* Cabeçalho do mês */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-3)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  textTransform: 'capitalize',
                }}
              >
                {label}
              </h3>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {formatarValor(totalMes)}
              </span>
            </div>

            {/* Itens */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {items.map((l) => {
                const tipoInfo = tipos.find((t) => t.id === l.tipo) || tipos[0];
                const catLabel = categorias[l.tipo]?.find((c) => c.id === l.categoria)?.label || l.categoria || '—';

                return (
                  <div
                    key={l.id}
                    style={{
                      backgroundColor: 'var(--color-white)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Toggle pago */}
                    <button
                      onClick={() => onTogglePago(l.id, l.pago)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 'var(--space-2)',
                        color: l.pago ? 'var(--color-success)' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                      aria-label={l.pago ? 'Marcar como pendente' : 'Marcar como pago'}
                      title={l.pago ? 'Pago' : 'Pendente'}
                    >
                      <Icon name={l.pago ? 'checkSquare' : 'square'} size={20} />
                    </button>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                        <span
                          style={{
                            padding: 'var(--space-1) var(--space-2)',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: tipoInfo.bg,
                            color: tipoInfo.color,
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-medium)',
                          }}
                        >
                          {tipoInfo.label}
                        </span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {catLabel}
                        </span>
                      </div>
                      <p
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-medium)',
                          color: 'var(--color-text-primary)',
                          wordBreak: 'break-word',
                        }}
                      >
                        {l.descricao || 'Sem descrição'}
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                        Vencimento: {formatarData(l.data_vencimento)}
                      </p>
                    </div>

                    {/* Valor + ações */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-semibold)',
                          color: l.tipo === 'receita' ? 'var(--color-success)' : 'var(--color-danger)',
                        }}
                      >
                        {l.tipo === 'receita' ? '+' : '-'}{formatarValor(l.valor)}
                      </span>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <button
                          onClick={() => onEditar(l)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-muted)',
                            padding: 'var(--space-1)',
                          }}
                          aria-label="Editar"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          onClick={() => onExcluir(l.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-danger)',
                            padding: 'var(--space-1)',
                          }}
                          aria-label="Excluir"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
