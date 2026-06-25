// pages/vitrine/[id].jsx
// Vitrine pública do cerimonialista — 3 níveis de acesso
// Público: dados básicos | Logado: contato parcial + CTA assinatura | Assinante: contato completo

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/ui/Icon';
import ContatoCard from '../../components/vitrine/ContatoCard';

function formatarTelefoneParcial(telefone) {
  if (!telefone) return null;
  const limpo = telefone.replace(/\D/g, '');
  if (limpo.length < 10) return telefone;
  const ddd = limpo.slice(0, 2);
  const prefixo = limpo.slice(2, 3);
  return `(${ddd}) ${prefixo}****-****`;
}

function formatarAvaliacao(media, total) {
  const estrelas = Math.round(media || 0);
  return { estrelas, total: total || 0 };
}

export default function VitrineCerimonialista({ cerimonialista: initialData, error: serverError }) {
  const router = useRouter();
  const { id } = router.query;

  const [cerimonialista, setCerimonialista] = useState(initialData);
  const [loading, setLoading] = useState(!initialData && !serverError);
  const [error, setError] = useState(serverError || null);
  const [user, setUser] = useState(null);
  const [assinaturaAtiva, setAssinaturaAtiva] = useState(false);
  const [mostrarFormOrcamento, setMostrarFormOrcamento] = useState(false);
  const [formOrcamento, setFormOrcamento] = useState({
    nome_lead: '',
    email: '',
    telefone: '',
    tipo_evento: '',
    data_prevista: '',
    notas: '',
  });
  const [enviandoOrcamento, setEnviandoOrcamento] = useState(false);
  const [sucessoOrcamento, setSucessoOrcamento] = useState(false);
  const [erroOrcamento, setErroOrcamento] = useState('');

  // Verifica usuário logado e assinatura
  useEffect(() => {
    async function verificarUsuario() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Busca evento do usuário para verificar assinatura
        const { data: evento } = await supabase
          .from('eventos')
          .select('assinatura_ativa')
          .eq('usuario_id', session.user.id)
          .order('criado_em', { ascending: false })
          .limit(1)
          .single();
        if (evento) {
          setAssinaturaAtiva(evento.assinatura_ativa === true);
        }
      }
    }
    verificarUsuario();
  }, []);

  // Se não veio SSR, busca no client
  useEffect(() => {
    if (!initialData && id && !serverError) {
      async function buscar() {
        try {
          const res = await fetch(`/api/vitrine/${id}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.erro || 'Erro ao carregar vitrine');
          setCerimonialista(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      buscar();
    }
  }, [id, initialData, serverError]);

  const handleSubmitOrcamento = async (e) => {
    e.preventDefault();
    setEnviandoOrcamento(true);
    setErroOrcamento('');

    try {
      const res = await fetch('/api/vitrine/orcamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formOrcamento,
          cerimonialista_id: cerimonialista.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao enviar orçamento');
      setSucessoOrcamento(true);
      setFormOrcamento({ nome_lead: '', email: '', telefone: '', tipo_evento: '', data_prevista: '', notas: '' });
    } catch (err) {
      setErroOrcamento(err.message);
    } finally {
      setEnviandoOrcamento(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-off-white)',
      }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
          Carregando vitrine...
        </p>
      </div>
    );
  }

  if (error || !cerimonialista) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-off-white)',
        padding: 'var(--space-4)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="alertCircle" size={48} color="var(--color-danger)" />
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            color: 'var(--color-text-primary)',
            marginTop: 'var(--space-4)',
          }}>
            {error || 'Cerimonialista não encontrado'}
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--space-2)',
          }}>
            Verifique o link ou tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }

  const { estrelas, total } = formatarAvaliacao(cerimonialista.avaliacao_media, cerimonialista.total_avaliacoes);
  const portfolio = Array.isArray(cerimonialista.portfolio_urls) ? cerimonialista.portfolio_urls : [];

  // Nível de acesso
  const isPublico = !user;
  const isLogado = user && !assinaturaAtiva;
  const isAssinante = user && assinaturaAtiva;

  return (
    <>
      <Head>
        <title>{cerimonialista.nome_empresa} — Descomplicaí</title>
        <meta name="description" content={`${cerimonialista.nome_empresa} — Cerimonialista em ${cerimonialista.cidade}, ${cerimonialista.estado}`} />
        <meta property="og:title" content={cerimonialista.nome_empresa} />
        <meta property="og:description" content={cerimonialista.bio || `Cerimonialista em ${cerimonialista.cidade}, ${cerimonialista.estado}`} />
      </Head>

      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)' }}>
        {/* Hero */}
        <section style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-8) var(--space-4)',
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            {/* Badge plano */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-brand-light)',
              color: 'var(--color-brand-dark)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              marginBottom: 'var(--space-4)',
            }}>
              <Icon name="shieldCheck" size={14} />
              {cerimonialista.plano === 'trial' ? 'Trial ativo' : 'Profissional verificado'}
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
              lineHeight: 'var(--leading-tight)',
            }}>
              {cerimonialista.nome_empresa}
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              flexWrap: 'wrap',
            }}>
              <Icon name="mapPin" size={16} color="var(--color-text-muted)" />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                {cerimonialista.cidade}, {cerimonialista.estado}
                {cerimonialista.regiao_atuacao && ` — Atua em ${cerimonialista.regiao_atuacao}`}
              </span>
            </div>

            {/* Avaliação */}
            {total > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginTop: 'var(--space-3)',
              }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon
                      key={i}
                      name={i < estrelas ? 'starFill' : 'star'}
                      size={18}
                      color={i < estrelas ? 'var(--color-warning)' : 'var(--color-border-strong)'}
                    />
                  ))}
                </div>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}>
                  {cerimonialista.avaliacao_media?.toFixed(1)} ({total} avaliaç{total === 1 ? 'ão' : 'ões'})
                </span>
              </div>
            )}

            {/* Bio */}
            {cerimonialista.bio && (
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                marginTop: 'var(--space-4)',
                maxWidth: '640px',
              }}>
                {cerimonialista.bio}
              </p>
            )}
          </div>
        </section>

        {/* Conteúdo principal */}
        <main style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-6)',
          }}>
            {/* Portfólio */}
            {portfolio.length > 0 && (
              <section>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-xl)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-4)',
                }}>
                  Portfólio
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 'var(--space-3)',
                }}>
                  {portfolio.map((url, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        paddingBottom: '75%',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        backgroundColor: 'var(--color-surface)',
                      }}
                    >
                      <img
                        src={url}
                        alt={`Foto ${idx + 1} do portfólio de ${cerimonialista.nome_empresa}`}
                        loading="lazy"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Dados de contato */}
            <section>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-4)',
              }}>
                Contato
              </h2>

              <ContatoCard
                telefone={cerimonialista.telefone}
                instagram={cerimonialista.instagram}
                site={cerimonialista.site}
                email={null} // email do cerimonialista não expomos
                isPublico={isPublico}
                isLogado={isLogado}
                isAssinante={isAssinante}
                telefoneParcial={formatarTelefoneParcial(cerimonialista.telefone)}
              />

              {/* Banner CTA para logado não assinante */}
              {isLogado && (
                <div style={{
                  marginTop: 'var(--space-4)',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-brand-lighter)',
                  border: '1.5px solid var(--color-brand-light)',
                  textAlign: 'center',
                }}>
                  <Icon name="award" size={32} color="var(--color-brand)" />
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-brand-dark)',
                    marginTop: 'var(--space-3)',
                  }}>
                    Desbloqueie o contato completo
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    marginTop: 'var(--space-2)',
                  }}>
                    Assine o Descomplicaí Pro para ver telefone, Instagram e site completos de todos os cerimonialistas.
                  </p>
                  <button
                    onClick={() => router.push('/painel/financeiro')}
                    style={{
                      marginTop: 'var(--space-4)',
                      padding: 'var(--space-3) var(--space-6)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-brand)',
                      color: 'var(--color-white)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Ver planos de assinatura
                  </button>
                </div>
              )}

              {/* CTA para público criar conta */}
              {isPublico && (
                <div style={{
                  marginTop: 'var(--space-4)',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1.5px solid var(--color-border)',
                  textAlign: 'center',
                }}>
                  <Icon name="user" size={32} color="var(--color-brand)" />
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-text-primary)',
                    marginTop: 'var(--space-3)',
                  }}>
                    Crie sua conta gratuita
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    marginTop: 'var(--space-2)',
                  }}>
                    Cadastre-se no Descomplicaí para ver dados de contato e solicitar orçamentos de cerimonialistas.
                  </p>
                  <button
                    onClick={() => router.push('/cadastro')}
                    style={{
                      marginTop: 'var(--space-4)',
                      padding: 'var(--space-3) var(--space-6)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-brand)',
                      color: 'var(--color-white)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Criar conta grátis
                  </button>
                </div>
              )}
            </section>

            {/* Solicitar orçamento */}
            <section style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              border: '1px solid var(--color-border)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)',
              }}>
                Solicitar orçamento
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-5)',
              }}>
                Preencha seus dados e {cerimonialista.nome_empresa} entrará em contato.
              </p>

              {sucessoOrcamento ? (
                <div
                  role="alert"
                  style={{
                    padding: 'var(--space-5)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-success-light)',
                    color: 'var(--color-success)',
                    textAlign: 'center',
                  }}
                >
                  <Icon name="checkCircle" size={40} />
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-lg)',
                    marginTop: 'var(--space-3)',
                  }}>
                    Orçamento enviado!
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                    {cerimonialista.nome_empresa} receberá seus dados e entrará em contato em breve.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitOrcamento} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-1)',
                    }}>
                      Nome completo
                    </label>
                    <input
                      type="text"
                      required
                      value={formOrcamento.nome_lead}
                      onChange={(e) => setFormOrcamento(p => ({ ...p, nome_lead: e.target.value }))}
                      placeholder="Seu nome"
                      style={{
                        width: '100%',
                        padding: 'var(--space-3) var(--space-4)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-base)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-white)',
                        border: '1.5px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--space-3)',
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-1)',
                      }}>
                        E-mail
                      </label>
                      <input
                        type="email"
                        required
                        value={formOrcamento.email}
                        onChange={(e) => setFormOrcamento(p => ({ ...p, email: e.target.value }))}
                        placeholder="seu@email.com"
                        style={{
                          width: '100%',
                          padding: 'var(--space-3) var(--space-4)',
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-base)',
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-white)',
                          border: '1.5px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-1)',
                      }}>
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formOrcamento.telefone}
                        onChange={(e) => setFormOrcamento(p => ({ ...p, telefone: e.target.value }))}
                        placeholder="(00) 00000-0000"
                        style={{
                          width: '100%',
                          padding: 'var(--space-3) var(--space-4)',
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-base)',
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-white)',
                          border: '1.5px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--space-3)',
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-1)',
                      }}>
                        Tipo de evento
                      </label>
                      <input
                        type="text"
                        value={formOrcamento.tipo_evento}
                        onChange={(e) => setFormOrcamento(p => ({ ...p, tipo_evento: e.target.value }))}
                        placeholder="Casamento, aniversário..."
                        style={{
                          width: '100%',
                          padding: 'var(--space-3) var(--space-4)',
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-base)',
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-white)',
                          border: '1.5px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-1)',
                      }}>
                        Data prevista
                      </label>
                      <input
                        type="date"
                        value={formOrcamento.data_prevista}
                        onChange={(e) => setFormOrcamento(p => ({ ...p, data_prevista: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: 'var(--space-3) var(--space-4)',
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-base)',
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-white)',
                          border: '1.5px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-1)',
                    }}>
                      Detalhes adicionais
                    </label>
                    <textarea
                      rows={3}
                      value={formOrcamento.notas}
                      onChange={(e) => setFormOrcamento(p => ({ ...p, notas: e.target.value }))}
                      placeholder="Conte um pouco sobre o evento..."
                      style={{
                        width: '100%',
                        padding: 'var(--space-3) var(--space-4)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-base)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-white)',
                        border: '1.5px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  {erroOrcamento && (
                    <div role="alert" style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-danger-light)',
                      color: 'var(--color-danger)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                    }}>
                      {erroOrcamento}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={enviandoOrcamento}
                    style={{
                      width: '100%',
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: enviandoOrcamento ? 'var(--color-border-strong)' : 'var(--color-brand)',
                      color: 'var(--color-white)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-medium)',
                      border: 'none',
                      cursor: enviandoOrcamento ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {enviandoOrcamento ? 'Enviando...' : 'Solicitar orçamento'}
                  </button>
                </form>
              )}
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: 'var(--space-8) var(--space-4)',
          borderTop: '1px solid var(--color-border)',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}>
            Vitrine criada com Descomplicaí
          </p>
        </footer>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/vitrine/${params.id}`);
    const data = await res.json();

    if (!res.ok) {
      return { props: { cerimonialista: null, error: data.erro || 'Não encontrado' } };
    }

    return { props: { cerimonialista: data, error: null } };
  } catch {
    return { props: { cerimonialista: null, error: 'Erro ao carregar vitrine' } };
  }
}
