import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Icon from '../components/ui/Icon';
import Logo from '../components/ui/Logo';

export default function LandingPage() {
  const router = useRouter();
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownAberto && !e.target.closest('.dropdown-profissionais')) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownAberto]);

  const scrollToMemorial = () => {
    router.push('/memorial');
  };

  return (
    <>
      <Head>
        <title>Descomplicaí — Planeje seu casamento</title>
        <meta name="description" content="O jeito mais simples de organizar o casamento dos seus sonhos." />
      </Head>

      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '52px',
        background: scrolled ? 'var(--color-white)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        zIndex: 'var(--z-sticky)',
        transition: 'background 0.2s, border-color 0.2s',
      }}>
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          height: '100%',
          padding: '0 var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/" legacyBehavior>
            <a style={{ textDecoration: 'none' }}>
              <Logo />
            </a>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="dropdown-profissionais" style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setDropdownAberto(!dropdownAberto)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-2)',
                }}
              >
                Para profissionais
                <Icon name={dropdownAberto ? 'chevronUp' : 'chevronDown'} size={16} />
              </button>

              {dropdownAberto && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + var(--space-2))',
                  right: 0,
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  minWidth: '200px',
                  padding: 'var(--space-2)',
                  zIndex: 'var(--z-dropdown)',
                }}>
                  <Link href="/cerimonialista/login" legacyBehavior>
                    <a style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      padding: 'var(--space-3) var(--space-4)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)',
                      textDecoration: 'none',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      <Icon name="briefcase" size={18} />
                      Sou cerimonialista
                    </a>
                  </Link>
                  <Link href="/fornecedor/login" legacyBehavior>
                    <a style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      padding: 'var(--space-3) var(--space-4)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)',
                      textDecoration: 'none',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      <Icon name="store" size={18} />
                      Sou fornecedor
                    </a>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/login" legacyBehavior>
              <a style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-brand)',
                textDecoration: 'none',
                fontWeight: 'var(--font-medium)',
              }}>
                Entrar
              </a>
            </Link>
          </nav>
        </div>
      </header>

      <section style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-8) var(--space-4)',
        paddingTop: '72px',
        background: 'linear-gradient(135deg, var(--color-brand-light) 0%, var(--color-off-white) 100%)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-4xl)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-4)',
          lineHeight: 1.2,
        }}>
          O casamento dos seus sonhos<br />começa aqui
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lg)',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-8)',
          maxWidth: '480px',
        }}>
          Organize tudo em um só lugar: fornecedores, convidados, cronograma e muito mais.
        </p>
        <button
          onClick={scrollToMemorial}
          style={{
            backgroundColor: 'var(--color-brand)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-medium)',
            padding: 'var(--space-4) var(--space-8)',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Comece seu memorial
        </button>
      </section>

      <section style={{
        padding: 'var(--space-12) var(--space-4)',
        maxWidth: '960px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          color: 'var(--color-text-primary)',
          textAlign: 'center',
          marginBottom: 'var(--space-8)',
        }}>
          Tudo que você precisa
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-6)',
        }}>
          {[
            { icon: 'checklist', title: 'Checklist inteligente', desc: 'Acompanhe cada etapa do planejamento' },
            { icon: 'fornecedores', title: 'Fornecedores', desc: 'Organize orçamentos e contratos' },
            { icon: 'convidados', title: 'Lista de convidados', desc: 'Controle confirmações e mesas' },
            { icon: 'financeiro', title: 'Financeiro', desc: 'Gerencie pagamentos e saldos' },
          ].map((f) => (
            <div key={f.title} style={{
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-white)',
            }}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <Icon name={f.icon} size={32} color="var(--color-brand)" />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)',
              }}>{f.title}</h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        padding: 'var(--space-12) var(--space-4)',
        backgroundColor: 'var(--color-off-white)',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            marginBottom: 'var(--space-8)',
          }}>
            Você também pode crescer com a gente
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-6)',
          }}>
            <div style={{
              padding: 'var(--space-8)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-white)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <Icon name="briefcase" size={48} color="var(--color-brand)" />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)',
              }}>
                Cerimonialista
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-6)',
                lineHeight: 1.6,
              }}>
                Gerencie seus eventos, acompanhe leads e organize cada detalhe do seu escritório em um só lugar.
              </p>
              <Link href="/cerimonialista/cadastro" legacyBehavior>
                <a style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  padding: 'var(--space-3) var(--space-6)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                }}>
                  Cadastrar como cerimonialista
                </a>
              </Link>
            </div>

            <div style={{
              padding: 'var(--space-8)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-white)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <Icon name="store" size={48} color="var(--color-brand)" />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)',
              }}>
                Fornecedor
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-6)',
                lineHeight: 1.6,
              }}>
                Seja encontrado por noivas que estão planejando o casamento. Aumente sua visibilidade e receba novos leads.
              </p>
              <Link href="/fornecedor/cadastro" legacyBehavior>
                <a style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  padding: 'var(--space-3) var(--space-6)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                }}>
                  Cadastrar como fornecedor
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer style={{
        padding: 'var(--space-6) var(--space-4)',
        textAlign: 'center',
        borderTop: '1px solid var(--color-border)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
        }}>
          Descomplicaí — Todos os direitos reservados
        </p>
      </footer>
    </>
  );
}
