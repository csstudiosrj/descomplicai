import React, { useState } from 'react';

const PERIODOS = [
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
  { label: '90 dias', value: 90 },
  { label: '360 dias', value: 360 },
];

export default function GraficoReceita({ data = [], onPeriodChange, periodoAtual = 30 }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  const maxValue = Math.max(...data.map(d => d.total || 0), 1);

  // Cores por tipo
  const tipoColors = {
    pdf: '#f43f5e',      // rose-500
    assinatura: '#10b981', // emerald-500
    fornecedor: '#f59e0b', // amber-500
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Receita</h3>
          <p className="text-sm text-gray-500">Receita por período</p>
        </div>
        <div className="flex gap-2">
          {PERIODOS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange?.(p.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                periodoAtual === p.value
                  ? 'bg-rose-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: tipoColors.pdf }} />
          <span className="text-gray-600">PDF (R$197)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: tipoColors.assinatura }} />
          <span className="text-gray-600">Assinatura (R$29,90)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: tipoColors.fornecedor }} />
          <span className="text-gray-600">Fornecedor (R$19,90)</span>
        </div>
      </div>

      {/* Gráfico de barras empilhadas */}
      <div className="h-64 flex items-end gap-2">
        {data.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Nenhum dado para o período selecionado
          </div>
        )}
        {data.map((item, idx) => {
          const pdfH = ((item.pdf || 0) / maxValue) * 100;
          const assH = ((item.assinatura || 0) / maxValue) * 100;
          const fornH = ((item.fornecedor || 0) / maxValue) * 100;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
              onMouseEnter={() => setHoveredBar(idx)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Tooltip */}
              {hoveredBar === idx && (
                <div className="absolute z-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 -mt-16 shadow-lg whitespace-nowrap">
                  <div className="font-semibold mb-1">{item.periodo}</div>
                  <div>PDF: R$ {(item.pdf || 0).toFixed(2)}</div>
                  <div>Assinatura: R$ {(item.assinatura || 0).toFixed(2)}</div>
                  <div>Fornecedor: R$ {(item.fornecedor || 0).toFixed(2)}</div>
                  <div className="border-t border-gray-700 mt-1 pt-1 font-bold">
                    Total: R$ {(item.total || 0).toFixed(2)}
                  </div>
                </div>
              )}

              <div className="w-full flex flex-col-reverse rounded-t-lg overflow-hidden" style={{ height: '100%' }}>
                {fornH > 0 && (
                  <div style={{ height: `${fornH}%`, backgroundColor: tipoColors.fornecedor }} className="transition-all duration-300" />
                )}
                {assH > 0 && (
                  <div style={{ height: `${assH}%`, backgroundColor: tipoColors.assinatura }} className="transition-all duration-300" />
                )}
                {pdfH > 0 && (
                  <div style={{ height: `${pdfH}%`, backgroundColor: tipoColors.pdf }} className="transition-all duration-300" />
                )}
              </div>
              <span className="text-[10px] text-gray-400 truncate w-full text-center">
                {item.periodo}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
