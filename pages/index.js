// Landing page do Descomplicaí
// Dependências diretas: React, next/head, next/link, Button, Card, Icon

import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Icon from '../components/ui/Icon';

function useIntersectionObserver() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function AnimatedSection({ children, delay = 0 }) {
  const { ref, visible } = useIntersectionObserver();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [ctaFixed, setCtaFixed] = useState(true);
  const precosRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!precosRef.current) return;
      const rect = precosRef.current.getBoundingClientRect();
      setCtaFixed(rect.top > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Head>
        <title>Descomplicaí — Planejamento de casamento sem stress</title>
        <meta
          name="description"
          content="Guia completo do casamento brasileiro. Do memorial à gestão de fornecedores, tudo num lugar só."
        />
        <meta property="og:title" content="Descomplicaí — Planejamento de casamento sem stress" />
        <meta
          property="og:description"
          content="Guia completo do casamento brasileiro. Do memorial à gestão de fornecedores, tudo num lugar só."
        />
        <meta property="og:url" content="https://descomplicai.com.br" />
        <html lang="pt-BR" />
      </Head>

      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
          backgroundColor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-3) var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
          }}
        >
          Descomplicaí
        </span>
        <Link href="/login" passHref legacyBehavior>
          <a
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-brand)',
              textDecoration: 'none',
            }}
          >
            Entrar
          </a>
        </Link>
      </nav>

      <main>
        {/* Hero */}
        <section
          style={{
            position: 'relative',
            padding: 'var(--space-16) var(--space-4)',
            overflow: 'hidden',
            background: 'linear-gradient(180deg, var(--color-off-white) 0%, var(--color-brand-lighter) 100%)',
          }}
        >
          <div
            style={{
              maxWidth: '720px',
              margin: '0 auto',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <AnimatedSection>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(var(--text-3xl), 5vw, var(--text-5xl))',
                  lineHeight: 'var(--leading-tight)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-6)',
                }}
              >
                Porque casar é pra ser lembrado, não sofrido.
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  marginBottom: 'var(--space-8)',
                  maxWidth: '560px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                O Descomplicaí guia vocês do zero à festa — decisões, memorial, fornecedores e gestão num lugar só.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <Link href="/memorial" passHref legacyBehavior>
                <a style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="lg">
                    Começar agora — é grátis
                  </Button>
                </a>
              </Link>
            </AnimatedSection>
          </div>

          {/* Shapes decorativos */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '10%',
              right: '-5%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--color-brand-light) 0%, transparent 70%)',
              opacity: 0.3,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '5%',
              left: '-10%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--color-brand-lighter) 0%, transparent 70%)',
              opacity: 0.4,
            }}
          />
        </section>

        {/* Como funciona */}
        <section
          style={{
            padding: 'var(--space-20) var(--space-4)',
            backgroundColor: 'var(--color-white)',
          }}
        >
          <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
            <AnimatedSection>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-3xl)',
                  textAlign: 'center',
                  marginBottom: 'var(--space-12)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Como funciona
              </h2>
            </AnimatedSection>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-6)',
              }}
            >
              {[
                {
                  icone: 'sparkle',
                  titulo: 'Você responde, nós criamos',
                  texto: 'Questionário guiado que monta seu memorial em tempo real.',
                },
                {
                  icone: 'rings',
                  titulo: 'Tudo num lugar só',
                  texto: 'Fornecedores, financeiro, checklist e cronograma centralizados.',
                },
                {
                  icone: 'check-circle',
                  titulo: 'Na hora H, zero ansiedade',
                  texto: 'Seu casamento documentado do primeiro detalhe ao último fornecedor.',
                },
              ].map((item, i) => (
                <AnimatedSection key={item.titulo} delay={i * 100}>
                  <Card variant="flat" padding="lg">
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--color-brand-lighter)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-brand)',
                        marginBottom: 'var(--space-4)',
                      }}
                    >
                      <Icon name={item.icone} size={24} ariaHidden={true} />
                    </div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-xl)',
                        marginBottom: 'var(--space-2)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {item.titulo}
                    </h3>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-base)',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 'var(--leading-relaxed)',
                      }}
                    >
                      {item.texto}
                    </p>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Prova social */}
        <section
          style={{
            padding: 'var(--space-16) var(--space-4)',
            backgroundColor: 'var(--color-surface)',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <AnimatedSection>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-2xl)',
                  fontStyle: 'italic',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-snug)',
                }}
              >
                Primeiro produto dedicado a guiar a noiva do zero ao altar, de forma completa e sequencial.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Preços */}
        <section
          ref={precosRef}
          style={{
            padding: 'var(--space-20) var(--space-4)',
            backgroundColor: 'var(--color-white)',
          }}
        >
          <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
            <AnimatedSection>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-3xl)',
                  textAlign: 'center',
                  marginBottom: 'var(--space-12)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Escolha seu plano
              </h2>
            </AnimatedSection>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-6)',
                alignItems: 'start',
              }}
            >
              {/* Gratuito */}
              <AnimatedSection delay={0}>
                <Card variant="outlined" padding="lg">
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-2xl)',
                      marginBottom: 'var(--space-2)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Gratuito
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--space-6)',
                    }}
                  >
                    Complete o memorial e veja o resultado
                  </p>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-3)',
                      marginBottom: 'var(--space-6)',
                    }}
                  >
                    {['Memorial interativo', 'Preview em tempo real', 'Sugestões automáticas'].map((b) => (
                      <li
                        key={b}
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                        }}
                      >
                        <Icon name="check" size={16} color="var(--color-success)" ariaHidden={true} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link href="/memorial" passHref legacyBehavior>
                    <a style={{ textDecoration: 'none', display: 'block' }}>
                      <Button variant="secondary" fullWidth>
                        Começar grátis
                      </Button>
                    </a>
                  </Link>
                </Card>
              </AnimatedSection>

              {/* Memorial PDF */}
              <AnimatedSection delay={100}>
                <Card variant="outlined" padding="lg">
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-2xl)',
                      marginBottom: 'var(--space-2)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Memorial PDF
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-3xl)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--color-brand)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    R$197
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--space-6)',
                    }}
                  >
                    Exporte seu memorial completo em PDF elegante
                  </p>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-3)',
                      marginBottom: 'var(--space-6)',
                    }}
                  >
                    {[
                      'Tudo do plano gratuito',
                      'PDF elegante para imprimir',
                      'Lista de fornecedores sugeridos',
                      'Timeline do grande dia',
                    ].map((b) => (
                      <li
                        key={b}
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                        }}
                      >
                        <Icon name="check" size={16} color="var(--color-success)" ariaHidden={true} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Button variant="secondary" fullWidth disabled>
                    Em breve
                  </Button>
                </Card>
              </AnimatedSection>

              {/* Assinatura */}
              <AnimatedSection delay={200}>
                <Card
                  variant="elevated"
                  padding="lg"
                  selected
                  style={{ border: '2px solid var(--color-brand)' }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      padding: 'var(--space-1) var(--space-3)',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-brand)',
                      color: 'var(--color-white)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-semibold)',
                      marginBottom: 'var(--space-4)',
                    }}
                  >
                    Mais popular
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-2xl)',
                      marginBottom: 'var(--space-2)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Assinatura
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-3xl)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--color-brand)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    R$29,90<span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-normal)', color: 'var(--color-text-muted)' }}>/mês</span>
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--space-6)',
                    }}
                  >
                    Gerencie tudo até o grande dia
                  </p>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-3)',
                      marginBottom: 'var(--space-6)',
                    }}
                  >
                    {[
                      'Tudo do Memorial PDF',
                      'Painel completo de gestão',
                      'Checklist inteligente',
                      'Controle financeiro',
                      'Lista de convidados',
                      'Cronograma do evento',
                    ].map((b) => (
                      <li
                        key={b}
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                        }}
                      >
                        <Icon name="check" size={16} color="var(--color-success)" ariaHidden={true} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Button variant="primary" fullWidth disabled>
                    Em breve
                  </Button>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>

      {/* CTA flutuante mobile */}
      {ctaFixed && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-white)',
            borderTop: '1px solid var(--color-border)',
            zIndex: 'var(--z-sticky)',
            display: 'flex',
            justifyContent: 'center',
          }}
          className="cta-mobile"
        >
          <style jsx>{`
            @media (min-width: 768px) {
              .cta-mobile {
                display: none !important;
              }
            }
          `}</style>
          <Link href="/memorial" passHref legacyBehavior>
            <a style={{ textDecoration: 'none', width: '100%' }}>
              <Button variant="primary" size="lg" fullWidth>
                Começar agora — é grátis
              </Button>
            </a>
          </Link>
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          padding: 'var(--space-12) var(--space-4)',
          backgroundColor: 'var(--color-off-white)',
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Descomplicaí
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-6)',
            }}
          >
            Porque casar é pra ser lembrado, não sofrido.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <a
              href="#"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Política de Privacidade
            </a>
            <span style={{ color: 'var(--color-border-strong)' }}>·</span>
            <a
              href="#"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Termos de Uso
            </a>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            © 2026 Descomplicaí · Todos os direitos reservados
          </p>
        </div>
      </footer>
    </>
  );
}