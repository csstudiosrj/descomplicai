import React from 'react';

export default function AdminMetricCard({ title, value, change, icon, color = 'rose' }) {
  const colorClasses = {
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100',
  };

  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && change !== null && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
              isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-gray-500'
            }`}>
              <span>{isPositive ? '↑' : isNegative ? '↓' : '−'}</span>
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-400 font-normal">vs período anterior</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border ${colorClasses[color] || colorClasses.rose}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
