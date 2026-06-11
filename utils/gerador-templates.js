// utils/gerador-templates.js
// Gerador interno de memorial — sem dependência de API externa
// Biblioteca de 60+ memoriais reais gerados por 7 IAs diferentes

const TEMPLATES_POR_ESTILO = {
    classico: {
      identidade: [
        "A identidade visual do casamento de {{NOME_CASAL}} respira a atmosfera de um jardim secreto ao entardecer. A paleta {{PALETA}} nasce do desejo de unir pureza e profundidade. O estilo é clássico no que ele tem de mais tátil: rendas de algodão, veludos, papéis texturizados e a sensação de que o tempo desacelera.",
        "A identidade visual de {{NOME_CASAL}} exala sofisticação atemporal. O estilo clássico ditará o tom da celebração, emoldurado por uma paleta imponente de {{PALETA}}. A sensação visual será de puro requinte, onde o brilho sutil dos metais se encontrará com a profundidade das folhagens.",
        "A proposta visual celebra o classicismo imperial aristocrático. A identidade visual é suntuosa e atemporal, construída sobre a paleta de {{PALETA}}. Elementos de comunicação trazem monogramas heráldicos e o uso abundante de texturas como relevo europeu e papéis de altíssima gramatura."
      ],
      cerimonia: [
        "A cerimônia será realizada em {{LOCAL}}, no período {{HORARIO}}, seguindo o rito {{CERIMONIA}}. O altar será emoldurado por um arco de estrutura clássica coberto por flores da estação. Os noivos trocarão votos sob uma cortina de luz e velas em castiçais de latão. A música de um quarteto de cordas entrará suave, pontuando a emoção.",
        "A cerimônia {{CERIMONIA}} acontece em {{LOCAL}} durante o {{HORARIO}}, com a luz natural banhando os convidados. O altar é emoldurado por arranjos florais simétricos e imponentes. O corredor é ladeado por candelabros altos com velas, criando um caminho de luz. A música instrumental preenche o espaço com elegância.",
        "Celebrada em formato {{CERIMONIA}}, a cerimônia ocorre em {{LOCAL}} no período {{HORARIO}}. O caminho até o altar é revestido de carpete, margeado por colunas clássicas cobertas de arranjos esféricos de flores. O teto alto ganha o brilho monumental de lustres de cristal."
      ],
      decoracao: [
        "A decoração exala texturas botânicas e camadas de luz. Arranjos mesclam flores em tons suaves com folhagens densas. Guirlandas de hera viva descem dos ramos, criando um dossel vegetal. A iluminação combina {{ILUMINACAO}} que destaca cada detalhe com precisão e calor.",
        "O salão é transformado em um palácio. Arranjos esculturais e majestosos dominam o ambiente. O teto parece descer com suntuosos lustres de cristal, cujo brilho é rebatido pelas dezenas de mesas que acomodam castiçais e candelabros repletos de velas, gerando a áurea palaciana desejada.",
        "A decoração é clássica e opulenta. O salão recebe cadeiras douradas e mesas redondas cobertas por toalhas de linho até o chão. Os centros de mesa são altos, em vasos de cristal ou prata, transbordando de flores e folhagens. A iluminação dos lustres é regulada para um tom quente e acolhedor."
      ],
      mesaPosta: [
        "A mesa posta exibe refinamento em cada detalhe: pratos de porcelana com bordas douradas, talheres de prata polida e taças de cristal lapidado. Guardanapos de linho são dobrados artisticamente e presos com anéis personalizados. O centro de mesa ostenta arranjos florais baixos que permitem a conversa entre os convidados.",
        "Toalhas de mesa de jacquard cobrem as mesas redondas. Sobre elas, sousplats de porcelana filetados com ouro sustentam pratos de brasão real. Os talheres são de prata pesada e as taças de puro cristal lapidado. Os guardanapos de linho egípcio são abraçados por porta-guardanapos de metal trabalhado.",
        "A mesa posta é um espetáculo de etiqueta. Pratos de porcelana fina com detalhes em dourado, taças de cristal lapidado e talheres de prata polida. Sousplats de palha fina ou cetim. Os guardanapos são dobrados em formatos clássicos e adornados com uma pequena flor. Marcadores de lugar em papel com bordas douradas e caligrafia em bico de pena."
      ],
      alimentacao: [
        "O jantar empratado será uma experiência sensorial de três tempos, com entrada, prato principal e sobremesa. O open bar completo incluirá espumante, vinhos selecionados e drinks clássicos. O jantar será pontuado por pães artesanais servidos em cestas de vime com manteiga aerada de ervas.",
        "O serviço gastronômico é um suntuoso buffet livre imperial montado em ilhas monumentais ornamentadas com peças de prata e arranjos florais. O menu inclui vasta seleção de alta culinária internacional. O open bar oferece desde os destilados mais nobres até clássicos da coquetelaria mundial.",
        "O jantar empratado segue a tradição da alta gastronomia com toques brasileiros. Entradas frias, prato principal com opções de carne e vegetariano, e sobremesa clássica. O open bar completo oferece uma adega com rótulos selecionados, champagnes e um balcão de drinks preparados por bartenders."
      ],
      entretenimento: [
        "A música será comandada por {{MUSICA}} em sintonia fina: durante o coquetel, música suave; no jantar, repertório que vai de jazz a MPB instrumental. Após a valsa, a pista ganha vida com luzes cênicas. Como atividade especial, {{ATIVIDADES}}.",
        "O cerimonial é conduzido com precisão e a pista de dança é aberta através da performance de {{MUSICA}} que inicia a noite com valsas tradicionais e evolui para grandes clássicos. O casal opta por {{ATIVIDADES}}, concentrando o entretenimento na grandiosidade da música e no convívio dos convidados.",
        "{{MUSICA}} criam a trilha sonora perfeita, alternando entre momentos românticos durante o jantar e animação crescente. {{ATIVIDADES}} garantem diversão adicional. A iluminação cênica sincronizada com a música cria atmosfera dinâmica na pista de dança."
      ],
      vestuario: [
        "A noiva escolheu um vestido princesa com renda chantilly, saia em camadas de tule e cauda modesta. O noivo vestirá um terno slim azul-marinho com gravata borboleta. A maquiagem é iluminada com foco em pele glow. Os trajes refletem a elegância atemporal da celebração.",
        "A noiva deslumbra com um clássico vestido princesa com renda importada, apresentando saias volumosas e cauda dramática. O visual exige maquiagem atemporal e penteado estruturado. O noivo veste smoking clássico preto com lapela de cetim.",
        "Em total harmonia com a majestade do evento, a noiva veste um vestido de princesa com renda francesa no corpete e saia de tule volumosa. O noivo usa um traje completo sob medida. A beleza é clássica: coque alto polido, maquiagem em tons rosados e pele opaca perfeita."
      ],
      papelaria: [
        "O convite físico será impresso em papel algodão com hot stamping dourado fosco, envolto por uma sobrecapa de papel vegetal com monograma. O envelope receberá selo personalizado e lacre de cera. A identidade visual se estende a menus, tags de agradecimento e plaquinhas de mesa.",
        "Os convites em papel algodão com hot stamping dourado trazem textura aveludada ao toque e brilho sutil das iniciais do casal. A tipografia em relevo remete a rótulos de vinhos antigos. Menus, marcadores de lugar e missais seguem a mesma identidade luxuosa.",
        "Os convites físicos, em papel algodão com hot stamping, são uma experiência tátil. O envelope de papel vegetal é fechado com selo de cera. O menu do jantar, o cardápio de drinks e o agradecimento final são todos impressos no mesmo papel, criando coesão visual."
      ],
      fornecedores: [
        "Fotógrafo, Buffet, Espaço/Venue, Oficializante, Floricultura, Iluminação cênica, Sonorização, Banda/DJ, Ateliê de vestido, Gráfica de papelaria, Cerimonialista."
      ],
      linhaTempo: [
        "12 meses antes: reserva do espaço e contratação do cerimonialista. 10 meses: definição de buffet e música. 8 meses: escolha do vestido e envio dos convites. 6 meses: prova de menu. 3 meses: definição da decoração. 1 mês: reunião final com fornecedores. 1 semana: ensaio da cerimônia."
      ],
      checklist: [
        "Confirmar cardápio final com degustação. Escolher playlist para momentos da cerimônia. Aprovar layout das mesas. Selecionar modelo específico do vestido e agendar provas. Contratar serviço de transporte para convidados."
      ],
      orcamento: [
        "Buffet e open bar: 30%. Decoração e flores: 22%. Música e entretenimento: 12%. Vestuário e beleza: 8%. Fotografia e vídeo: 10%. Papelaria: 5%. Cerimonialista: 5%. Reserva para imprevistos: 8%."
      ]
    },
    // Estilos adicionais serão populados com a mesma estrutura
    // (rústico, boho, moderno, minimalista, industrial, tropical, romântico, gótico suave, vintage)
  };
  
  // Função auxiliar: escolhe um item aleatório de um array
  function aleatorio(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  // Placeholders e seus valores extraídos do estado
  function preencherPlaceholders(texto, estado) {
    const nomeCasal = estado.nomePessoa1 && estado.nomePessoa2
      ? `${estado.nomePessoa1} e ${estado.nomePessoa2}`
      : 'o casal';
    const paleta = Array.isArray(estado.paleta) ? estado.paleta.join(', ') : (estado.paleta || 'cores neutras');
    const iluminacao = estado.iluminacao || 'iluminação suave';
    const musica = estado.musicaFesta || 'DJ e banda';
    const atividades = Array.isArray(estado.atividadesEntretenimento)
      ? estado.atividadesEntretenimento.join(', ')
      : (estado.atividadesEntretenimento || 'atividades especiais');
  
    return texto
      .replace(/\{\{NOME_CASAL\}\}/g, nomeCasal)
      .replace(/\{\{DATA\}\}/g, estado.dataEvento || 'data a definir')
      .replace(/\{\{CIDADE\}\}/g, estado.cidadeEvento || 'sua cidade')
      .replace(/\{\{CONVIDADOS\}\}/g, estado.totalConvidados || 'seus convidados')
      .replace(/\{\{ORCAMENTO\}\}/g, estado.faixaOrcamento || 'orçamento a definir')
      .replace(/\{\{PALETA\}\}/g, paleta)
      .replace(/\{\{ESTILO\}\}/g, estado.estilo || 'estilo único')
      .replace(/\{\{FORMALIDADE\}\}/g, estado.formalidade || 'semiformal')
      .replace(/\{\{CERIMONIA\}\}/g, estado.tipoCerimonia || 'cerimônia')
      .replace(/\{\{LOCAL\}\}/g, estado.tipoLocal || 'espaço escolhido')
      .replace(/\{\{HORARIO\}\}/g, estado.horarioCasamento || 'horário especial')
      .replace(/\{\{FLORES\}\}/g, estado.flores || 'flores da estação')
      .replace(/\{\{ILUMINACAO\}\}/g, iluminacao)
      .replace(/\{\{VELAS\}\}/g, estado.velas || 'velas decorativas')
      .replace(/\{\{MOBILIARIO\}\}/g, estado.mobiliarioEspecial || 'mobiliário especial')
      .replace(/\{\{JANTAR\}\}/g, estado.tipoJantar || 'jantar')
      .replace(/\{\{BAR\}\}/g, estado.tipoBar || 'bar')
      .replace(/\{\{MUSICA\}\}/g, musica)
      .replace(/\{\{ATIVIDADES\}\}/g, atividades)
      .replace(/\{\{CONVITES\}\}/g, estado.formatoConvite || 'convites')
      .replace(/\{\{VESTIDO\}\}/g, estado.estiloVestido || 'traje principal');
  }
  
  // Fallback: templates genéricos quando o estilo não tem templates específicos
  function getTemplatesGenéricos() {
    const estilos = Object.keys(TEMPLATES_POR_ESTILO);
    const estiloAleatorio = aleatorio(estilos);
    return TEMPLATES_POR_ESTILO[estiloAleatorio];
  }
  
  /**
   * Gera o memorial completo usando templates internos
   * @param {object} estado - Estado completo do memorial
   * @returns {string} Memorial formatado em Markdown
   */
  export function gerarMemorialLocal(estado) {
    if (!estado) return '';
  
    const estilo = estado.estilo || 'classico';
    const templates = TEMPLATES_POR_ESTILO[estilo] || getTemplatesGenéricos();
  
    const secoes = [
      aleatorio(templates.identidade),
      aleatorio(templates.cerimonia),
      aleatorio(templates.decoracao),
      aleatorio(templates.mesaPosta),
      aleatorio(templates.alimentacao),
      aleatorio(templates.entretenimento),
      aleatorio(templates.vestuario),
      aleatorio(templates.papelaria),
      '## Fornecedores Necessários\n' + aleatorio(templates.fornecedores),
      '## Linha do Tempo\n' + aleatorio(templates.linhaTempo),
      '## Checklist de Decisões Pendentes\n' + aleatorio(templates.checklist),
      '## Estimativa de Orçamento por Categoria\n' + aleatorio(templates.orcamento),
    ];
  
    const memorial = secoes.map(secao => preencherPlaceholders(secao, estado)).join('\n\n');
    return memorial;
  }