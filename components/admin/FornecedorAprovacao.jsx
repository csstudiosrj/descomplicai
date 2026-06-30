import React, { useState } from 'react';

export default function FornecedorAprovacao({ fornecedores = [], onAprovar, onSuspender }) {
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const handleAprovar = async (id) => {
    setLoadingId(id);
    try {
      await onAprovar(id);
      setToast({ type: 'success', message: 'Fornecedor aprovado com sucesso!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Erro ao aprovar fornecedor' });
    } finally {
      setLoadingId(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSuspender = async (id) => {
    if (!confirm('Tem certeza que deseja suspender este fornecedor?')) return;
    setLoadingId(id);
    try {
      await onSuspender(id);
      setToast({ type: 'success', message: 'Fornecedor suspenso com sucesso!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Erro ao suspender fornecedor' });
    } finally {
      setLoadingId(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Fornecedores Pendentes</h3>
          <p className="text-sm text-gray-500">Aprovação e suspensão</p>
        </div>
        <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
          {fornecedores.length} pendentes
        </span>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="space-y-3">
        {fornecedores.length === 0 && (
          <p className="text-center text-gray-400 py-6 text-sm">Nenhum fornecedor pendente</p>
        )}
        {fornecedores.map((f) => (
          <div key={f.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{f.nome_empresa}</p>
              <p className="text-sm text-gray-500">{f.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                {f.cidade}, {f.estado} • Cadastrado em {new Date(f.criado_em).toLocaleDateString('pt-BR')}
              </p>
              <div className="flex gap-2 mt-2">
                {!f.ativo && (
                  <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded">
                    Inativo
                  </span>
                )}
                {f.plano === 'trial' && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded">
                    Trial
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!f.ativo && (
                <button
                  onClick={() => handleAprovar(f.id)}
                  disabled={loadingId === f.id}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {loadingId === f.id ? '...' : 'Aprovar'}
                </button>
              )}
              {f.ativo && (
                <button
                  onClick={() => handleSuspender(f.id)}
                  disabled={loadingId === f.id}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {loadingId === f.id ? '...' : 'Suspender'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
