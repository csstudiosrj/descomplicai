import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import fetchAPI from '../../utils/fetchAPI';

const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

export default function CadastroCerimonialistaPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome_empresa: '',
    cnpj: '',
    nome_responsavel: '',
    email: '',
    telefone: '',
    whatsapp: '',
    cidade: '',
    estado: '',
    senha: '',
    confirmacao_senha: '',
  });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (erros[name]) {
      setErros((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validar = () => {
    const next = {};
    if (!form.nome_empresa.trim()) next.nome_empresa = 'Nome da empresa é obrigatório.';
    if (!form.nome_responsavel.trim()) next.nome_responsavel = 'Nome do responsável é obrigatório.';
    if (!form.email.trim()) {
      next.email = 'E-mail é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'E-mail inválido.';
    }
    if (!form.cidade.trim()) next.cidade = 'Cidade é obrigatória.';
    if (!form.estado) next.estado = 'Estado é obrigatório.';
    if (!form.senha) {
      next.senha = 'Senha é obrigatória.';
    } else if (form.senha.length < 6) {
      next.senha = 'Senha deve ter no mínimo 6 caracteres.';
    }
    if (form.senha !== form.confirmacao_senha) {
      next.confirmacao_senha = 'As senhas não conferem.';
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validacao = validar();
    if (Object.keys(validacao).length > 0) {
      setErros(validacao);
      return;
    }

    setEnviando(true);
    setErros({});

    try {
      const res = await fetchAPI('/api/cerimonialista/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || data.erro) {
        setErros({ geral: data.erro || 'Erro ao criar conta. Tente novamente.' });
        setEnviando(false);
        return;
      }

      setSucesso(true);
      setTimeout(() => {
        router.push('/cerimonialista/login');
      }, 2500);
    } catch (err) {
      setErros({ geral: 'Erro de conexão. Tente novamente.' });
      setEnviando(false);
    }
  };

  return (
    <>
      <Head>
        <title>Cadastro de Cerimonialista — Descomplicaí</title>
        <meta name="description" content="Crie sua conta de cerimonialista no Descomplicaí." />
      </Head>

      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-off-white)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-3xl)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Crie sua conta de cerimonialista
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-secondary)',
              }}
            >
              15 dias grátis. Sem cartão de crédito.
            </p>
          </div>

          {sucesso ? (
            <div
              role="alert"
              style={{
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-success-light)',
                color: 'var(--color-success)',
                textAlign: 'center',
                fontFamily: 'var(--font-body)',
              }}
            >
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <Icon name="checkCircle" size={48} color="var(--color-success)" />
              </div>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>Conta criada com sucesso!</h2>
              <p style={{ fontSize: 'var(--text-sm)' }}>Redirecionando para o login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                label="Nome da empresa *"
                name="nome_empresa"
                type="text"
                placeholder="Ex: Cerimonial Maria Santos"
                value={form.nome_empresa}
                onChange={handleChange}
                required
              />

              <Input
                label="CNPJ (opcional)"
                name="cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                value={form.cnpj}
                onChange={handleChange}
              />

              <Input
                label="Nome do responsável *"
                name="nome_responsavel"
                type="text"
                placeholder="Nome completo"
                value={form.nome_responsavel}
                onChange={handleChange}
                required
              />

              <Input
                label="E-mail *"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />

              <Input
                label="Telefone *"
                name="telefone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={handleChange}
                required
              />

              <Input
                label="WhatsApp"
                name="whatsapp"
                type="tel"
                placeholder="(00) 00000-0000"
                value={form.whatsapp}
                onChange={handleChange}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-3)' }}>
                <Input
                  label="Cidade *"
                  name="cidade"
                  type="text"
                  placeholder="Sua cidade"
                  value={form.cidade}
                  onChange={handleChange}
                  required
                />
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    Estado *
                  </label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--color-border-strong)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-base)',
                      outline: 'none',
                      backgroundColor: 'var(--color-white)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <option value="">UF</option>
                    {UFS.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                  {erros.estado && (
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: 'var(--space-1)', display: 'block' }}>
                      {erros.estado}
                    </span>
                  )}
                </div>
              </div>

              <Input
                label="Senha *"
                name="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.senha}
                onChange={handleChange}
                required
                hint="Mínimo 6 caracteres"
              />

              <Input
                label="Confirmar senha *"
                name="confirmacao_senha"
                type="password"
                placeholder="Repita a senha"
                value={form.confirmacao_senha}
                onChange={handleChange}
                required
              />

              {erros.geral && (
                <div role="alert" style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-danger-light)',
                  color: 'var(--color-danger)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                }}>
                  {erros.geral}
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" fullWidth loading={enviando}>
                Criar conta
              </Button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Já tem conta?{' '}
            <Link href="/cerimonialista/login" legacyBehavior>
              <a style={{ color: 'var(--color-brand)', fontWeight: 'var(--font-medium)' }}>Faça login</a>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
