import React from 'react';

export default function FunilMemorial({ data = [] }) {
  const maxValue = Math.max(...data.map(d => d.total_iniciaram || 0), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Funil do Memorial</h3>
      <p className="text-sm text-gray-500 mb-6">Taxa de abandono por step (últimos 30 dias)</p>

      <div className="space-y-4">
        {data.length === 0 && (
          <p className="text-center text-gray-400 py-8">Nenhum dado disponível</p>
        )}
        {data.map((item) => {
          const completouPct = item.total_iniciaram > 0
            ? (item.total_completaram / item.total_iniciaram) * 100
            : 0;
          const abandonouPct = item.taxa_abandono || 0;

          return (
            <div key={item.step_id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.step_id}</span>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-600 font-medium">{item.total_completaram} completaram</span>
                  <span className="text-red-500 font-medium">{abandonouPct}% abandonaram</span>
                </div>
              </div>
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                {/* Barra de completaram */}
                <div
                  className="absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${completouPct}%` }}
                />
                {/* Barra de abandonaram */}
                <div
                  className="absolute top-0 h-full bg-red-400 transition-all duration-500"
                  style={{ left: `${completouPct}%`, width: `${abandonouPct}%` }}
                />
                {/* Label central */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-700">
                    {item.total_iniciaram} iniciaram
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
