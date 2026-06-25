import React, { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

function formatarMoedaInput(valor) {
  if (!valor) return '';
  const num = parseFloat(valor.toString().replace(/[^\d]/g, '')) / 100;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function parseMoeda(valorStr) {
  if (!valorStr) return null;
  const limpo = valorStr.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(limpo);
  return isNaN(num) ? null : num;
}

export default function LeadForm({ lead, cerimonialistaId, estagios, onSalvo, onClose }) {
  const isEditando = !!lead;

  const [form, setForm] = useState({
    nome_lead: lead?.nome_lead || '',
    email: lead?.email || '',
    telefone: lead?.telefone || '',
    tipo_evento: lead?.tipo_evento || '',
    data_prevista: lead?.data_prevista || '',
    valor_proposta: lead?.valor_proposta ? formatarMoedaInput(lead.valor_proposta * 100) : '',
    estagio: lead?.estagio || 'contato_inicial',
    fonte: lead?.fonte || '',
    notas: lead?.notas || '',
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

  const handleMoedaChange = useCallback((valor) => {
    const apenasNumeros = valor.replace(/[^\d]/g, '');
    const formatado = formatarMoedaInput(apenasNumeros);
    setForm((prev) => ({ ...prev, valor_proposta: formatado }));
  }, []);

  const validar = () => {
    const novosErros = {};
    if (!form.nome_lead.trim()) {
      novosErros.nome_lead = 'Nome do lead é obrigatório';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
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
      nome_lead: form.nome_lead.trim(),
      email: form.email.trim() || null,
      telefone: form.telefone.trim() || null,
      tipo_evento: form.tipo_evento.trim() || null,
      data_prevista: form.data_prevista || null,
      valor_proposta: parseMoeda(form.valor_proposta),
      estagio: form.estagio,
      fonte: form.fonte.trim() || null,
      notas: form.notas.trim() || null,
    };

    try {
      let error;

      if (isEditando) {
        const { error: updError } = await supabase
          .from('cerimonialista_leads')
          .update({ ...payload, atualizado_em: new Date().toISOString() })
          .eq('id', lead.id);
        error = updError;
      } else {
        const { error: insError } = await supabase
          .from('cerimonialista_leads')
          .insert({ ...payload, cerimonialista_id: cerimonialistaId });
        error = insError;
      }

      if (error) throw error;

      onSalvo();
      onClose();
    } catch (err) {
      console.error('[LeadForm]', err);
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
        <label htmlFor="nome_lead" style={labelStyle}>
          Nome do lead <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <input
          id="nome_lead"
          type="text"
          value={form.nome_lead}
          onChange={(e) => handleChange('nome_lead', e.target.value)}
          placeholder="Ex: Maria e João"
          style={inputStyle('nome_lead')}
          required
        />
        {erros.nome_lead && <p style={erroStyle}>{erros.nome_lead}</p>}
      </div>

      {/* Email + Telefone */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', ...grupoStyle }}>
        <div>
          <label htmlFor="email" style={labelStyle}>E-mail</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="email@exemplo.com"
            style={inputStyle('email')}
          />
          {erros.email && <p style={erroStyle}>{erros.email}</p>}
        </div>
        <div>
          <label htmlFor="telefone" style={labelStyle}>Telefone</label>
          <input
            id="telefone"
            type="tel"
            value={form.telefone}
            onChange={(e) => handleChange('telefone', e.target.value)}
            placeholder="(11) 99999-9999"
            style={inputStyle('telefone')}
          />
        </div>
      </div>

      {/* Tipo de evento + Data */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', ...grupoStyle }}>
        <div>
          <label htmlFor="tipo_evento" style={labelStyle}>Tipo de evento</label>
          <input
            id="tipo_evento"
            type="text"
            value={form.tipo_evento}
            onChange={(e) => handleChange('tipo_evento', e.target.value)}
            placeholder="Ex: Casamento, Festa de 15 anos"
            style={inputStyle('tipo_evento')}
          />
        </div>
        <div>
          <label htmlFor="data_prevista" style={labelStyle}>Data prevista</label>
          <input
            id="data_prevista"
            type="date"
            value={form.data_prevista}
            onChange={(e) => handleChange('data_prevista', e.target.value)}
            style={inputStyle('data_prevista')}
          />
        </div>
      </div>

      {/* Valor + Estágio */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', ...grupoStyle }}>
        <div>
          <label htmlFor="valor_proposta" style={labelStyle}>Valor da proposta</label>
          <input
            id="valor_proposta"
            type="text"
            inputMode="decimal"
            value={form.valor_proposta}
            onChange={(e) => handleMoedaChange(e.target.value)}
            placeholder="R$ 0,00"
            style={inputStyle('valor_proposta')}
          />
        </div>
        <div>
          <label htmlFor="estagio" style={labelStyle}>Estágio</label>
          <select
            id="estagio"
            value={form.estagio}
            onChange={(e) => handleChange('estagio', e.target.value)}
            style={inputStyle('estagio')}
          >
            {estagios.map((e) => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fonte */}
      <div style={grupoStyle}>
        <label htmlFor="fonte" style={labelStyle}>Fonte</label>
        <input
          id="fonte"
          type="text"
          value={form.fonte}
          onChange={(e) => handleChange('fonte', e.target.value)}
          placeholder="Ex: Instagram, Indicação, Site"
          style={inputStyle('fonte')}
        />
      </div>

      {/* Notas */}
      <div style={grupoStyle}>
        <label htmlFor="notas" style={labelStyle}>Notas</label>
        <textarea
          id="notas"
          rows={3}
          value={form.notas}
          onChange={(e) => handleChange('notas', e.target.value)}
          placeholder="Observações sobre o lead..."
          style={{
            ...inputStyle('notas'),
            resize: 'vertical',
            minHeight: '80px',
          }}
        />
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
                {isEditando ? 'Atualizar' : 'Criar Lead'}
              </>
            )}
          </span>
        </Button>
      </div>
    </form>
  );
}
