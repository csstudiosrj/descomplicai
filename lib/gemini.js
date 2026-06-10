/**
 * Cliente para API da Anthropic Claude — geração de memorial via IA
 * @module lib/claude
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Gera memorial completo a partir dos dados do questionário
 * @param {Object} dadosMemorial — objeto montado por gerador-memorial.js
 * @returns {Promise<{memorial: string, fornecedores: string[]}>}
 */
export async function gerarMemorialIA(dadosMemorial) {
  if (!ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY não configurado');
    throw new Error('Claude API não configurada');
  }

  const prompt = montarPromptMemorial(dadosMemorial);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API erro: ${err}`);
  }

  const data = await res.json();
  const texto = data.content?.[0]?.text || '';

  return {
    memorial: texto,
    fornecedores: extrairFornecedores(texto),
  };
}

function montarPromptMemorial(dados) {
  return `Você é um cerimonialista experiente especializado em casamentos brasileiros. Com base nas preferências abaixo, crie um memorial de casamento detalhado, elegante e personalizado.

PERFIL DO CASAL:
${dados.perfil}

ESTILO E IDENTIDADE VISUAL:
- Estilo: ${dados.estilo}
- Paleta: ${dados.paleta}
- Formalidade: ${dados.formalidade}

CERIMÔNIA:
${dados.cerimonia}

LOCAL E ESTRUTURA:
${dados.local}
- Horário: ${dados.horario}
- Convidados: ${dados.convidados}

DECORAÇÃO E MESA:
${dados.decoracao}

MESA POSTA:
${dados.mesa}

ALIMENTAÇÃO E BEBIDAS:
${dados.alimentacao}

ENTRETENIMENTO:
${dados.entretenimento}

VESTUÁRIO:
${dados.vestuario}

PAPELARIA:
${dados.papelaria}

ORÇAMENTO:
${dados.orcamento}

Crie um memorial em português do Brasil, com tom sofisticado mas acolhedor. Divida em seções: Visão Geral, Cerimônia, Decoração, Gastronomia, Entretenimento, Vestuário, Papelaria e Fornecedores Recomendados.`;
}

function extrairFornecedores(texto) {
  const regex = /fornecedores? recomendados?:?([\s\S]*?)(?:\n\n|\Z)/i;
  const match = texto.match(regex);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.length > 2);
}