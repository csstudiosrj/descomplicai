// utils/acesso.js — Controle de acesso ao painel
export function temAcessoPainel(evento) {
  if (!evento || !evento.acesso_expira_em) return false;
  const agora = new Date();
  const expira = new Date(evento.acesso_expira_em);
  return expira >= agora;
}

export function calcularNovaExpiracao(expiraAtual, duracaoMeses) {
  const agora = new Date();
  const base = expiraAtual && new Date(expiraAtual) > agora ? new Date(expiraAtual) : agora;
  const novo = new Date(base);

  if (duracaoMeses < 1) {
    novo.setDate(novo.getDate() + Math.round(duracaoMeses * 30));
  } else {
    novo.setMonth(novo.getMonth() + Math.floor(duracaoMeses));
    if (novo.getDate() < base.getDate()) {
      novo.setDate(0);
    }
  }

  return novo.toISOString();
}

export function iniciarTrial(evento) {
  const agora = new Date();
  const expira = new Date(agora);
  expira.setDate(expira.getDate() + 7);
  return {
    acesso_iniciado_em: agora.toISOString(),
    acesso_expira_em: expira.toISOString(),
    plano: 'trial',
  };
}
