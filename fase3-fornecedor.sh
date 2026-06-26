#!/bin/bash
# ============================================================
# FASE 3: Componentes de Fornecedor (cadastro + perfil)
# ============================================================

PROJECT_DIR="."
BACKUP_DIR="$PROJECT_DIR/.backup-fase3-$(date +%s)"
mkdir -p "$BACKUP_DIR"

cp "$PROJECT_DIR/pages/fornecedor/cadastro.jsx" "$BACKUP_DIR/"
cp "$PROJECT_DIR/pages/fornecedor/perfil.jsx" "$BACKUP_DIR/"

echo "Backup em: $BACKUP_DIR"

# ============================================================
# 1. pages/fornecedor/cadastro.jsx — Select do catálogo
# ============================================================
cat > "$PROJECT_DIR/pages/fornecedor/cadastro.jsx" << 'EOF_CADASTRO'
// Cadastro de novo fornecedor no sistema
// Dependencias diretas: React, next/head, next/router, Input, Button, Icon

import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { supabase } from '../../lib/supabase';
import { SUBCATEGORIAS_FLAT } from '../../utils/catalogoFornecedores';

export default function FornecedorCadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cidade, setCidade] = useState('');
  const [plano, setPlano] = useState('gratuito');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    if (!categoria) {
      setErro('Selecione uma categoria do catalogo.');
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErro('Voce precisa estar logado para se cadastrar como fornecedor.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('fornecedores_plataforma')
        .insert({
          usuario_id: user.id,
          nome_empresa: nome,
          categoria: categoria,
          cidade: cidade,
          email: email,
          plano: plano,
          ativo: plano === 'gratuito' ? false : true
        });

      if (insertError) {
        console.error('Erro ao cadastrar fornecedor:', insertError);
        setErro('Erro ao salvar cadastro. Tente novamente.');
        setLoading(false);
        return;
      }

      setEnviado(true);

      if (plano === 'gratuito') {
        router.push('/fornecedor/painel');
      } else {
        router.push('/fornecedor/painel');
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setErro('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-2)',
    fontWeight: 'var(--font-medium)',
    display: 'block'
  };

  const selectStyle = {
    width: '100%',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-white)',
    outline: 'none'
  };

  return (
    <>
      <Head><title>Cadastro de Fornecedor — Descomplicai</title></Head>
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', backgroundColor: 'var(--color-off-white)' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>
            Seja um fornecedor
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            Cadastre-se para receber leads qualificados de casamentos.
          </p>

          {enviado ? (
            <div style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>Cadastro recebido!</h2>
              <p>Redirecionando para seu painel...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Input label="Nome da empresa" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <Input label="E-mail comercial" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

              <div>
                <label htmlFor="categoria" style={labelStyle}>Categoria de servico</label>
                <select
                  id="categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  required
                  style={selectStyle}
                >
                  <option value="">Selecione uma categoria...</option>
                  {SUBCATEGORIAS_FLAT.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.categoriaPrincipalLabel} — {sub.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input label="Cidade de atuacao" value={cidade} onChange={(e) => setCidade(e.target.value)} required />

              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)', fontWeight: 'var(--font-medium)' }}>
                  Plano desejado
                </legend>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {[
                    { value: 'gratuito', label: 'Gratuito', desc: 'Perfil invisivel nas buscas — sem custo' },
                    { value: 'basico', label: 'Basico — R$ 19,90/mes', desc: 'Perfil ativo e visivel para casais' },
                    { value: 'premium', label: 'Premium', desc: 'Destaque nas buscas + prioridade nos leads' }
                  ].map((p) => (
                    <label
                      key={p.value}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: plano === p.value ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                        backgroundColor: plano === p.value ? 'var(--color-brand-lighter)' : 'var(--color-white)',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <input
                        type="radio"
                        name="plano"
                        value={p.value}
                        checked={plano === p.value}
                        onChange={(e) => setPlano(e.target.value)}
                        style={{ marginTop: '2px' }}
                      />
                      <div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>{p.label}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{p.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>

              {erro && (
                <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
                  {erro}
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar cadastro'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
EOF_CADASTRO

echo "[1/2] fornecedor/cadastro.jsx atualizado"

# ============================================================
# 2. pages/fornecedor/perfil.jsx — Resolver label via catálogo
# ============================================================
cat > "$PROJECT_DIR/pages/fornecedor/perfil.jsx" << 'EOF_PERFIL'
// Perfil publico do fornecedor — dados e portfolio
// Dependencias diretas: React, next/head, next/router, Card, Badge, Icon, EstrelasAvaliacao

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Icon from '../../components/ui/Icon';
import EstrelasAvaliacao from '../../components/fornecedores/EstrelasAvaliacao';
import { supabase } from '../../lib/supabase';
import { getLabelSubcategoria } from '../../utils/catalogoFornecedores';

export default function FornecedorPerfilPage() {
  const router = useRouter();
  const { id } = router.query;
  const [fornecedor, setFornecedor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avaliacoes, setAvaliacoes] = useState([]);

  useEffect(() => {
    if (!id) return;

    const carregarPerfil = async () => {
      try {
        const { data: f } = await supabase
          .from('fornecedores_plataforma')
          .select('*')
          .eq('id', id)
          .single();

        if (f) {
          setFornecedor(f);

          await supabase
            .from('fornecedores_plataforma')
            .update({ visualizacoes: (f.visualizacoes || 0) + 1 })
            .eq('id', id);

          const today = new Date().toISOString().split('T')[0];
          const { data: metrica } = await supabase
            .from('metricas_fornecedor')
            .select('id, visualizacoes')
            .eq('fornecedor_id', id)
            .eq('dia', today)
            .single();

          if (metrica) {
            await supabase
              .from('metricas_fornecedor')
              .update({ visualizacoes: metrica.visualizacoes + 1 })
              .eq('id', metrica.id);
          } else {
            await supabase
              .from('metricas_fornecedor')
              .insert({ fornecedor_id: id, dia: today, visualizacoes: 1 });
          }

          const { data: avs } = await supabase
            .from('avaliacoes')
            .select('nota, comentario, nome_casal, criado_em')
            .eq('fornecedor_id', id)
            .order('criado_em', { ascending: false })
            .limit(5);

          setAvaliacoes(avs || []);
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarPerfil();
  }, [id]);

  const registrarClique = async (tipo) => {
    if (!id) return;
    try {
      await fetch('/api/fornecedores/clique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fornecedorId: id, tipo })
      });
    } catch (err) {
      console.error('Erro ao registrar clique:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)' }}>
        <div style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando perfil...</div>
      </div>
    );
  }

  if (!fornecedor) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)' }}>
        <div style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Fornecedor nao encontrado.</div>
      </div>
    );
  }

  const isGratuito = fornecedor.plano === 'gratuito';
  const contatosVisiveis = !isGratuito && fornecedor.ativo;

  return (
    <>
      <Head><title>{fornecedor.nome_empresa} — Descomplicai</title></Head>
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)' }}>
        <div style={{ height: '200px', background: 'linear-gradient(135deg, var(--color-brand-lighter) 0%, var(--color-brand-light) 100%)' }} />
        <div style={{ maxWidth: '800px', margin: '-60px auto 0', padding: '0 var(--space-4) var(--space-8)' }}>
          <Card variant="elevated" padding="lg">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="store" size={48} color="var(--color-text-muted)" />
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                  {fornecedor.nome_empresa}
                </h1>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                  <Badge variant="primary">{getLabelSubcategoria(fornecedor.categoria)}</Badge>
                  <Badge variant="default">{fornecedor.cidade}{fornecedor.estado ? `, ${fornecedor.estado}` : ''}</Badge>
                  {fornecedor.ativo && <Badge variant="success">Perfil ativo</Badge>}
                </div>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                  {fornecedor.descricao || 'Este fornecedor ainda nao adicionou uma descricao.'}
                </p>
              </div>
            </div>
          </Card>

          <div style={{ marginTop: 'var(--space-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <Card variant="flat" padding="md">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Avaliacao media</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                <EstrelasAvaliacao nota={Number(fornecedor.avaliacao_media) || 0} tamanho={18} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>
                  {Number(fornecedor.avaliacao_media).toFixed(1)}
                </span>
              </div>
            </Card>
            <Card variant="flat" padding="md">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Total de avaliacoes</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>{fornecedor.total_avaliacoes || 0}</div>
            </Card>
            <Card variant="flat" padding="md">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Visualizacoes</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>{fornecedor.visualizacoes || 0}</div>
            </Card>
          </div>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <Card variant="elevated" padding="lg">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Icon name="phone" size={20} color="var(--color-brand)" />
                Contato
              </h2>

              {contatosVisiveis ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {fornecedor.telefone && (
                    <a
                      href={`tel:${fornecedor.telefone}`}
                      onClick={() => registrarClique('telefone')}
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontFamily: 'var(--font-body)', color: 'var(--color-brand)', textDecoration: 'none' }}
                    >
                      <Icon name="phone" size={18} />
                      {fornecedor.telefone}
                    </a>
                  )}
                  {fornecedor.email && (
                    <a
                      href={`mailto:${fornecedor.email}`}
                      onClick={() => registrarClique('email')}
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontFamily: 'var(--font-body)', color: 'var(--color-brand)', textDecoration: 'none' }}
                    >
                      <Icon name="mail" size={18} />
                      {fornecedor.email}
                    </a>
                  )}
                  {fornecedor.site && (
                    <a
                      href={fornecedor.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => registrarClique('site')}
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontFamily: 'var(--font-body)', color: 'var(--color-brand)', textDecoration: 'none' }}
                    >
                      <Icon name="link" size={18} />
                      {fornecedor.site}
                    </a>
                  )}
                  {fornecedor.instagram && (
                    <a
                      href={`https://instagram.com/${fornecedor.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontFamily: 'var(--font-body)', color: 'var(--color-brand)', textDecoration: 'none' }}
                    >
                      <Icon name="users" size={18} />
                      @{fornecedor.instagram.replace('@', '')}
                    </a>
                  )}
                </div>
              ) : (
                <div style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', textAlign: 'center' }}>
                  <Icon name="info" size={24} color="var(--color-text-muted)" />
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                    Este fornecedor ainda nao tem perfil ativo no Descomplicai.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {avaliacoes.length > 0 && (
            <div style={{ marginTop: 'var(--space-6)' }}>
              <Card variant="elevated" padding="lg">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Icon name="users" size={20} color="var(--color-brand)" />
                  Avaliacoes recentes
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {avaliacoes.map((av, idx) => (
                    <div key={idx} style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-off-white)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                        <EstrelasAvaliacao nota={av.nota} tamanho={14} />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {new Date(av.criado_em).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                        {av.comentario}
                      </p>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', display: 'block' }}>
                        Casal: {av.nome_casal || 'Anonimo'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
EOF_PERFIL

echo "[2/2] fornecedor/perfil.jsx atualizado"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  FASE 3 CONCLUIDA"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Mudancas:"
echo "  - cadastro.jsx: input de texto livre → select com SUBCATEGORIAS_FLAT"
echo "  - perfil.jsx: {fornecedor.categoria} → getLabelSubcategoria(fornecedor.categoria)"
echo ""
echo "Backup em: $BACKUP_DIR"