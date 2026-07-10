/**
 * ============================================================
 * utils/flags.js — Centralizador de Feature Flags
 * Descomplicaí Memorial
 * ============================================================
 * 
 * Este arquivo é a FONTE ÚNICA DA VERDADE para todas as
 * feature flags do sistema. Nenhum outro arquivo deve ter
 * flag hardcoded — tudo importa daqui.
 * 
 * Regras de uso:
 * 1. Sempre importar deste arquivo
 * 2. Nunca hardcodar true/false em outros lugares
 * 3. Para flags novas, adicionar aqui primeiro
 * ============================================================
 */

// ============================================================
// 1. VALORES PADRÃO (default)
// ============================================================
// Estes são os valores quando NENHUMA variável de ambiente
// estiver definida. Altere aqui para mudar o comportamento
// base do sistema.
// ============================================================

const DEFAULT_FLAGS = {
  /** @type {boolean} Sons de transição no memorial (fade, slide, etc.) */
  ENABLE_SOUNDS: false,

  /** @type {boolean} Upload de arquivos (fotos, documentos, PDFs) */
  ENABLE_UPLOAD: false,

  /** @type {boolean} Internacionalização (pt-BR / en / es) */
  ENABLE_I18N: false,

  /** @type {boolean} Suporte a festas de 15 anos (Debutante) */
  ENABLE_15ANOS: false,

  /** @type {boolean} Suporte a Bar Mitzvah */
  ENABLE_BARMITZVAH: false,

  /** @type {boolean} Suporte a Bat Mitzvah */
  ENABLE_BATMITZVAH: false,

  /** @type {boolean} Suporte a formaturas */
  ENABLE_FORMATURA: false,

  /** @type {boolean} Painel completo do cerimonialista (CRUD, espelho, etc.) */
  ENABLE_CERIMONIALISTA_FULL: true,

  /** @type {boolean} Geração de PDF do memorial (produto pago R$197) */
  ENABLE_PDF_GERADOR: true,

  /** @type {boolean} Integração com Mercado Pago (assinatura R$29,90/mês + PDF) */
  ENABLE_MERCADO_PAGO: true,

  /** @type {boolean} Rastreamento de analytics (Google Analytics, Mixpanel, etc.) */
  ENABLE_ANALYTICS: true,
};

// ============================================================
// 2. OVERRIDE POR VARIÁVEIS DE AMBIENTE
// ============================================================
// O Next.js injeta process.env.NEXT_PUBLIC_* no build.
// Se existir uma env var correspondente, ela SOBRESCREVE
// o default acima.
//
// Exemplo no .env.local:
//   NEXT_PUBLIC_ENABLE_SOUNDS=true
//   NEXT_PUBLIC_ENABLE_UPLOAD=true
//
// Atenção: env vars só funcionam no CLIENTE se começarem
// com NEXT_PUBLIC_. Sem isso, só existem no servidor.
// ============================================================

function resolveFlags() {
  const resolved = {};

  for (const [key, defaultValue] of Object.entries(DEFAULT_FLAGS)) {
    const envKey = `NEXT_PUBLIC_${key}`;
    const envValue = process.env[envKey];

    if (envValue !== undefined) {
      // Converte string da env para boolean
      // Aceita: "true", "1", "yes" → true
      // Aceita: "false", "0", "no", "" → false
      const lower = String(envValue).toLowerCase().trim();
      resolved[key] = lower === 'true' || lower === '1' || lower === 'yes';
    } else {
      resolved[key] = defaultValue;
    }
  }

  return resolved;
}

// Objeto final com valores resolvidos (default + env)
const FLAGS = resolveFlags();

// ============================================================
// 3. FUNÇÕES UTILITÁRIAS
// ============================================================

/**
 * Verifica se uma feature flag está habilitada.
 *
 * @param {string} flagName — Nome da flag (ex: 'ENABLE_SOUNDS')
 * @returns {boolean} — true se habilitada, false se desabilitada ou inexistente
 *
 * @example
 * import { isEnabled } from '../utils/flags';
 * if (isEnabled('ENABLE_SOUNDS')) {
 *   playSound();
 * }
 */
function isEnabled(flagName) {
  if (typeof flagName !== 'string') {
    console.warn(`[flags] isEnabled espera uma string, recebeu: ${typeof flagName}`);
    return false;
  }

  if (!(flagName in FLAGS)) {
    console.warn(`[flags] Flag "${flagName}" não existe. Retornando false.`);
    return false;
  }

  return FLAGS[flagName] === true;
}

/**
 * Garante que uma feature flag está habilitada.
 * Se estiver desabilitada, lança um erro com mensagem clara.
 * Útil para proteger rotas ou funcionalidades críticas.
 *
 * @param {string} flagName — Nome da flag (ex: 'ENABLE_PDF_GERADOR')
 * @param {string} [featureName] — Nome amigável da funcionalidade (ex: 'Geração de PDF')
 * @throws {Error} — Se a flag estiver desabilitada
 *
 * @example
 * import { requireFlag } from '../utils/flags';
 * requireFlag('ENABLE_PDF_GERADOR', 'Geração de PDF do memorial');
 * // Se false → Error: Funcionalidade "Geração de PDF do memorial" desabilitada via flag ENABLE_PDF_GERADOR.
 */
function requireFlag(flagName, featureName) {
  if (!isEnabled(flagName)) {
    const name = featureName || flagName;
    throw new Error(
      `Funcionalidade "${name}" desabilitada via flag ${flagName}. ` +
      `Habilite a flag ou remova esta chamada.`
    );
  }
}

/**
 * Retorna uma cópia do objeto com todas as flags e seus valores atuais.
 * Útil para debug, painel de admin, ou logs.
 *
 * @returns {Record<string, boolean>} — Objeto { ENABLE_SOUNDS: false, ... }
 *
 * @example
 * import { getFlags } from '../utils/flags';
 * console.log(getFlags());
 * // { ENABLE_SOUNDS: false, ENABLE_PDF_GERADOR: true, ... }
 */
function getFlags() {
  return { ...FLAGS };
}

// ============================================================
// 4. EXPORTAÇÕES
// ============================================================

export { FLAGS, isEnabled, requireFlag, getFlags };
export default FLAGS;

// ============================================================
// 5. EXEMPLOS DE USO (documentação inline)
// ============================================================
//
// --- Verificação simples ---
// import { isEnabled } from '../utils/flags';
// if (isEnabled('ENABLE_SOUNDS')) {
//   playSound('transition');
// }
//
// --- Garantia de funcionalidade ---
// import { requireFlag } from '../utils/flags';
// function generatePDF() {
//   requireFlag('ENABLE_PDF_GERADOR', 'Geração de PDF');
//   // ... código do PDF ...
// }
//
// --- Debug / Admin ---
// import { getFlags } from '../utils/flags';
// console.table(getFlags());
//
// --- Importação do objeto direto ---
// import { FLAGS } from '../utils/flags';
// const podeFazerUpload = FLAGS.ENABLE_UPLOAD;
//
// --- No JSX (renderização condicional) ---
// import { isEnabled } from '../utils/flags';
// {isEnabled('ENABLE_15ANOS') && <Opcao15Anos />}
//
// ============================================================