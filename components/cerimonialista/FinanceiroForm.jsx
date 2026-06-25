import React, { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

function formatarMoedaInput(valor) {
  if (!valor) return '';
  const num = parseFloat(valor.toString().replace(/[^\d]/g, '')) / 100;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
}

function parseMoeda(valorStr) {
  if (!valorStr) return 0;
  const limpo = valorStr.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(limpo);
  return isNaN(num) ? 0 : num;
}

export default function FinanceiroForm({ lancamento, cerimonialistaId, tipos, categorias, onSalvo, onClose }) {
  const isEditando = !!lancamento;

  const [form, setForm] = useState({
    tipo: lancamento?.tipo || 'receita',
    categoria: lancamento?.categoria || '',
    descricao: lancamento?.descricao || '',
    valor: lancamento?.valor ? formatarMoedaInput(lancamento.valor * 100) : '',
    data_vencimento: lancamento?.data_vencimento || '',
    pago: lancamento?.pago || false,
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
    setForm((prev) => ({ ...prev, valor: formatado }));
  }, []);

  const validar = () => {
    const novosErros = {};
    if (!form.valor || parseMoeda(form.valor) <= 0) {
      novosErros.valor = 'Valor deve ser maior que zero';
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setSalvando(true);

    const payload = {
      tipo: form.tipo,
      categoria: form.categoria?.trim() || null,
      descricao: form.descricao?.trim() || null,
      valor: parseMoeda(form.valor),
      data_vencimento: form.data_vencimento || null,
      pago: form.pago,
    };

    try {
      let error;

      if (isEditando) {
        const { error: updError } = await supabase
          .from('cerimonialista_financeiro')
          .update(payload)
          .eq('id', lancamento.id);
        error = updError;
      } else {
        const { error: insError } = await supabase
          .from('cerimonialista_financeiro')
          .insert({ ...payload, cerimonialista_id: cerimonialistaId });
        error = insError;
      }

      if (error) throw error;

      onSalvo();
      onClose();
    } catch (err) {
      console.error('[FinanceiroForm]', err);
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

  const cats = categorias[form.tipo] || [];

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Tipo */}
      <div style={grupoStyle}>
        <label htmlFor="tipo" style={labelStyle}>Tipo</label>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {tipos.map((t) => (
            <label
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${form.tipo === t.id ? t.color : 'var(--color-border)'}`,
                backgroundColor: form.tipo === t.id ? t.bg : 'var(--color-white)',
                cursor: 'pointer',
                flex: 1,
                justifyContent: 'center',
                transition: 'all var(--transition-fast)',
              }}
            >
              <input
                type="radio"
                name="tipo"
                value={t.id}
                checked={form.tipo === t.id}
                onChange={(e) => handleChange('tipo', e.target.value)}
                style={{ accentColor: t.color }}
              />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: form.tipo === t.id ? t.color : 'var(--color-text-secondary)' }}>
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Categoria + Valor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', ...grupoStyle }}>
        <div>
          <label htmlFor="categoria" style={labelStyle}>Categoria</label>
          <select
            id="categoria"
            value={form.categoria}
            onChange={(e) => handleChange('categoria', e.target.value)}
            style={inputStyle('categoria')}
          >
            <option value="">Selecione...</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="valor" style={labelStyle}>
            Valor <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            id="valor"
            type="text"
            inputMode="decimal"
            value={form.valor}
            onChange={(e) => handleMoedaChange(e.target.value)}
            placeholder="R$ 0,00"
            style={inputStyle('valor')}
          />
          {erros.valor && <p style={erroStyle}>{erros.valor}</p>}
        </div>
      </div>

      {/* Descrição */}
      <div style={grupoStyle}>
        <label htmlFor="descricao" style={labelStyle}>Descrição</label>
        <input
          id="descricao"
          type="text"
          value={form.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
          placeholder="Ex: Sinal do casal Silva"
          style={inputStyle('descricao')}
        />
      </div>

      {/* Data + Pago */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', ...grupoStyle }}>
        <div>
          <label htmlFor="data_vencimento" style={labelStyle}>Data de vencimento</label>
          <input
            id="data_vencimento"
            type="date"
            value={form.data_vencimento}
            onChange={(e) => handleChange('data_vencimento', e.target.value)}
            style={inputStyle('data_vencimento')}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 'var(--space-3)' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <input
              type="checkbox"
              checked={form.pago}
              onChange={(e) => handleChange('pago', e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-success)' }}
            />
            Já está pago/recebido
          </label>
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
                {isEditando ? 'Atualizar' : 'Criar Lançamento'}
              </>
            )}
          </span>
        </Button>
      </div>
    </form>
  );
}
