// utils/motorArvore.js
// Motor genérico de navegação por árvore de nós.
// Totalmente agnóstico ao tipo de evento — funciona com qualquer árvore que siga o contrato de nó.

const ARVORES_MAP = {
    casamento: () => import('../arvores/arvore-casamento'),
    '15anos': () => import('../arvores/arvore-15anos'),
    barmitzvah: () => import('../arvores/arvore-barmitzvah'),
    batmitzvah: () => import('../arvores/arvore-batmitzvah'),
    formatura: () => import('../arvores/arvore-formatura'),
    outros: () => import('../arvores/arvore-outros'),
  };
  
  export async function carregarArvore(tipoEvento) {
    const importFn = ARVORES_MAP[tipoEvento] || ARVORES_MAP.outros;
    const modulo = await importFn();
    return modulo.default;
  }
  
  export function getNoPorId(id, arvore) {
    return arvore.find(no => no.id === id) || null;
  }
  
  export function getRaiz(arvore) {
    return arvore.length > 0 ? arvore[0] : null;
  }
  
  export function proximoNo(estado, idAtual, arvore) {
    const noAtual = getNoPorId(idAtual, arvore);
    if (!noAtual) return null;
  
    if (typeof noAtual.condicional === 'function') {
      const idCondicional = noAtual.condicional(estado);
      if (idCondicional && typeof idCondicional === 'string') {
        const noCond = getNoPorId(idCondicional, arvore);
        if (noCond) return noCond;
      }
    }
  
    if (noAtual.next) {
      return getNoPorId(noAtual.next, arvore);
    }
  
    return null;
  }
  
  export function noAnterior(historico, arvore) {
    if (!historico || historico.length < 2) return null;
    const idAnterior = historico[historico.length - 2];
    return getNoPorId(idAnterior, arvore);
  }
  
  export function contarNosAtivos(estado, arvore) {
    const raiz = getRaiz(arvore);
    if (!raiz) return 0;
  
    let count = 0;
    let idAtual = raiz.id;
    const visitados = new Set();
  
    while (idAtual && !visitados.has(idAtual)) {
      visitados.add(idAtual);
      const no = getNoPorId(idAtual, arvore);
      if (!no) break;
  
      count++;
  
      let proximoId = null;
      if (typeof no.condicional === 'function') {
        const cond = no.condicional(estado);
        if (cond && typeof cond === 'string') {
          proximoId = cond;
        }
      }
      if (!proximoId && no.next) {
        proximoId = no.next;
      }
      idAtual = proximoId;
    }
  
    return count;
  }
  
  export function simularCaminho(estado, arvore) {
    const caminho = [];
    const raiz = getRaiz(arvore);
    if (!raiz) return caminho;
  
    let idAtual = raiz.id;
    const visitados = new Set();
  
    while (idAtual && !visitados.has(idAtual)) {
      visitados.add(idAtual);
      caminho.push(idAtual);
      const no = getNoPorId(idAtual, arvore);
      if (!no) break;
  
      let proximoId = null;
      if (typeof no.condicional === 'function') {
        const cond = no.condicional(estado);
        if (cond && typeof cond === 'string') proximoId = cond;
      }
      if (!proximoId && no.next) proximoId = no.next;
      idAtual = proximoId;
    }
    return caminho;
  }