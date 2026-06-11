// pages/api/ia/gerar-memorial.js
import { gerarTextoGemini } from '../../../lib/gemini';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const dados = req.body;

  if (!dados || Object.keys(dados).length === 0) {
    return res.status(400).json({ erro: 'Dados do memorial não fornecidos' });
  }

  try {
    const prompt = montarPromptMemorial(dados);
    const memorial = await gerarTextoGemini(prompt, 4000);
    
    return res.status(200).json({ 
      sucesso: true, 
      memorial 
    });
  } catch (erro) {
    console.error('Erro ao gerar memorial:', erro.message);
    return res.status(500).json({ 
      erro: 'Erro ao gerar memorial',
      detalhe: erro.message 
    });
  }
}

function montarPromptMemorial(dados) {
  const {
    perfilCasal,
    nomePessoa1,
    nomePessoa2,
    dataEvento,
    cidadeEvento,
    totalConvidados,
    faixaOrcamento,
    tipoCerimonia,
    tipoLocal,
    horarioCasamento,
    estilo,
    formalidade,
    paleta,
    flores,
    iluminacao,
    velas,
    mobiliarioEspecial,
    tipoJantar,
    tipoBar,
    musicaFesta,
    atividadesEntretenimento,
    formatoConvite,
    estiloVestido,
  } = dados;

  const nomeCasal = nomePessoa1 && nomePessoa2 
    ? `${nomePessoa1} e ${nomePessoa2}` 
    : 'o casal';

  const perfilTexto = {
    'noiva-noivo': 'noiva e noivo',
    'duas-noivas': 'duas noivas',
    'dois-noivos': 'dois noivos',
    'nao-especificar': 'casal'
  }[perfilCasal] || 'casal';

  const convidadosTexto = {
    'micro': 'até 30 pessoas (micro wedding)',
    'intimo': '30 a 80 pessoas',
    'medio': '80 a 150 pessoas',
    'grande': '150 a 300 pessoas',
    'mega': 'acima de 300 pessoas'
  }[totalConvidados] || totalConvidados;

  return `Com base nas informações abaixo, crie um memorial de casamento completo, detalhado e personalizado para ${nomeCasal} (${perfilTexto}). O tom deve ser elegante, acolhedor e específico. Nunca genérico — use os detalhes fornecidos para criar algo verdadeiramente único. Não se apresente como um especialista, apenas entregue o memorial diretamente.

DADOS DO CASAMENTO:
- Casal: ${nomeCasal} (${perfilTexto})
- Data: ${dataEvento || 'a definir'}
- Local: ${cidadeEvento || 'a definir'}, Brasil
- Número de convidados: ${convidadosTexto}
- Orçamento: ${faixaOrcamento || 'a definir'}
- Tipo de cerimônia: ${tipoCerimonia || 'a definir'}
- Tipo de espaço: ${tipoLocal || 'a definir'}
- Horário: ${horarioCasamento || 'a definir'}
- Estilo visual: ${estilo || 'a definir'}
- Formalidade: ${formalidade || 'a definir'}
- Paleta de cores: ${Array.isArray(paleta) ? paleta.join(', ') : (paleta || 'a definir')}
- Flores: ${flores || 'a definir'}
- Iluminação: ${iluminacao || 'a definir'}
- Velas: ${velas || 'não'}
- Mobiliário especial: ${mobiliarioEspecial || 'padrão'}
- Tipo de jantar: ${tipoJantar || 'a definir'}
- Bar: ${tipoBar || 'a definir'}
- Música da festa: ${musicaFesta || 'a definir'}
- Atividades: ${Array.isArray(atividadesEntretenimento) ? atividadesEntretenimento.join(', ') : 'nenhuma especial'}
- Convites: ${formatoConvite || 'a definir'}
- Traje principal: ${estiloVestido || 'a definir'}

Gere o memorial completo em Markdown com EXATAMENTE estas seções:

## Identidade Visual
Descreva a paleta de cores, o estilo geral, a atmosfera e a identidade visual do casamento. Seja específico sobre como as cores e o estilo se manifestarão em cada elemento.

## Cerimônia
Descreva o ambiente, o roteiro sugerido, a música, os elementos decorativos e os momentos especiais da cerimônia. Adapte para o tipo de cerimônia escolhida.

## Decoração
Descreva em detalhes as flores por localização (altar, corredor, mesas, entrada), a iluminação, as velas quando aplicável, o mobiliário, os tecidos e o backdrop. Seja visual e específico.

## Mesa Posta
Descreva toalha, louças, talheres, taças, centro de mesa e guardanapos de forma coerente com a paleta e o estilo definidos.

## Alimentação e Bebidas
Descreva o coquetel de entrada, o jantar, o bolo, a mesa de doces e o bar de forma adequada ao estilo e ao orçamento.

## Entretenimento
Descreva a música da festa, as atividades especiais e a energia geral da celebração.

## Vestuário e Beleza
Descreva o estilo do traje principal, os acessórios sugeridos, o estilo de maquiagem e cabelo coerentes com o estilo visual do casamento.

## Papelaria e Identidade
Descreva os convites, a sinalização do evento e a identidade visual dos materiais impressos.

## Fornecedores Necessários
Liste todos os tipos de fornecedores necessários para este casamento, organizados por categoria, com uma nota sobre o que procurar em cada um.

## Linha do Tempo
Crie um cronograma mês a mês desde agora até o dia do casamento, com as principais tarefas e contratações a fazer em cada período.

## Checklist de Decisões Pendentes
Liste as principais decisões que ainda precisam ser tomadas, organizadas por urgência.

## Estimativa de Orçamento por Categoria
Com base no orçamento declarado de ${faixaOrcamento}, distribua percentualmente o orçamento pelas principais categorias, com valores estimados em reais.`;
}