import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Input from '@/components/ui/Input';
import InputMoeda from '@/components/ui/InputMoeda';
import Button from '@/components/ui/Button';
import fetchAPI from '../../utils/fetchAPI';

const CATEGORIAS = [
  { id: 'planos', label: 'Planos e Preços', icon: '💰' },
  { id: 'emails', label: 'E-mails', icon: '✉️' },
  { id: 'feature_flags', label: 'Feature Flags', icon: '🚦' },
  { id: 'textos_legais', label: 'Textos Legais', icon: '📜' },
  { id: 'sistema', label: 'Sistema', icon: '⚙️' },
];

const EMAIL_TIPOS = [
  { prefixo: 'email_convite', label: 'Convite de Colaborador' },
  { prefixo: 'email_recuperacao', label: 'Recuperação de Senha' },
  { prefixo: 'email_lembrete_pagamento', label: 'Lembrete de Pagamento' },
];

const FEATURE_FLAGS = [
  { chave: 'modulo_chat_ativo', label: 'Chat' },
  { chave: 'modulo_mesas_ativo', label: 'Mesas' },
  { chave: 'modulo_contratos_ativo', label: 'Contratos' },
  { chave: 'modulo_vitrine_ativo', label: 'Vitrine' },
  { chave: 'modulo_cerimonialista_ativo', label: 'Portal do Cerimonialista' },
];

