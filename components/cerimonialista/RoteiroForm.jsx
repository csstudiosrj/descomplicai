import React, { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

export default function RoteiroForm({ item, onSave, onCancel, eventoId }) {
  const [horario, setHorario] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [status, setStatus] = useState('pendente');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (item) {
      setHorario(item.horario || '');
      setTitulo(item.titulo || '');
      setDescricao(item.descricao || '');
      setResponsavel(item.responsavel || '');
      setStatus(item.status || 'pendente');
    } else {
      setHorario('');
      setTitulo('');
      setDescricao('');
      setResponsavel('');
      setStatus('pendente');
    }
    setErro('');
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!horario.trim() || !titulo.trim()) {
      setErro('Horário e título são obrigatórios.');
      return;
    }

    setSalvando(true);
    try {
      await onSave({
        id: item?.id,
        evento_id: eventoId,
        horario: horario.trim(),
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        responsavel: responsavel.trim() || null,
        status,
      });
    } catch (err) {
      setErro(err.message || 'Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--color-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        zIndex: 'var(--z-modal)',
      }}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="roteiro-form-titulo"
    >
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90dvh',
          overflow: 'auto',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-5) var(--space-5) var(--space-3)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            id="roteiro-form-titulo"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {item ? 'Editar item' : 'Novo item do roteiro'}
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-1)',
            }}
            aria-label="Fechar modal"
          >
            <Icon name="close" size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-4) var(--space-5) var(--space-5)' }}>
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {/* Horário */}
            <div>
              <label
                htmlFor="horario"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Horário <span aria-label="obrigatório">*</span>
              </label>
              <input
                id="horario"
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Título */}
            <div>
              <label
                htmlFor="titulo"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Título <span aria-label="obrigatório">*</span>
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Início da cerimônia"
                required
                maxLength={120}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Descrição */}
            <div>
              <label
                htmlFor="descricao"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Descrição
              </label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes e observações..."
                rows={3}
                maxLength={500}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Responsável */}
            <div>
              <label
                htmlFor="responsavel"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Responsável
              </label>
              <input
                id="responsavel"
                type="text"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Ex: Cerimonialista / Fotógrafo"
                maxLength={100}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em andamento</option>
                <option value="concluido">Concluído</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginTop: 'var(--space-4)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-danger-light)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-danger)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
              }}
              role="alert"
            >
              <Icon name="alertCircle" size={16} />
              {erro}
            </div>
          )}

          {/* Ações */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-6)',
            }}
          >
            <Button variant="secondary" onClick={onCancel} type="button" fullWidth>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" fullWidth disabled={salvando}>
              {salvando ? 'Salvando...' : item ? 'Salvar alterações' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
