import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminConfig() {
  return (
    <AdminLayout title="Configurações">
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configurações</h3>
        <p className="text-gray-500">Módulo em desenvolvimento. Feature flags e textos padrão serão implementados aqui.</p>
      </div>
    </AdminLayout>
  );
}