export default function AdminConfig() {
  const [abaAtiva, setAbaAtiva] = useState('planos');
  const [configs, setConfigs] = useState({});
  const [editados, setEditados] = useState({});
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAPI('/api/admin/configuracoes');
      if (!res.ok) throw new Error('Erro ao carregar');
      const json = await res.json();
      setConfigs(json.data || {});
      setEditados({});
    } catch (err) {
      mostrarToast('Erro ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function mostrarToast(msg, tipo = 'success') {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 4000);
  }

  function getValor(chave, padrao = '') {
    if (editados[chave] !== undefined) return editados[chave];
    const cat = configs[abaAtiva] || [];
    const cfg = cat.find((c) => c.chave === chave);
    return cfg ? cfg.valor : padrao;
  }

  function setValor(chave, valor) {
    setEditados((prev) => ({ ...prev, [chave]: valor }));
  }

  function temAlteracoes() {
    return Object.keys(editados).length > 0;
  }

  async function salvar() {
    if (!temAlteracoes()) return;
    setSalvando(true);
    try {
      const atualizacoes = Object.entries(editados).map(([chave, valor]) => ({ chave, valor: String(valor) }));
      const res = await fetchAPI('/api/admin/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ atualizacoes }),
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      mostrarToast('Configurações salvas com sucesso!');
      setEditados({});
      await carregar();
    } catch (err) {
      mostrarToast('Erro ao salvar configurações', 'error');
    } finally {
      setSalvando(false);
    }
  }

  function formatarCentavos(valor) {
    const num = parseInt(valor || 0, 10);
    return (num / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function centavosParaReaisInput(valor) {
    const num = parseInt(valor || 0, 10);
    return (num / 100).toFixed(2).replace('.', ',');
  }

  function reaisInputParaCentavos(valor) {
    const limpo = valor.replace(/[^\d,]/g, '').replace(',', '.');
    const num = parseFloat(limpo) || 0;
    return Math.round(num * 100);
  }

  // ─── ABA 1: PLANOS E PREÇOS ───
  function renderPlanos() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Memorial PDF</label>
            <InputMoeda
              value={centavosParaReaisInput(getValor('preco_memorial_pdf'))}
              onChange={(v) => setValor('preco_memorial_pdf', String(reaisInputParaCentavos(v)))}
              placeholder="R$ 197,00"
            />
            <p className="text-xs text-gray-400 mt-1">{formatarCentavos(getValor('preco_memorial_pdf'))}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Assinatura Mensal</label>
            <InputMoeda
              value={centavosParaReaisInput(getValor('preco_assinatura_mensal'))}
              onChange={(v) => setValor('preco_assinatura_mensal', String(reaisInputParaCentavos(v)))}
              placeholder="R$ 29,90"
            />
            <p className="text-xs text-gray-400 mt-1">{formatarCentavos(getValor('preco_assinatura_mensal'))}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Perfil Fornecedor</label>
            <InputMoeda
              value={centavosParaReaisInput(getValor('preco_perfil_fornecedor'))}
              onChange={(v) => setValor('preco_perfil_fornecedor', String(reaisInputParaCentavos(v)))}
              placeholder="R$ 19,90"
            />
            <p className="text-xs text-gray-400 mt-1">{formatarCentavos(getValor('preco_perfil_fornecedor'))}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-2">Dias de Trial (Fornecedor)</label>
          <Input
            type="number"
            value={getValor('trial_fornecedor_dias')}
            onChange={(e) => setValor('trial_fornecedor_dias', e.target.value)}
            placeholder="7"
          />
        </div>
      </div>
    );
  }

  // ─── ABA 2: E-MAILS ───
  function renderEmails() {
    return (
      <div className="space-y-6">
        {EMAIL_TIPOS.map((tipo) => {
          const assunto = getValor(`${tipo.prefixo}_assunto`);
          const corpo = getValor(`${tipo.prefixo}_corpo`);
          return (
            <div key={tipo.prefixo} className="bg-white rounded-xl border border-gray-200 p-5">
              <h4 className="font-semibold text-gray-900 mb-4">{tipo.label}</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Input
                    label="Assunto"
                    value={assunto}
                    onChange={(e) => setValor(`${tipo.prefixo}_assunto`, e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Corpo</label>
                    <textarea
                      value={corpo}
                      onChange={(e) => setValor(`${tipo.prefixo}_corpo`, e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-y"
                    />
                    <p className="text-xs text-gray-400 mt-1">Use {'{link}'} para o link dinâmico</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Preview</p>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">{assunto || '(sem assunto)'}</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{corpo ? corpo.replace('{link}', 'https://descomplicai.com/convite/abc123') : '(sem corpo)'}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ─── ABA 3: FEATURE FLAGS ───
  function renderFeatureFlags() {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="space-y-4">
          {FEATURE_FLAGS.map((flag) => {
            const ativo = getValor(flag.chave) === 'true';
            return (
              <div key={flag.chave} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{flag.label}</p>
                  <p className="text-sm text-gray-400">{flag.chave}</p>
                </div>
                <button
                  onClick={() => setValor(flag.chave, ativo ? 'false' : 'true')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    ativo ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      ativo ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── ABA 4: TEXTOS LEGAIS ───
  function renderTextosLegais() {
    const termos = getValor('texto_termos_uso');
    const privacidade = getValor('texto_privacidade');
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-900 mb-3">Termos de Uso</h4>
          <textarea
            value={termos}
            onChange={(e) => setValor('texto_termos_uso', e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-y"
          />
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Preview</p>
            <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">{termos}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-900 mb-3">Política de Privacidade</h4>
          <textarea
            value={privacidade}
            onChange={(e) => setValor('texto_privacidade', e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-y"
          />
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Preview</p>
            <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">{privacidade}</div>
          </div>
        </div>
      </div>
    );
  }

  // ─── ABA 5: SISTEMA ───
  function renderSistema() {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Orçamento Default (R$)</label>
          <Input
            type="number"
            value={getValor('orcamento_default')}
            onChange={(e) => setValor('orcamento_default', e.target.value)}
            placeholder="50000"
          />
          <p className="text-xs text-gray-400 mt-1">Orçamento sugerido para novos eventos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Dias de Lembrete de Pagamento</label>
          <Input
            type="number"
            value={getValor('dias_lembrete_pagamento')}
            onChange={(e) => setValor('dias_lembrete_pagamento', e.target.value)}
            placeholder="3"
          />
          <p className="text-xs text-gray-400 mt-1">Dias antes do vencimento para enviar lembrete</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Dias de Alerta de Tarefas</label>
          <Input
            type="number"
            value={getValor('dias_alerta_tarefas')}
            onChange={(e) => setValor('dias_alerta_tarefas', e.target.value)}
            placeholder="7"
          />
          <p className="text-xs text-gray-400 mt-1">Dias antes do evento para alertar tarefas pendentes</p>
        </div>
      </div>
    );
  }

  const renderAba = () => {
    switch (abaAtiva) {
      case 'planos': return renderPlanos();
      case 'emails': return renderEmails();
      case 'feature_flags': return renderFeatureFlags();
      case 'textos_legais': return renderTextosLegais();
      case 'sistema': return renderSistema();
      default: return null;
    }
  };

  return (
    <AdminLayout title="Configurações">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.tipo === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Abas */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setAbaAtiva(cat.id); setEditados({}); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              abaAtiva === cat.id
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500" />
        </div>
      ) : (
        <>
          {renderAba()}

          {/* Botão Salvar */}
          <div className="mt-6 flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              loading={salvando}
              disabled={!temAlteracoes()}
              onClick={salvar}
            >
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            {temAlteracoes() && (
              <span className="text-sm text-amber-600 font-medium">Você tem alterações não salvas</span>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
