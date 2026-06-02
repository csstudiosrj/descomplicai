/**
 * Hook de gestão de fornecedores — CRUD e filtros
 * @module hooks/useFornecedor
 */

import { useState, useCallback, useMemo } from 'react';

export default function useFornecedor(fornecedoresIniciais = []) {
  const [fornecedores, setFornecedores] = useState(fornecedoresIniciais);
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  const adicionar = useCallback((fornecedor) => {
    setFornecedores(prev => [...prev, { ...fornecedor, id: Date.now(), status: 'orcamento', criadoEm: new Date().toISOString() }]);
  }, []);

  const atualizar = useCallback((id, dados) => {
    setFornecedores(prev => prev.map(f => f.id === id ? { ...f, ...dados, atualizadoEm: new Date().toISOString() } : f));
  }, []);

  const remover = useCallback((id) => {
    setFornecedores(prev => prev.filter(f => f.id !== id));
  }, []);

  const filtrados = useMemo(() => {
    return fornecedores.filter(f => {
      const matchNome = f.nome?.toLowerCase().includes(filtro.toLowerCase());
      const matchCat = !categoriaFiltro || f.categoria === categoriaFiltro;
      return matchNome && matchCat;
    });
  }, [fornecedores, filtro, categoriaFiltro]);

  const categorias = useMemo(() => {
    return [...new Set(fornecedores.map(f => f.categoria).filter(Boolean))];
  }, [fornecedores]);

  const resumo = useMemo(() => {
    return {
      total: fornecedores.length,
      contratados: fornecedores.filter(f => f.status === 'contratado').length,
      emNegociacao: fornecedores.filter(f => f.status === 'negociacao').length,
      orcamento: fornecedores.filter(f => f.status === 'orcamento').length,
      valorTotal: fornecedores.reduce((acc, f) => acc + (f.valor || 0), 0),
    };
  }, [fornecedores]);

  return {
    fornecedores,
    filtrados,
    filtro,
    setFiltro,
    categoriaFiltro,
    setCategoriaFiltro,
    categorias,
    adicionar,
    atualizar,
    remover,
    resumo,
  };
}

export { useFornecedor };