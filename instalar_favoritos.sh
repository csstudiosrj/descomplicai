#!/bin/bash
# ============================================================
# INSTALACAO AUTOMATICA — Fornecedores Favoritos do Cerimonialista
# ============================================================

echo "Criando diretorios..."
mkdir -p pages/api/cerimonialista/favoritos
mkdir -p components/cerimonialista

echo "Criando API listar.js..."
cat > pages/api/cerimonialista/favoritos/listar.js << 'APIEOF'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Metodo ${req.method} nao permitido` });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Configuracao do Supabase incompleta' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticacao nao fornecido' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Token invalido' });
  }

  const { data: cerimonialista, error: cerimError } = await supabase
    .from('cerimonialistas')
    .select('id')
    .eq('usuario_id', user.id)
    .single();

  if (cerimError || !cerimonialista) {
    return res.status(403).json({ error: 'Usuario nao e cerimonialista' });
  }

  try {
    const { data, error } = await supabase
      .from('cerimonialista_fornecedores_favoritos')
      .select('*')
      .eq('cerimonialista_id', cerimonialista.id)
      .order('categoria', { ascending: true })
      .order('nome_fornecedor', { ascending: true });

    if (error) throw error;
    return res.status(200).json({ favoritos: data || [] });
  } catch (err) {
    console.error('[API favoritos/listar]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
APIEOF

echo "Criando API salvar.js..."
cat > pages/api/cerimonialista/favoritos/salvar.js << 'APIEOF'
import { createClient } from '@supabase/supabase-js';
import { CATEGORIAS_PRINCIPAIS } from '../../../utils/catalogoFornecedores';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CATEGORIAS_VALIDAS = CATEGORIAS_PRINCIPAIS.map(c => c.id);

export default async function handler(req, res) {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    res.setHeader('Allow', ['POST', 'PUT', 'PATCH']);
    return res.status(405).json({ error: `Metodo ${req.method} nao permitido` });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Configuracao do Supabase incompleta' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticacao nao fornecido' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Token invalido' });
  }

  const { data: cerimonialista, error: cerimError } = await supabase
    .from('cerimonialistas')
    .select('id')
    .eq('usuario_id', user.id)
    .single();

  if (cerimError || !cerimonialista) {
    return res.status(403).json({ error: 'Usuario nao e cerimonialista' });
  }

  try {
    const {
      id,
      nome_fornecedor,
      categoria,
      telefone,
      email,
      instagram,
      notas_internas,
      fornecedor_id,
    } = req.body;

    if (!nome_fornecedor?.trim()) {
      return res.status(400).json({ error: 'Nome do fornecedor e obrigatorio' });
    }

    const categoriaLimpa = categoria?.trim() || 'outro';
    if (!CATEGORIAS_VALIDAS.includes(categoriaLimpa)) {
      return res.status(400).json({ error: 'Categoria invalida' });
    }

    const payload = {
      cerimonialista_id: cerimonialista.id,
      nome_fornecedor: nome_fornecedor.trim(),
      categoria: categoriaLimpa,
      telefone: telefone?.trim() || null,
      email: email?.trim() || null,
      instagram: instagram?.trim() || null,
      notas_internas: notas_internas?.trim() || null,
      fornecedor_id: fornecedor_id || null,
    };

    if (req.method === 'POST') {
      const { data, error } = await supabase
        .from('cerimonialista_fornecedores_favoritos')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ favorito: data });
    } else {
      if (!id) {
        return res.status(400).json({ error: 'ID do favorito e obrigatorio para atualizacao' });
      }

      const { data: existente } = await supabase
        .from('cerimonialista_fornecedores_favoritos')
        .select('id')
        .eq('id', id)
        .eq('cerimonialista_id', cerimonialista.id)
        .single();

      if (!existente) {
        return res.status(403).json({ error: 'Favorito nao encontrado ou nao pertence a voce' });
      }

      delete payload.cerimonialista_id;

      const { data, error } = await supabase
        .from('cerimonialista_fornecedores_favoritos')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ favorito: data });
    }
  } catch (err) {
    console.error('[API favoritos/salvar]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
APIEOF

echo "Criando API deletar.js..."
cat > pages/api/cerimonialista/favoritos/deletar.js << 'APIEOF'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Metodo ${req.method} nao permitido` });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Configuracao do Supabase incompleta' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticacao nao fornecido' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Token invalido' });
  }

  const { data: cerimonialista, error: cerimError } = await supabase
    .from('cerimonialistas')
    .select('id')
    .eq('usuario_id', user.id)
    .single();

  if (cerimError || !cerimonialista) {
    return res.status(403).json({ error: 'Usuario nao e cerimonialista' });
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'ID do favorito e obrigatorio' });
    }

    const { data: existente } = await supabase
      .from('cerimonialista_fornecedores_favoritos')
      .select('id')
      .eq('id', id)
      .eq('cerimonialista_id', cerimonialista.id)
      .single();

    if (!existente) {
      return res.status(403).json({ error: 'Favorito nao encontrado ou nao pertence a voce' });
    }

    const { error } = await supabase
      .from('cerimonialista_fornecedores_favoritos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Favorito removido' });
  } catch (err) {
    console.error('[API favoritos/deletar]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
APIEOF

echo "Criando componente BibliotecaFornecedores.jsx..."
cat > components/cerimonialista/BibliotecaFornecedores.jsx << 'COMPEOF'
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import BibliotecaFornecedoresModal from './BibliotecaFornecedoresModal';
import {
  CATEGORIAS_PRINCIPAIS,
  getLabelCategoriaPrincipalPorId,
} from '../../utils/catalogoFornecedores';

export default function BibliotecaFornecedores({ cerimonialistaId }) {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [favoritoEditando, setFavoritoEditando] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const buscarFavoritos = useCallback(async () => {
    if (!cerimonialistaId) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch('/api/cerimonialista/favoritos/listar', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.favoritos) {
        setFavoritos(json.favoritos);
      }
    } catch (err) {
      console.error('[BibliotecaFornecedores] erro ao buscar:', err);
    } finally {
      setLoading(false);
    }
  }, [cerimonialistaId]);

  useEffect(() => {
    buscarFavoritos();
  }, [buscarFavoritos]);

  const handleNovo = () => {
    setFavoritoEditando(null);
    setModalOpen(true);
  };

  const handleEditar = (favorito) => {
    setFavoritoEditando(favorito);
    setModalOpen(true);
  };

  const handleSalvo = () => {
    buscarFavoritos();
    showToast(favoritoEditando ? 'Fornecedor atualizado' : 'Fornecedor adicionado aos favoritos');
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este fornecedor dos favoritos?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const res = await fetch(`/api/cerimonialista/favoritos/deletar?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        buscarFavoritos();
        showToast('Fornecedor removido dos favoritos');
      } else {
        showToast('Erro ao remover', 'error');
      }
    } catch (err) {
      showToast('Erro ao remover', 'error');
    }
  };

  const favoritosFiltrados = favoritos.filter((f) => {
    const matchBusca = !busca || f.nome_fornecedor.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = categoriaFiltro === 'todas' || f.categoria === categoriaFiltro;
    return matchBusca && matchCategoria;
  });

  const agrupados = favoritosFiltrados.reduce((acc, f) => {
    const cat = f.categoria || 'outro';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  const ordemCategorias = CATEGORIAS_PRINCIPAIS.map(c => c.id);
  const categoriasOrdenadas = Object.keys(agrupados).sort(
    (a, b) => ordemCategorias.indexOf(a) - ordemCategorias.indexOf(b)
  );

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Icon name="search" size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: 'var(--space-3)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar fornecedores favoritos..."
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-10)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-white)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              style={{ position: 'absolute', right: 'var(--space-3)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              aria-label="Limpar busca"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-2)', scrollbarWidth: 'none' }}>
          <button
            onClick={() => setCategoriaFiltro('todas')}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              backgroundColor: categoriaFiltro === 'todas' ? 'var(--color-brand)' : 'var(--color-white)',
              color: categoriaFiltro === 'todas' ? 'var(--color-white)' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
            }}
          >
            Todas
          </button>
          {CATEGORIAS_PRINCIPAIS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaFiltro(cat.id)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                backgroundColor: categoriaFiltro === cat.id ? 'var(--color-brand)' : 'var(--color-white)',
                color: categoriaFiltro === cat.id ? 'var(--color-white)' : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Button variant="primary" size="sm" onClick={handleNovo}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="plus" size={16} />
            Adicionar fornecedor
          </span>
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando favoritos...</p>
        </div>
      ) : favoritosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <Icon name="heart" size={48} color="var(--color-text-muted)" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', marginTop: 'var(--space-4)' }}>
            {busca || categoriaFiltro !== 'todas' ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor favorito ainda'}
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            {busca || categoriaFiltro !== 'todas'
              ? 'Tente ajustar os filtros de busca.'
              : 'Adicione fornecedores a sua biblioteca pessoal.'}
          </p>
          {!busca && categoriaFiltro === 'todas' && (
            <Button variant="primary" onClick={handleNovo} style={{ marginTop: 'var(--space-6)' }}>
              Adicionar fornecedor
            </Button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {categoriasOrdenadas.map((catId) => (
            <div key={catId}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-brand)',
                marginBottom: 'var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}>
                <Icon name="tag" size={16} />
                {getLabelCategoriaPrincipalPorId(catId)}
                <Badge variant="default" size="sm" pill>{agrupados[catId].length}</Badge>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
                {agrupados[catId].map((f) => (
                  <Card key={f.id} variant="default" padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                      <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', margin: 0, fontSize: 'var(--text-base)' }}>
                        {f.nome_fornecedor}
                      </h4>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <button
                          onClick={() => handleEditar(f)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 'var(--space-1)' }}
                          aria-label="Editar fornecedor"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletar(f.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 'var(--space-1)' }}
                          aria-label="Remover dos favoritos"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </div>
                    {f.telefone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                        <Icon name="phone" size={14} />
                        {f.telefone}
                      </div>
                    )}
                    {f.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                        <Icon name="mail" size={14} />
                        {f.email}
                      </div>
                    )}
                    {f.instagram && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                        <Icon name="link" size={14} />
                        @{f.instagram}
                      </div>
                    )}
                    {f.notas_internas && (
                      <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        {f.notas_internas}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <BibliotecaFornecedoresModal
          favorito={favoritoEditando}
          cerimonialistaId={cerimonialistaId}
          onClose={() => { setModalOpen(false); setFavoritoEditando(null); }}
          onSalvo={handleSalvo}
        />
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 'var(--space-6)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 'var(--z-toast)',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideUp 300ms ease',
          }}
        >
          {toast.message}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
COMPEOF

echo "Criando componente BibliotecaFornecedoresModal.jsx..."
cat > components/cerimonialista/BibliotecaFornecedoresModal.jsx << 'COMPEOF'
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../ui/Icon';
import { CATEGORIAS_PRINCIPAIS } from '../../utils/catalogoFornecedores';

export default function BibliotecaFornecedoresModal({ favorito, cerimonialistaId, onClose, onSalvo }) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('outro');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [notas, setNotas] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (favorito) {
      setNome(favorito.nome_fornecedor || '');
      setCategoria(favorito.categoria || 'outro');
      setTelefone(favorito.telefone || '');
      setEmail(favorito.email || '');
      setInstagram(favorito.instagram || '');
      setNotas(favorito.notas_internas || '');
    } else {
      setNome('');
      setCategoria('outro');
      setTelefone('');
      setEmail('');
      setInstagram('');
      setNotas('');
    }
    setErro('');
  }, [favorito]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!nome.trim()) {
      setErro('Nome do fornecedor e obrigatorio');
      return;
    }

    setSalvando(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setErro('Sessao expirada. Faca login novamente.');
        setSalvando(false);
        return;
      }

      const payload = {
        id: favorito?.id,
        nome_fornecedor: nome.trim(),
        categoria,
        telefone: telefone.trim() || null,
        email: email.trim() || null,
        instagram: instagram.trim() || null,
        notas_internas: notas.trim() || null,
      };

      const res = await fetch('/api/cerimonialista/favoritos/salvar', {
        method: favorito ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok) {
        onSalvo();
        onClose();
      } else {
        setErro(json.error || 'Erro ao salvar');
      }
    } catch (err) {
      setErro('Erro de conexao. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={favorito ? 'Editar fornecedor favorito' : 'Adicionar fornecedor aos favoritos'}
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {erro && (
          <div style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            <Icon name="alertCircle" size={16} />
            {erro}
          </div>
        )}

        <Input
          label="Nome do fornecedor *"
          placeholder="Ex: Buffet Gourmet"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
            Categoria *
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border-strong)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-white)',
              outline: 'none',
            }}
          >
            {CATEGORIAS_PRINCIPAIS.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Telefone"
          placeholder="(11) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="contato@fornecedor.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Instagram"
          placeholder="@fornecedor"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value.replace(/^@/, ''))}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
            Notas internas
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Observacoes, valores, preferencias..."
            rows={3}
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border-strong)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" loading={salvando} type="submit">
            {salvando ? 'Salvando...' : (favorito ? 'Atualizar' : 'Adicionar')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
COMPEOF

echo "Aplicando patch no Icon.jsx..."
# Adicionar heart e heartFill antes da linha "};" no final do objeto icons
sed -i '/^};$/i\
  // Adicionado por favoritos_cerimonialista\
  heart: (\
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">\
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />\
    </g>\
  ),\
\
  heartFill: (\
    <g fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">\
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />\
    </g>\
  ),\
' components/ui/Icon.jsx

echo "Verificando se o patch do Icon.jsx funcionou..."
grep -n "heart" components/ui/Icon.jsx | head -5

echo ""
echo "============================================================"
echo "  ARQUIVOS CRIADOS:"
echo "============================================================"
ls -la pages/api/cerimonialista/favoritos/
ls -la components/cerimonialista/BibliotecaFornecedores.jsx
ls -la components/cerimonialista/BibliotecaFornecedoresModal.jsx

echo ""
echo "============================================================"
echo "  PROXIMO PASSO: Aplicar o patch em biblioteca.jsx"
echo "  (manual — arquivo complexo com muitas dependencias)"
echo "============================================================"
echo ""
echo "Para aplicar o patch na biblioteca.jsx, abra o arquivo e:"
echo "  1. Adicione o import:"
echo "     import BibliotecaFornecedores from '../../components/cerimonialista/BibliotecaFornecedores';"
echo "  2. Adicione o estado: const [abaAtiva, setAbaAtiva] = useState('modelos');"
echo "  3. Substitua o header por tabs com 'Modelos' e 'Fornecedores favoritos'"
echo "  4. Condicione o conteudo do main com abaAtiva"
echo ""
