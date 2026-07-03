import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { apiPath } from '@/utils/apiPath';
import { supabase } from '@/lib/supabase';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/usuarios', label: 'Usuarios', icon: 'users' },
  { href: '/admin/eventos', label: 'Eventos', icon: 'calendar' },
  { href: '/admin/fornecedores', label: 'Fornecedores', icon: 'building' },
  { href: '/admin/pagamentos', label: 'Pagamentos', icon: 'payment' },
  { href: '/admin/config', label: 'Configuracoes', icon: 'settings' },
];

const Icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  building: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4 8 4v14" />
      <path d="M9 21v-6h6v6" />
      <path d="M10 9h4" />
      <path d="M10 13h4" />
    </svg>
  ),
  payment: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  menu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  close: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

export default function AdminLayout({ children, title = 'Admin' }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth >= 768);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        if (!accessToken) {
          router.push('/login');
          return;
        }

        const res = await fetch(apiPath('/admin/verificar'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ token: accessToken }),
        });

        if (!res.ok) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        if (!data.isAdmin) {
          router.push('/login');
          return;
        }

        setIsAdmin(true);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-secondary, #f9fafb)',
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          border: '3px solid var(--color-border, #e5e7eb)',
          borderTopColor: 'var(--color-brand, #e11d48)',
          animation: 'adminSpin 1s linear infinite',
        }} />
        <style>{`
          @keyframes adminSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAdmin) return null;

  const brandColor = 'var(--color-brand, #e11d48)';
  const textPrimary = 'var(--color-text-primary, #111827)';
  const textSecondary = 'var(--color-text-secondary, #6b7280)';
  const bgPrimary = 'var(--color-bg-primary, #ffffff)';
  const bgSecondary = 'var(--color-bg-secondary, #f9fafb)';
  const borderColor = 'var(--color-border, #e5e7eb)';
  const dangerColor = 'var(--color-danger, #dc2626)';
  const dangerLight = 'var(--color-danger-light, #fee2e2)';

  const sidebarWidth = '16rem';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: bgSecondary,
      display: 'flex',
      fontFamily: 'var(--font-body, sans-serif)',
    }}>
      {/* Sidebar Desktop */}
      {isDesktop && (
        <aside style={{
          width: sidebarWidth,
          backgroundColor: bgPrimary,
          borderRight: `1px solid ${borderColor}`,
          position: 'fixed',
          height: '100vh',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: 'var(--space-6, 1.5rem)',
            borderBottom: `1px solid ${borderColor}`,
          }}>
            <h1 style={{
              fontSize: 'var(--text-xl, 1.25rem)',
              fontWeight: 'var(--font-bold, 700)',
              color: brandColor,
              fontFamily: 'var(--font-display, serif)',
              margin: 0,
            }}>
              Descomplicai
            </h1>
            <p style={{
              fontSize: 'var(--text-xs, 0.75rem)',
              color: textSecondary,
              marginTop: '0.25rem',
            }}>
              Painel Administrativo
            </p>
          </div>
          <nav style={{
            flex: 1,
            padding: 'var(--space-4, 1rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}>
            {menuItems.map((item) => {
              const active = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-lg, 0.5rem)',
                    fontSize: 'var(--text-sm, 0.875rem)',
                    fontWeight: 'var(--font-medium, 500)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    color: active ? brandColor : textSecondary,
                    backgroundColor: active ? 'var(--color-brand-light, #fff1f2)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-hover, #f3f4f6)';
                      e.currentTarget.style.color = textPrimary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = textSecondary;
                    }
                  }}
                >
                  {Icons[item.icon]}
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div style={{
            padding: 'var(--space-4, 1rem)',
            borderTop: `1px solid ${borderColor}`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
            }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-light, #fff1f2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: brandColor,
                fontSize: 'var(--text-sm, 0.875rem)',
                fontWeight: 'var(--font-bold, 700)',
              }}>
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 'var(--text-sm, 0.875rem)',
                  fontWeight: 'var(--font-medium, 500)',
                  color: textPrimary,
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {user?.email || 'Admin'}
                </p>
                <p style={{
                  fontSize: 'var(--text-xs, 0.75rem)',
                  color: textSecondary,
                  margin: 0,
                }}>
                  Administrador
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: 'var(--text-sm, 0.875rem)',
                color: dangerColor,
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-lg, 0.5rem)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = dangerLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {Icons.logout}
              Sair
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Header */}
      {!isDesktop && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: bgPrimary,
          borderBottom: `1px solid ${borderColor}`,
          zIndex: 20,
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h1 style={{
            fontSize: 'var(--text-lg, 1.125rem)',
            fontWeight: 'var(--font-bold, 700)',
            color: brandColor,
            fontFamily: 'var(--font-display, serif)',
            margin: 0,
          }}>
            Descomplicai Admin
          </h1>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-lg, 0.5rem)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: textPrimary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-hover, #f3f4f6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileOpen ? Icons.close : Icons.menu}
          </button>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileOpen && !isDesktop && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 30,
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: sidebarWidth,
              backgroundColor: bgPrimary,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: 'var(--space-6, 1.5rem)',
              borderBottom: `1px solid ${borderColor}`,
            }}>
              <h1 style={{
                fontSize: 'var(--text-xl, 1.25rem)',
                fontWeight: 'var(--font-bold, 700)',
                color: brandColor,
                fontFamily: 'var(--font-display, serif)',
                margin: 0,
              }}>
                Descomplicai
              </h1>
            </div>
            <nav style={{
              padding: 'var(--space-4, 1rem)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}>
              {menuItems.map((item) => {
                const active = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-lg, 0.5rem)',
                      fontSize: 'var(--text-sm, 0.875rem)',
                      fontWeight: 'var(--font-medium, 500)',
                      textDecoration: 'none',
                      color: active ? brandColor : textSecondary,
                      backgroundColor: active ? 'var(--color-brand-light, #fff1f2)' : 'transparent',
                    }}
                  >
                    {Icons[item.icon]}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div style={{
              padding: 'var(--space-4, 1rem)',
              borderTop: `1px solid ${borderColor}`,
            }}>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontSize: 'var(--text-sm, 0.875rem)',
                  color: dangerColor,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-lg, 0.5rem)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {Icons.logout}
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: isDesktop ? sidebarWidth : 0,
        paddingTop: isDesktop ? 0 : '4rem',
      }}>
        <header style={{
          backgroundColor: bgPrimary,
          borderBottom: `1px solid ${borderColor}`,
          padding: 'var(--space-4, 1rem) var(--space-6, 1.5rem)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{
            fontSize: 'var(--text-xl, 1.25rem)',
            fontWeight: 'var(--font-semibold, 600)',
            color: textPrimary,
            margin: 0,
            fontFamily: 'var(--font-display, serif)',
          }}>
            {title}
          </h2>
          <div style={{
            fontSize: 'var(--text-sm, 0.875rem)',
            color: textSecondary,
          }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <div style={{
          padding: 'var(--space-6, 1.5rem)',
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}