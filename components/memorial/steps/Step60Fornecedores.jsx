// Bloco K — Preview de fornecedores pendentes (antes da conclusão/PDF)
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import { gerarFornecedoresNecessarios } from '../../../utils/fornecedores-inteligente';
import { getTermos } from "../../../utils/linguagemCasal";

export default function Step60Fornecedores({ onConcluir, estado }) {
  // Array COMPLETO com todos os status (contratado, pendente, omitido)
  const todosFornecedores = useMemo(
    () => gerarFornecedoresNecessarios(estado || {}),
    [estado]
  );

  // Para o preview, exibe apenas os pendentes (não contratados, não omitidos)
  const pendentes = useMemo(
    () => todosFornecedores.filter((f) => f.status === 'pendente'),
    [todosFornecedores]
  );

  // Resumo para o topo
  const resumo = useMemo(() => {
    const total = todosFornecedores.length;
    const contratados = todosFornecedores.filter((f) => f.status === 'contratado').length;
    const pendentesCount = todosFornecedores.filter((f) => f.status === 'pendente').length;
    const omitidos = todosFornecedores.filter((f) => f.status === 'omitido').length;
    return { total, contratados, pendentesCount, omitidos };
  }, [todosFornecedores]);

  // Agrupa os pendentes por categoria para exibição
  const agrupados = useMemo(() => {
    const grupos = {};
    pendentes.forEach((f) => {
      if (!grupos[f.categoria]) grupos[f.categoria] = [];
      grupos[f.categoria].push(f.nome);
    });
    return Object.entries(grupos);
  }, [pendentes]);

  const handleConfirmar = (event) => {
    event.preventDefault();
    // Passa o ARRAY COMPLETO (todos os status) para o onConcluir
    // O MemorialOrchestrator salva isso em fornecedoresNecessarios no estado
    if (onConcluir) onConcluir(todosFornecedores);
  };

  return (
    <div
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        animation: 'fadeInUp 300ms ease-out',
      }}
    >
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          color: 'var(--color-text-primary)',
        }}
      >
        Seus fornecedores sugeridos
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-secondary)',
        }}
      >
        Com base em todas as suas escolhas, identificamos as categorias de
        fornecedores que ainda precisam ser resolvidos para seu evento:
      </p>

      {/* Resumo */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--color-text-primary)' }}>{resumo.pendentesCount}</strong> pendentes
        </div>
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--color-brand)' }}>{resumo.contratados}</strong> já contratados
        </div>
        {resumo.omitidos > 0 && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <strong style={{ color: 'var(--color-text-muted)' }}>{resumo.omitidos}</strong> não necessários
          </div>
        )}
      </div>

      {/* Lista de pendentes agrupados por categoria */}
      {agrupados.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {agrupados.map(([categoria, nomes]) => (
            <Card key={categoria} variant="default" padding="md">
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-brand)',
                  fontSize: 'var(--text-sm)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {categoria}
              </div>
              {nomes.map((nome, i) => (
                <div
                  key={nome}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-2) 0',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text-primary)',
                    borderBottom:
                      i < nomes.length - 1
                        ? '1px solid var(--color-border)'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-brand)',
                      flexShrink: 0,
                    }}
                  />
                  <span>{nome}</span>
                </div>
              ))}
            </Card>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-lg)',
            }}
          >
            🎉 Parabéns! Parece que você já resolveu todos os fornecedores principais.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              marginTop: 'var(--space-2)',
            }}
          >
            A lista completa estará disponível no PDF e no painel de controle.
          </p>
        </div>
      )}

      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-brand-lighter)',
          border: '1px solid var(--color-brand-light)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-brand-dark)',
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          Você pode adicionar, remover ou substituir fornecedores depois no
          painel. Esta é apenas uma prévia do que ainda falta resolver.
        </p>
      </div>

      <button
        type="button"
        aria-label="Confirmar resposta"
        onClick={handleConfirmar}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-4) var(--space-8)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: 'var(--color-brand)',
          color: 'var(--color-white)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-semibold)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        Finalizar memorial
      </button>
    </div>
  );
}

Step60Fornecedores.propTypes = {
  onConcluir: PropTypes.func.isRequired,
  estado: PropTypes.object,
};

export { Step60Fornecedores };


  const perfil = estadoAtual?.perfilCasal || "nao-especificar";
  const termos = getTermos(perfil);
