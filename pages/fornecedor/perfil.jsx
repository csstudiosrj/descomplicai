// Perfil publico do fornecedor — dados e portfolio
// Dependencias diretas: React, next/head, next/router, Card, Badge, Icon, EstrelasAvaliacao, ImageUpload

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Icon from '../../components/ui/Icon';
import ImageUpload from '../../components/ui/ImageUpload';
import EstrelasAvaliacao from '../../components/fornecedores/EstrelasAvaliacao';
import { supabase } from '../../lib/supabase';
import { getLabelSubcategoria } from '../../utils/catalogoFornecedores';
import fetchAPI from '../../utils/fetchAPI';

export default function FornecedorPerfilPage() {
  const router = useRouter();
  const { id } = router.query;
  const [fornecedor, setFornecedor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [erroUpload, setErroUpload] = useState(null);

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
          setFotos(f.fotos || []);

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
      await fetchAPI('/api/fornecedores/clique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fornecedorId: id, tipo })
      });
    } catch (err) {
      console.error('Erro ao registrar clique:', err);
    }
  };

  const handleUploadFotos = (novasUrls) => {
    const novasFotos = [...fotos, ...novasUrls];
    setFotos(novasFotos);
    setErroUpload(null);

    // Salva no banco
    supabase
      .from('fornecedores_plataforma')
      .update({ fotos: novasFotos })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Erro ao salvar fotos:', error);
      });
  };

  const handleRemoverFoto = (url) => {
    const novasFotos = fotos.filter(f => f !== url);
    setFotos(novasFotos);

    supabase
      .from('fornecedores_plataforma')
      .update({ fotos: novasFotos })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Erro ao remover foto:', error);
      });
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
        {/* Capa */}
        <div style={{ 
          height: '200px', 
          background: fornecedor.capa_url 
            ? `url(${fornecedor.capa_url}) center/cover no-repeat`
            : 'linear-gradient(135deg, var(--color-brand-lighter) 0%, var(--color-brand-light) 100%)' 
        }} />

        <div style={{ maxWidth: '800px', margin: '-60px auto 0', padding: '0 var(--space-4) var(--space-8)' }}>
          <Card variant="elevated" padding="lg">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
              {/* Logo */}
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: 'var(--radius-xl)', 
                backgroundColor: 'var(--color-surface)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0,
                overflow: 'hidden',
                border: '3px solid var(--color-white)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                {fornecedor.logo_url ? (
                  <img 
                    src={fornecedor.logo_url} 
                    alt={`Logo ${fornecedor.nome_empresa}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Icon name="store" size={48} color="var(--color-text-muted)" />
                )}
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

          {/* Metricas */}
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

          {/* Galeria de fotos */}
          {contatosVisiveis && (
            <div style={{ marginTop: 'var(--space-6)' }}>
              <Card variant="elevated" padding="lg">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Icon name="image" size={20} color="var(--color-brand)" />
                  Portfolio
                </h2>

                <ImageUpload
                  onUpload={handleUploadFotos}
                  onError={(msg) => setErroUpload(msg)}
                  maxFiles={20}
                  tipo="galeria"
                  label="Adicionar fotos ao portfolio"
                  urlsExistentes={fotos}
                  onRemoverExistente={handleRemoverFoto}
                />

                {erroUpload && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: 'var(--space-2)' }}>
                    {erroUpload}
                  </p>
                )}
              </Card>
            </div>
          )}

          {/* Contato */}
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

          {/* Avaliacoes */}
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
