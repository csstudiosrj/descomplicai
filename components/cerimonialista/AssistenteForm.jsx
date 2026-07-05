import React, { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Icon from '../ui/Icon';
import Button from '../../components/ui/Button';
import fetchAPI from '../../utils/fetchAPI';

export default function AssistenteForm({ assistente, cerimonialistaId, acessos, onSalvo, onClose }) {
  const isEditando = !!assistente;

  const [form, setForm] = useState({
    nome: assistente?.nome || '',
    email: assistente?.email || '',
    acesso: assistente?.acesso || 'operacional',
  });

  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  const handleChange = useCallback((campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (erros[campo]) {
      setErros((prev) => {
        const next = { ...prev };
        delete next[campo];
        return next;
      });
    }
  }, [erros]);

  const validar = () => {
    const novosErros = {};
    if (!form.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }
    if (!form.email.trim()) {
      novosErros.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      novosErros.email = 'E-mail inválido';
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setSalvando(true);

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      acesso: form.acesso,
    };

    try {
      let error;

      if (isEditando) {
        const { error: updError } = await supabase
          .from('cerimonialista_assistentes')
          .update(payload)
          .eq('id', assistente.id);
        error = updError;
      } else {
        // Para criar, usamos a API que lida com criação do usuário Auth
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData?.session?.access_token) {
          throw new Error(
            sessionError?.message ||
            'Sessão inválida ou expirada. Faça login novamente.'
          );
        }

        const res = await fetchAPI('/api/cerimonialista/assistentes/convidar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ ...payload, cerimonialista_id: cerimonialistaId }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Erro ao criar assistente');
        }
      }

      if (error) throw error;

      onSalvo();
      onClose();
    } catch (err) {
      console.error('[AssistenteForm]', err);
      setErros({ geral: err.message || 'Erro ao salvar. Tente novamente.' });
    } finally {
      setSalvando(false);
    }
  };

  const inputStyle = (campo) => ({
    width: '100%',
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${erros[campo] ? 'var(--color-danger)' : 'var(--color-border)'}`,
    backgroundColor: 'var(--color-white)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
  });

  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-medium)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-2)',
  };

  const grupoStyle = {
    marginBottom: 'var(--space-4)',
  };

  const erroStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-danger)',
    marginTop: 'var(--space-1)',
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Nome */}
      <div style={grupoStyle}>
        <label htmlFor="nome" style={labelStyle}>
          Nome <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <input
          id="nome"
          type="text"
          value={form.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          placeholder="Nome completo"
          style={inputStyle('nome')}
          required
        />
        {erros.nome && <p style={erroStyle}>{erros.nome}</p>}
      </div>

      {/* Email */}
      <div style={grupoStyle}>
        <label htmlFor="email" style={labelStyle}>
          E-mail <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="email@exemplo.com"
          disabled={isEditando}
          style={{
            ...inputStyle('email'),
            backgroundColor: isEditando ? 'var(--color-off-white)' : 'var(--color-white)',
            cursor: isEditando ? 'not-allowed' : 'text',
          }}
          required
        />
        {isEditando && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
            O e-mail não pode ser alterado
          </p>
        )}
        {erros.email && <p style={erroStyle}>{erros.email}</p>}
      </div>

      {/* Acesso */}
      <div style={grupoStyle}>
        <label htmlFor="acesso" style={labelStyle}>Nível de acesso</label>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {acessos.map((a) => (
            <label
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${form.acesso === a.id ? a.color : 'var(--color-border)'}`,
                backgroundColor: form.acesso === a.id ? a.bg : 'var(--color-white)',
                cursor: 'pointer',
                flex: 1,
                minWidth: '120px',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)',
              }}
            >
              <input
                type="radio"
                name="acesso"
                value={a.id}
                checked={form.acesso === a.id}
                onChange={(e) => handleChange('acesso', e.target.value)}
                style={{ accentColor: a.color }}
              />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: form.acesso === a.id ? a.color : 'var(--color-text-secondary)' }}>
                {a.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Erro geral */}
      {erros.geral && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)',
          }}
          role="alert"
        >
          <Icon name="alertCircle" size={18} />
          {erros.geral}
        </div>
      )}

      {/* Ações */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
        <Button variant="secondary" type="button" onClick={onClose} disabled={salvando}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit" disabled={salvando}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {salvando ? (
              <>
                <Icon name="refreshCw" size={16} />
                Salvando...
              </>
            ) : (
              <>
                <Icon name="save" size={16} />
                {isEditando ? 'Atualizar' : 'Adicionar'}
              </>
            )}
          </span>
        </Button>
      </div>
    </form>
  );
}