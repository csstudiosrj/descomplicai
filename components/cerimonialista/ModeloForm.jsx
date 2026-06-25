import React, { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

export default function ModeloForm({ modelo, cerimonialistaId, tipos, onSalvo, onClose }) {
  const isEditando = !!modelo;

  const [form, setForm] = useState({
    nome: modelo?.nome || '',
    tipo: modelo?.tipo || 'outro',
    conteudo: modelo?.conteudo || '',
    variaveisTexto: modelo?.variaveis
      ? Object.entries(modelo.variaveis)
          .map(([k, v]) => `${k}=${v}`)
          .join('\n')
      : '',
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

  const parseVariaveis = (texto) => {
    if (!texto.trim()) return null;
    const vars = {};
    texto.split('\n').forEach((linha) => {
      const [chave, ...resto] = linha.split('=');
      if (chave?.trim()) {
        vars[chave.trim()] = resto.join('=').trim() || '';
      }
    });
    return Object.keys(vars).length > 0 ? vars : null;
  };

  const validar = () => {
    const novosErros = {};
    if (!form.nome.trim()) {
      novosErros.nome = 'Nome do modelo é obrigatório';
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
      tipo: form.tipo || null,
      conteudo: form.conteudo.trim() || null,
      variaveis: parseVariaveis(form.variaveisTexto),
    };

    try {
      let error;

      if (isEditando) {
        const { error: updError } = await supabase
          .from('cerimonialista_modelos')
          .update(payload)
          .eq('id', modelo.id);
        error = updError;
      } else {
        const { error: insError } = await supabase
          .from('cerimonialista_modelos')
          .insert({ ...payload, cerimonialista_id: cerimonialistaId });
        error = insError;
      }

      if (error) throw error;

      onSalvo();
      onClose();
    } catch (err) {
      console.error('[ModeloForm]', err);
      setErros({ geral: 'Erro ao salvar. Tente novamente.' });
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
          Nome do modelo <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <input
          id="nome"
          type="text"
          value={form.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          placeholder="Ex: Contrato de Prestação de Serviços"
          style={inputStyle('nome')}
          required
        />
        {erros.nome && <p style={erroStyle}>{erros.nome}</p>}
      </div>

      {/* Tipo */}
      <div style={grupoStyle}>
        <label htmlFor="tipo" style={labelStyle}>Tipo</label>
        <select
          id="tipo"
          value={form.tipo}
          onChange={(e) => handleChange('tipo', e.target.value)}
          style={inputStyle('tipo')}
        >
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Conteúdo */}
      <div style={grupoStyle}>
        <label htmlFor="conteudo" style={labelStyle}>Conteúdo</label>
        <textarea
          id="conteudo"
          rows={8}
          value={form.conteudo}
          onChange={(e) => handleChange('conteudo', e.target.value)}
          placeholder="Digite o conteúdo do modelo... Use {{variavel}} para campos dinâmicos."
          style={{
            ...inputStyle('conteudo'),
            resize: 'vertical',
            minHeight: '120px',
            fontFamily: 'var(--font-body)',
            lineHeight: 'var(--leading-normal)',
          }}
        />
      </div>

      {/* Variáveis */}
      <div style={grupoStyle}>
        <label htmlFor="variaveis" style={labelStyle}>
          Variáveis
          <span style={{ fontWeight: 'var(--font-normal)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
            (uma por linha: nome=valor)
          </span>
        </label>
        <textarea
          id="variaveis"
          rows={4}
          value={form.variaveisTexto}
          onChange={(e) => handleChange('variaveisTexto', e.target.value)}
          placeholder={'nome_casal=João e Maria\ndata_evento=25/12/2026\nlocal=Fazenda Solaris'}
          style={{
            ...inputStyle('variaveis'),
            resize: 'vertical',
            minHeight: '80px',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
          }}
        />
      </div>

      {/* Preview de variáveis no conteúdo */}
      {form.conteudo && form.variaveisTexto && (
        <div
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-off-white)',
            border: '1px solid var(--color-border)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <p style={{ ...labelStyle, marginBottom: 'var(--space-2)' }}>Preview</p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-normal)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {(() => {
              const vars = parseVariaveis(form.variaveisTexto) || {};
              let preview = form.conteudo;
              Object.entries(vars).forEach(([k, v]) => {
                preview = preview.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), v || `{{${k}}}`);
              });
              return preview;
            })()}
          </p>
        </div>
      )}

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
                {isEditando ? 'Atualizar' : 'Criar Modelo'}
              </>
            )}
          </span>
        </Button>
      </div>
    </form>
  );
}
