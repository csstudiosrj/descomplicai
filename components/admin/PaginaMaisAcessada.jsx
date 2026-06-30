import React from 'react';

export default function PaginaMaisAcessada({ data = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Páginas Mais Acessadas</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Página</th>
              <th className="px-4 py-3 text-right">Acessos</th>
              <th className="px-4 py-3 text-right">Usuários Únicos</th>
              <th className="px-4 py-3 text-right">Tempo Médio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Nenhum dado disponível
                </td>
              </tr>
            )}
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-xs">
                  {item.pagina}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {item.total_acessos?.toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {item.usuarios_unicos?.toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 text-gray-700">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item.tempo_medio_segundos ? `${item.tempo_medio_segundos}s` : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
