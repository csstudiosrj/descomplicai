const TEMPLATES = {
  fotografia: {
    titulo: "Contrato de Prestação de Serviços Fotográficos",
    variaveis: [
      "nome_noivos", "data_evento", "local_evento", "cidade_evento",
      "nome_fotografo", "nome_empresa", "telefone_fotografo", "email_fotografo",
      "valor_total", "valor_entrada", "data_entrada", "valor_saldo", "data_saldo",
      "data_contrato", "n_fotos", "prazo_entrega"
    ],
    conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS

CONTRATANTES: {nome_noivos}, doravante denominados CONTRATANTES.
CONTRATADA: {nome_empresa}, representada por {nome_fotografo}, doravante denominada CONTRATADA.

1. OBJETO

A CONTRATADA se compromete a realizar a cobertura fotográfica do evento de casamento dos CONTRATANTES, a realizar-se em {data_evento}, no endereço {local_evento}, {cidade_evento}.

2. SERVIÇOS INCLUSOS

2.1. Cobertura fotográfica da cerimônia e recepção.

2.2. Sessão de making of (mediante acordo prévio).

2.3. Entrega de {n_fotos} fotografias editadas em alta resolução.

2.4. Prazo de entrega: {prazo_entrega} dias corridos após a data do evento.

2.5. Formato de entrega: galeria digital online com link de acesso exclusivo e download ilimitado.

3. DIREITOS DE IMAGEM

3.1. As fotografias produzidas são de propriedade dos CONTRATANTES.

3.2. A CONTRATADA poderá utilizar as imagens para fins de divulgação de seu trabalho em portfólio, redes sociais e materiais promocionais, salvo expressa proibição dos CONTRATANTES mediante notificação escrita até 30 dias após o evento.

4. VALORES E PAGAMENTO

4.1. O valor total do serviço é de R$ {valor_total}.

4.2. Entrada de R$ {valor_entrada} até {data_entrada}, que reserva a data exclusivamente para os CONTRATANTES.

4.3. Saldo de R$ {valor_saldo} até {data_saldo}.

4.4. O não pagamento da entrada implica cancelamento automático deste contrato.

5. CANCELAMENTO

5.1. Cancelamento pelos CONTRATANTES com mais de 90 dias de antecedência: perda da entrada.

5.2. Cancelamento com menos de 90 dias: devido 50% do valor total.

5.3. Cancelamento com menos de 30 dias: devido 100% do valor total.

5.4. Cancelamento pela CONTRATADA: devolução integral dos valores pagos acrescida de multa de 20% sobre o valor total.

6. CASO FORTUITO

Em caso de imprevistos técnicos graves (falha total de equipamento, sinistro), a CONTRATADA se compromete a indicar profissional substituto de qualidade equivalente ou devolver integralmente os valores recebidos.

7. BACKUP E SEGURANÇA

A CONTRATADA garante que as imagens serão armazenadas em backup redundante durante o período mínimo de 90 dias após o evento.

8. FORO

Fica eleito o foro da comarca de {cidade_evento} para dirimir quaisquer controvérsias.

Assinado digitalmente em {data_contrato}.`
  },

  buffet: {
    titulo: "Contrato de Prestação de Serviços de Buffet",
    variaveis: [
      "nome_noivos", "data_evento", "local_evento", "cidade_evento",
      "nome_responsavel", "nome_empresa", "telefone", "email",
      "valor_total", "valor_entrada", "data_entrada", "valor_saldo", "data_saldo",
      "data_contrato", "n_convidados", "horario_montagem", "horario_evento", "horario_desmontagem"
    ],
    conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE BUFFET

CONTRATANTES: {nome_noivos}, doravante denominados CONTRATANTES.
CONTRATADA: {nome_empresa}, representada por {nome_responsavel}, doravante denominada CONTRATADA.

1. OBJETO

Prestação de serviços de buffet para evento de casamento a realizar-se em {data_evento}, no endereço {local_evento}, {cidade_evento}, para aproximadamente {n_convidados} convidados.

2. SERVIÇOS INCLUSOS

2.1. Fornecimento de alimentação e bebidas conforme cardápio anexo a este contrato.

2.2. Equipe de garçons e copa durante todo o evento.

2.3. Montagem a partir das {horario_montagem}.

2.4. Atendimento durante o evento das {horario_evento}.

2.5. Desmontagem e retirada do espaço até as {horario_desmontagem}.

2.6. Louças, talheres e taças conforme especificado no cardápio anexo.

3. CARDÁPIO

O cardápio detalhado consta em anexo e é parte integrante deste contrato. Substituições de itens dependem de acordo escrito entre as partes com no mínimo 30 dias de antecedência.

4. NÚMERO DE CONVIDADOS

4.1. O contrato é baseado em {n_convidados} convidados.

4.2. Acréscimos de até 10% podem ser acomodados mediante comunicação com 15 dias de antecedência e pagamento proporcional.

4.3. Reduções não implicam desconto após assinatura deste contrato.

5. VALORES E PAGAMENTO

5.1. Valor total: R$ {valor_total}.

5.2. Entrada de R$ {valor_entrada} até {data_entrada}.

5.3. Saldo de R$ {valor_saldo} até {data_saldo}.

6. CANCELAMENTO

6.1. Cancelamento com mais de 90 dias: perda da entrada.

6.2. Cancelamento entre 90 e 30 dias: devido 50% do valor total.

6.3. Cancelamento com menos de 30 dias: devido 100% do valor total.

6.4. Cancelamento pela CONTRATADA: devolução integral mais multa de 20% sobre o valor total.

7. RESPONSABILIDADES

7.1. A CONTRATADA é responsável pela qualidade e conservação dos alimentos até o momento do serviço.

7.2. Alergias e restrições alimentares devem ser informadas pelos CONTRATANTES com no mínimo 15 dias de antecedência.

8. FORO

Comarca de {cidade_evento}.

Assinado digitalmente em {data_contrato}.`
  },

  decoracao: {
    titulo: "Contrato de Prestação de Serviços de Decoração",
    variaveis: [
      "nome_noivos", "data_evento", "local_evento", "cidade_evento",
      "nome_responsavel", "nome_empresa", "telefone", "email",
      "valor_total", "valor_entrada", "data_entrada", "valor_saldo", "data_saldo",
      "data_contrato", "itens_locados", "itens_proprios", "horario_montagem", "horario_retirada"
    ],
    conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DECORAÇÃO

CONTRATANTES: {nome_noivos}
CONTRATADA: {nome_empresa}, representada por {nome_responsavel}.

1. OBJETO

Criação, fornecimento e montagem de decoração para casamento a realizar-se em {data_evento}, no endereço {local_evento}, {cidade_evento}.

2. ESCOPO DOS SERVIÇOS

2.1. Projeto de decoração conforme briefing aprovado em anexo.

2.2. Fornecimento de itens próprios da CONTRATADA: {itens_proprios}.

2.3. Itens locados de terceiros sob responsabilidade da CONTRATADA: {itens_locados}.

2.4. Montagem a partir das {horario_montagem}.

2.5. Desmontagem e retirada até {horario_retirada}.

3. FLORES E ARRANJOS

3.1. As espécies de flores são as descritas no briefing anexo.

3.2. Em caso de impossibilidade de fornecimento de espécie específica, a CONTRATADA poderá substituir por flor de equivalência estética e valor, comunicando os CONTRATANTES com antecedência mínima de 7 dias.

4. ITENS LOCADOS

4.1. Os itens locados permanecem sob responsabilidade dos CONTRATANTES durante o período do evento.

4.2. Danos, quebras ou extravios serão cobrados dos CONTRATANTES conforme tabela de valores da CONTRATADA.

5. VALORES E PAGAMENTO

5.1. Valor total: R$ {valor_total}.

5.2. Entrada de R$ {valor_entrada} até {data_entrada}.

5.3. Saldo de R$ {valor_saldo} até {data_saldo}.

6. CANCELAMENTO

6.1. Mais de 60 dias: perda da entrada.

6.2. Entre 60 e 30 dias: devido 60% do valor total.

6.3. Menos de 30 dias: devido 100% do valor total.

6.4. Cancelamento pela CONTRATADA: devolução integral mais multa de 20% sobre o valor total.

7. FORO

Comarca de {cidade_evento}.

Assinado digitalmente em {data_contrato}.`
  },

  dj: {
    titulo: "Contrato de Prestação de Serviços de DJ",
    variaveis: [
      "nome_noivos", "data_evento", "local_evento", "cidade_evento",
      "nome_responsavel", "nome_empresa", "telefone", "email",
      "valor_total", "valor_entrada", "data_entrada", "valor_saldo", "data_saldo",
      "data_contrato", "horario_inicio", "horario_fim", "n_horas", "equipamentos", "valor_hora_extra"
    ],
    conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DJ

CONTRATANTES: {nome_noivos}
CONTRATADO: {nome_responsavel}, doravante denominado CONTRATADO.

1. OBJETO

Prestação de serviços de DJ para casamento a realizar-se em {data_evento}, no endereço {local_evento}, {cidade_evento}.

2. SERVIÇOS

2.1. Performance de DJ das {horario_inicio} às {horario_fim} ({n_horas} horas).

2.2. Equipamentos de som inclusos: {equipamentos}.

2.3. Montagem e teste com até 2 horas de antecedência.

2.4. Playlist orientada conforme briefing musical acordado com os CONTRATANTES.

3. REPERTÓRIO

3.1. Os CONTRATANTES poderão indicar músicas obrigatórias e músicas vetadas.

3.2. A curadoria e sequência das músicas é responsabilidade do CONTRATADO, respeitando as indicações acima.

3.3. Músicas específicas para momentos da cerimônia (entrada, saída, valsa) serão acordadas com antecedência mínima de 15 dias.

4. HORA EXTRA

Horas além do contratado serão cobradas a R$ {valor_hora_extra}/hora, pagas ao final do evento.

5. VALORES E PAGAMENTO

5.1. Valor total: R$ {valor_total}.

5.2. Entrada de R$ {valor_entrada} até {data_entrada}.

5.3. Saldo de R$ {valor_saldo} até {data_saldo}.

6. CANCELAMENTO

6.1. Mais de 60 dias: perda da entrada.

6.2. Menos de 60 dias: devido 100% do valor total.

6.3. Cancelamento pelo CONTRATADO: devolução integral mais multa de 20%.

7. FORO

Comarca de {cidade_evento}.

Assinado digitalmente em {data_contrato}.`
  },

  banda: {
    titulo: "Contrato de Prestação de Serviços de Banda ao Vivo",
    variaveis: [
      "nome_noivos", "data_evento", "local_evento", "cidade_evento",
      "nome_responsavel", "nome_empresa", "telefone", "email",
      "valor_total", "valor_entrada", "data_entrada", "valor_saldo", "data_saldo",
      "data_contrato", "horario_inicio", "horario_fim", "n_integrantes", "descricao_banda", "responsabilidade_som"
    ],
    conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE BANDA AO VIVO

CONTRATANTES: {nome_noivos}
CONTRATADO: {nome_responsavel}, doravante denominado CONTRATADO.

1. OBJETO

Prestação de serviços de banda ao vivo para casamento a realizar-se em {data_evento}, no endereço {local_evento}, {cidade_evento}.

2. SERVIÇOS

2.1. Performance musical das {horario_inicio} às {horario_fim}, com intervalos de 20 minutos a cada hora de apresentação.

2.2. A banda é composta por {n_integrantes} músicos: {descricao_banda}.

2.3. Equipamentos de som e backline: {responsabilidade_som} (especificar se é da banda ou do espaço).

2.4. Camarim ou área de descanso a ser providenciada pelo espaço.

3. ALIMENTAÇÃO DA BANDA

O espaço ou os CONTRATANTES providenciarão refeição para os {n_integrantes} integrantes durante o evento.

4. REPERTÓRIO

4.1. Os CONTRATANTES poderão indicar músicas obrigatórias e músicas vetadas.

4.2. A curadoria e sequência das músicas é responsabilidade do CONTRATADO, respeitando as indicações acima.

4.3. Músicas específicas para momentos da cerimônia (entrada, saída, valsa) serão acordadas com antecedência mínima de 15 dias.

5. VALORES E PAGAMENTO

5.1. Valor total: R$ {valor_total}.

5.2. Entrada de R$ {valor_entrada} até {data_entrada}.

5.3. Saldo de R$ {valor_saldo} até {data_saldo}.

6. CANCELAMENTO

6.1. Mais de 60 dias: perda da entrada.

6.2. Menos de 60 dias: devido 100% do valor total.

6.3. Cancelamento pelo CONTRATADO: devolução integral mais multa de 20%.

7. FORO

Comarca de {cidade_evento}.

Assinado digitalmente em {data_contrato}.`
  },

  filmagem: {
    titulo: "Contrato de Prestação de Serviços de Filmagem",
    variaveis: [
      "nome_noivos", "data_evento", "local_evento", "cidade_evento",
      "nome_responsavel", "nome_empresa", "telefone", "email",
      "valor_total", "valor_entrada", "data_entrada", "valor_saldo", "data_saldo",
      "data_contrato", "duracao_min", "duracao_max", "prazo_entrega"
    ],
    conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FILMAGEM

CONTRATANTES: {nome_noivos}
CONTRATADA: {nome_empresa}, representada por {nome_responsavel}.

1. OBJETO

Prestação de serviços de filmagem para casamento a realizar-se em {data_evento}, no endereço {local_evento}, {cidade_evento}.

2. SERVIÇOS

2.1. Cobertura audiovisual da cerimônia e recepção.

2.2. Entrega de filme principal com duração entre {duracao_min} e {duracao_max} minutos.

2.3. Entrega de versão reduzida para redes sociais (até 3 minutos).

2.4. Prazo de entrega: {prazo_entrega} dias corridos após o evento.

2.5. Formato de entrega: arquivo digital em alta definição via link de download.

3. ÁUDIO

3.1. Captação de áudio com microfone lapela no noivo durante a cerimônia (mediante autorização do espaço).

3.2. A qualidade do áudio ambiente é condicionada às condições acústicas do local.

4. DIREITOS AUTORAIS

O filme é de propriedade dos CONTRATANTES. A CONTRATADA poderá utilizar trechos para portfólio salvo proibição expressa.

5. VALORES E PAGAMENTO

5.1. Valor total: R$ {valor_total}.

5.2. Entrada de R$ {valor_entrada} até {data_entrada}.

5.3. Saldo de R$ {valor_saldo} até {data_saldo}.

6. CANCELAMENTO

6.1. Mais de 90 dias: perda da entrada.

6.2. Menos de 90 dias: devido 50% do valor total.

6.3. Menos de 30 dias: devido 100% do valor total.

6.4. Cancelamento pela CONTRATADA: devolução integral mais multa de 20% sobre o valor total.

7. FORO

Comarca de {cidade_evento}.

Assinado digitalmente em {data_contrato}.`
  },

  beleza: {
    titulo: "Contrato de Prestação de Serviços de Beleza",
    variaveis: [
      "nome_noivos", "data_evento", "local_evento", "cidade_evento",
      "nome_responsavel", "nome_empresa", "telefone", "email",
      "valor_total", "valor_entrada", "data_entrada", "valor_saldo", "data_saldo",
      "data_contrato", "horario_inicio_beleza", "local_making_of", "n_pessoas", "descricao_servicos_adicionais"
    ],
    conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE BELEZA

CONTRATANTES: {nome_noivos}
CONTRATADA: {nome_empresa}, representada por {nome_responsavel}.

1. OBJETO

Serviços de maquiagem e cabelo para casamento a realizar-se em {data_evento}.

2. SERVIÇOS

2.1. Maquiagem e penteado da noiva/noivo.

2.2. Serviços adicionais para {n_pessoas} pessoas: {descricao_servicos_adicionais}.

2.3. Atendimento a partir das {horario_inicio_beleza} no endereço {local_making_of}.

2.4. A CONTRATADA garante presença até a saída para a cerimônia.

3. TESTE

3.1. Sessão de teste incluída: sim/não (conforme acordado).

3.2. O teste deve ser realizado com no mínimo 30 dias de antecedência.

3.3. Alterações de look após o teste estão sujeitas à disponibilidade da CONTRATADA.

4. PRODUTOS

A CONTRATADA utiliza produtos próprios profissionais. Alergias ou restrições a produtos devem ser informadas com antecedência mínima de 15 dias.

5. VALORES E PAGAMENTO

5.1. Valor total: R$ {valor_total}.

5.2. Entrada de R$ {valor_entrada} até {data_entrada}.

5.3. Saldo de R$ {valor_saldo} até {data_saldo}.

6. CANCELAMENTO

6.1. Mais de 30 dias: perda da entrada.

6.2. Menos de 30 dias: devido 100% do valor total.

6.3. Cancelamento pela CONTRATADA: devolução integral mais multa de 20%.

7. FORO

Comarca de {cidade_evento}.

Assinado digitalmente em {data_contrato}.`
  },

  espaco: {
    titulo: "Contrato de Locação de Espaço para Eventos",
    variaveis: [
      "nome_noivos", "data_evento", "local_evento", "cidade_evento",
      "nome_responsavel", "nome_empresa", "telefone", "email",
      "valor_total", "valor_entrada", "data_entrada", "valor_saldo", "data_saldo",
      "data_contrato", "horario_inicio_locacao", "horario_fim_locacao", "capacidade_max", "itens_inclusos"
    ],
    conteudo: `CONTRATO DE LOCAÇÃO DE ESPAÇO PARA EVENTOS

CONTRATANTES: {nome_noivos}
CONTRATADA: {nome_empresa}, representada por {nome_responsavel}.

1. OBJETO

Locação do espaço para evento de casamento a realizar-se em {data_evento}, das {horario_inicio_locacao} às {horario_fim_locacao}.

2. ITENS INCLUSOS NA LOCAÇÃO

{itens_inclusos} (ex: mesas, cadeiras, estacionamento, geradores, banheiros, cozinha de apoio — conforme negociado).

3. CAPACIDADE

O espaço comporta até {capacidade_max} pessoas. O número de convidados não poderá exceder esse limite por determinação legal.

4. REGRAS DO ESPAÇO

4.1. Horário máximo de funcionamento: conforme alvará do espaço.

4.2. Fornecedores externos: permitidos/não permitidos (especificar restrições).

4.3. Decoração: permitida mediante aprovação prévia do espaço.

4.4. Som: limite de decibéis conforme legislação municipal.

5. VISTORIA

5.1. Vistoria de entrega do espaço realizada antes do evento com representante de ambas as partes.

5.2. Vistoria de devolução realizada após o evento.

5.3. Danos identificados na devolução serão cobrados dos CONTRATANTES.

6. VALORES E PAGAMENTO

6.1. Valor total: R$ {valor_total}.

6.2. Entrada de R$ {valor_entrada} até {data_entrada}.

6.3. Saldo de R$ {valor_saldo} até {data_saldo}.

7. CANCELAMENTO

7.1. Mais de 120 dias: perda da entrada.

7.2. Entre 120 e 60 dias: devido 50% do valor total.

7.3. Menos de 60 dias: devido 100% do valor total.

7.4. Cancelamento pelo espaço: devolução integral mais multa de 30% sobre o valor total.

8. FORO

Comarca de {cidade_evento}.

Assinado digitalmente em {data_contrato}.`
  },

  transporte: {
    titulo: "Contrato de Prestação de Serviços de Transporte",
    variaveis: [
      "nome_noivos", "data_evento", "local_evento", "cidade_evento",
      "nome_responsavel", "nome_empresa", "telefone", "email",
      "valor_total", "valor_entrada", "data_entrada", "valor_saldo", "data_saldo",
      "data_contrato", "descricao_veiculo", "descricao_trajetos", "horarios_transporte", "horario_disponibilidade"
    ],
    conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE TRANSPORTE

CONTRATANTES: {nome_noivos}
CONTRATADA: {nome_empresa}, representada por {nome_responsavel}.

1. OBJETO

Transporte dos noivos e/ou convidados para casamento a realizar-se em {data_evento}, {cidade_evento}.

2. SERVIÇOS

2.1. Veículo(s): {descricao_veiculo}.

2.2. Trajetos contratados: {descricao_trajetos}.

2.3. Horários: {horarios_transporte}.

2.4. O veículo estará disponível a partir das {horario_disponibilidade}.

3. CONDIÇÕES DO VEÍCULO

3.1. Veículo entregue limpo, abastecido e em perfeito estado de funcionamento.

3.2. Motorista devidamente habilitado e com apresentação adequada ao evento.

4. VALORES E PAGAMENTO

4.1. Valor total: R$ {valor_total}.

4.2. Entrada de R$ {valor_entrada} até {data_entrada}.

4.3. Saldo de R$ {valor_saldo} até {data_saldo}.

5. CANCELAMENTO

5.1. Mais de 30 dias: perda da entrada.

5.2. Menos de 30 dias: devido 100% do valor total.

6. FORO

Comarca de {cidade_evento}.

Assinado digitalmente em {data_contrato}.`
  },

  papelaria: {
    titulo: "Contrato de Prestação de Serviços de Papelaria",
    variaveis: [
      "nome_noivos", "data_evento", "local_evento", "cidade_evento",
      "nome_responsavel", "nome_empresa", "telefone", "email",
      "valor_total", "valor_entrada", "data_entrada", "valor_saldo", "data_saldo",
      "data_contrato", "itens_papelaria", "n_propostas", "prazo_proposta", "n_revisoes",
      "data_aprovacao", "data_entrega_impressos"
    ],
    conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PAPELARIA

CONTRATANTES: {nome_noivos}
CONTRATADA: {nome_empresa}, representada por {nome_responsavel}.

1. OBJETO

Criação e produção de papelaria para casamento a realizar-se em {data_evento}.

2. ITENS CONTRATADOS

{itens_papelaria} (ex: convites, envelopes, tags, cardápios, mapa de mesas, itens de mesa).

3. PROCESSO CRIATIVO

3.1. A CONTRATADA apresentará {n_propostas} proposta(s) de identidade visual em até {prazo_proposta} dias após assinatura.

3.2. Os CONTRATANTES terão direito a {n_revisoes} rodada(s) de revisão.

3.3. Após aprovação final, alterações implicam custo adicional.

4. PRAZOS DE ENTREGA

4.1. Aprovação final do projeto: até {data_aprovacao}.

4.2. Entrega dos itens impressos: até {data_entrega_impressos}.

4.3. A CONTRATADA não se responsabiliza por atrasos decorrentes de aprovação fora do prazo pelos CONTRATANTES.

5. PROPRIEDADE INTELECTUAL

O projeto gráfico criado é de propriedade dos CONTRATANTES após quitação integral.

6. VALORES E PAGAMENTO

6.1. Valor total: R$ {valor_total}.

6.2. Entrada de R$ {valor_entrada} até {data_entrada}.

6.3. Saldo de R$ {valor_saldo} até {data_saldo}.

7. CANCELAMENTO

7.1. Cancelamento após aprovação do projeto: devido 100% do valor total.

7.2. Cancelamento antes da aprovação: perda da entrada.

8. FORO

Comarca de {cidade_evento}.

Assinado digitalmente em {data_contrato}.`
  },

  celebrante: {
    titulo: "Contrato de Prestação de Serviços de Celebração",
    variaveis: [
      "nome_noivos", "data_evento", "local_evento", "cidade_evento",
      "nome_responsavel", "nome_empresa", "telefone", "email",
      "valor_total", "valor_entrada", "data_entrada", "valor_saldo", "data_saldo",
      "data_contrato", "n_reunioes", "duracao_cerimonia"
    ],
    conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CELEBRAÇÃO

CONTRATANTES: {nome_noivos}
CONTRATADO: {nome_responsavel}, doravante denominado CONTRATADO.

1. OBJETO

Condução da cerimônia de casamento a realizar-se em {data_evento}, no endereço {local_evento}, {cidade_evento}.

2. SERVIÇOS

2.1. Reuniões de alinhamento: {n_reunioes} encontros presenciais ou por videoconferência.

2.2. Elaboração do roteiro personalizado da cerimônia.

2.3. Condução da cerimônia no dia do evento.

2.4. Duração estimada da cerimônia: {duracao_cerimonia} minutos.

3. PERSONALIZAÇÃO

A cerimônia será construída com base na história do casal. O roteiro final será aprovado pelos CONTRATANTES com no mínimo 15 dias de antecedência.

4. VALORES E PAGAMENTO

4.1. Valor total: R$ {valor_total}.

4.2. Entrada de R$ {valor_entrada} até {data_entrada}.

4.3. Saldo de R$ {valor_saldo} até {data_saldo}.

5. CANCELAMENTO

5.1. Mais de 60 dias: perda da entrada.

5.2. Menos de 60 dias: devido 100% do valor total.

5.3. Cancelamento pelo CONTRATADO: devolução integral mais multa de 20%.

6. FORO

Comarca de {cidade_evento}.

Assinado digitalmente em {data_contrato}.`
  }
};

/**
 * Gera o contrato preenchido com os dados do fornecedor/evento.
 * @param {string} categoria - Chave do template (ex: 'fotografia', 'buffet', 'decoracao', etc.)
 * @param {Object} dados - Objeto com as variáveis a serem substituídas
 * @returns {{ titulo: string, variaveis: string[], conteudo: string } | null}
 */
export function gerarContrato(categoria, dados) {
  const template = TEMPLATES[categoria];
  if (!template) return null;

  let conteudo = template.conteudo;
  Object.entries(dados).forEach(([key, value]) => {
    conteudo = conteudo.replaceAll(`{${key}}`, value || '___');
  });

  // Limpa variáveis não preenchidas que ainda restam no texto
  conteudo = conteudo.replace(/\{[^}]+\}/g, '___');

  return { ...template, conteudo };
}

/**
 * Retorna a lista de categorias disponíveis com título e chave.
 */
export function listarTemplates() {
  return Object.entries(TEMPLATES).map(([chave, template]) => ({
    chave,
    titulo: template.titulo,
  }));
}

/**
 * Retorna as variáveis de um template específico.
 */
export function getVariaveisTemplate(categoria) {
  return TEMPLATES[categoria]?.variaveis || [];
}

export default TEMPLATES;