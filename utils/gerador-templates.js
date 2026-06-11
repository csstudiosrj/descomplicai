// utils/gerador-templates.js (v2 limpa)
const TEMPLATES_POR_ESTILO = {
    classico: {
      identidade: [
        "A identidade visual de {{NOME_CASAL}} respira sofisticação atemporal. A paleta {{PALETA}} une pureza e profundidade. O estilo clássico se revela em texturas nobres: rendas, veludos e papéis texturizados que convidam ao toque.",
        "O classicismo de {{NOME_CASAL}} é traduzido na paleta {{PALETA}}. Monogramas heráldicos, tipografia serifada e o brilho suave dos metais envelhecidos compõem uma comunicação visual que exala elegância e tradição.",
      ],
      cerimonia: [
        "A cerimônia {{CERIMONIA}} acontecerá em {{LOCAL}} durante o {{HORARIO}}. O altar, emoldurado por flores da estação e castiçais altos, será o cenário para a troca de votos. Um quarteto de cordas executará peças clássicas, criando uma atmosfera de profunda emoção.",
        "Em {{LOCAL}}, sob a luz do {{HORARIO}}, os noivos celebrarão o rito {{CERIMONIA}}. O corredor, ladeado por candelabros e pétalas, conduzirá ao altar adornado com arranjos simétricos. A música instrumental preencherá o silêncio com elegância.",
      ],
      decoracao: [
        "A decoração exalta texturas botânicas e camadas de luz. Arranjos mesclam flores em tons suaves com folhagens densas. A iluminação {{ILUMINACAO}} destaca cada detalhe com precisão, enquanto velas em castiçais criam um jogo de sombras acolhedor.",
        "O salão se transforma em um palácio de luz e flores. Lustres de cristal pontuam o teto, e as mesas redondas recebem centros de mesa altos, permitindo a visão e a conversa. A paleta {{PALETA}} aparece em cada detalhe, dos guardanapos aos sousplats.",
      ],
      mesaPosta: [
        "Pratos de porcelana com bordas douradas, talheres de prata polida e taças de cristal lapidado compõem a mesa posta. Guardanapos de linho são presos por anéis personalizados, e o centro de mesa exibe arranjos florais baixos que convidam à conversa.",
        "Sousplats de ráfia em tom areia, louça de porcelana filetada a ouro e talheres de prata envelhecida. Os marcadores de lugar são folhas secas com os nomes caligrafados em tinta dourada. Um arranjo baixo e irregular decora cada mesa.",
      ],
      alimentacao: [
        "Jantar empratado de três tempos, com entrada, prato principal e sobremesa. O open bar completo oferece espumante, vinhos selecionados e drinks clássicos. Pães artesanais são servidos em cestas de vime com manteiga aerada de ervas.",
        "Buffet livre com ilhas gastronômicas que oferecem desde frutos do mar a carnes nobres. O bar premium disponibiliza destilados, coquetéis autorais e uma seleção de vinhos. O serviço é impecável, com garçons atentos a cada detalhe.",
      ],
      entretenimento: [
        "{{MUSICA}} comandam a trilha sonora: durante o coquetel, música suave; no jantar, jazz e MPB instrumental. Após a valsa, a pista ganha vida com luzes cênicas. {{ATIVIDADES}} completam a experiência.",
        "A noite é embalada por {{MUSICA}} que alternam entre clássicos românticos e sucessos dançantes. {{ATIVIDADES}} diverte os convidados. A iluminação cênica sincronizada transforma a pista em um espetáculo.",
      ],
      vestuario: [
        "A noiva veste um vestido princesa com renda chantilly, saia de tule e cauda modesta. O noivo usa terno slim azul-marinho com gravata borboleta. Maquiagem iluminada e penteado estruturado completam o visual clássico.",
        "Ela deslumbra com um vestido de princesa em renda francesa e saia volumosa. Ele veste smoking clássico preto com lapela de cetim. A beleza é atemporal: coque polido, pele impecável e batom em tom rosado.",
      ],
      papelaria: [
        "Convite físico em papel algodão com hot stamping dourado, sobrecapa de papel vegetal e lacre de cera personalizado. Menus, tags de agradecimento e plaquinhas de mesa seguem a mesma identidade luxuosa.",
        "Os convites em papel texturizado trazem as iniciais do casal em relevo dourado. O envelope é forrado e fechado com selo de cera. A papelaria do evento mantém a coerência visual em cada peça.",
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
    rustico: {
      identidade: [
        "A identidade de {{NOME_CASAL}} é uma homenagem à terra. A paleta {{PALETA}} evoca o campo, com texturas de madeira recuperada, fibras naturais e cerâmica artesanal. A tipografia é serifada e robusta, inspirada em rótulos de produtos coloniais.",
        "O estilo rústico se revela na paleta {{PALETA}} que remete às paisagens do interior. Papel kraft, juta e linho cru transmitem autenticidade. Detalhes em cobre envelhecido adicionam sofisticação terrosa.",
      ],
      cerimonia: [
        "Em {{LOCAL}}, ao ar livre durante o {{HORARIO}}, o altar é uma estrutura de troncos de eucalipto entrelaçados com flores do campo. O caminho é forrado de tapetes de sisal, ladeado por lanternas de ferro e velas flutuantes em bacias de cerâmica.",
        "A cerimônia {{CERIMONIA}} acontece sob a luz do {{HORARIO}} em {{LOCAL}}. Bancos de madeira e cadeiras de palha acomodam os convidados. Um violonista e um violoncelista executam arranjos acústicos que ecoam pelo campo.",
      ],
      decoracao: [
        "Mesas de madeira maciça sem toalhas, expondo veios e marcas do tempo. Centros de mesa com flores do campo e velas em potes de vidro reciclado. {{ILUMINACAO}} criam uma atmosfera íntima e acolhedora.",
        "A decoração abraça o natural: cadeiras desencontradas, almofadas de linho e mantas de patchwork. Arranjos assimétricos combinam flores frescas com capim-dos-pampas. A luz de lampiões e velas preenche o ambiente.",
      ],
      mesaPosta: [
        "Sousplats de madeira natural, pratos de cerâmica artesanal em tons de areia e talheres com cabos de madeira. Guardanapos de linho cru amarrados com cordão de juta e raminhos de alecrim fresco decoram cada lugar.",
        "Mesas longas de madeira recuperada, sem toalhas, com corredores de folhas de eucalipto. Louça de barro esmaltado, copos de vidro reciclado e talheres vintage. Cartões escritos à mão em papel kraft com um raminho de lavanda.",
      ],
      alimentacao: [
        "Fogão a lenha com panelas de barro: frango caipira, tutu de feijão, arroz com pequi e uma ilha de queijos artesanais. Saladas frescas da horta orgânica e pães de fermentação natural. Bebidas incluem espumante e sucos naturais.",
        "Estações gastronômicas com carnes na chapa, massas frescas e saladas orgânicas. O bar de drinks autorais cria coquetéis com ingredientes da estação. Doces tradicionais encerram a experiência.",
      ],
      entretenimento: [
        "{{MUSICA}} toca folk, MPB e samba de raiz. Uma fogueira central é acesa ao cair da noite, rodeada por puffs e mantas. {{ATIVIDADES}} completam o clima de festa no campo.",
        "{{MUSICA}} comandam a pista com brasilidades. {{ATIVIDADES}} diverte adultos e crianças. O terreiro se transforma naturalmente em pista de dança sob as estrelas.",
      ],
      vestuario: [
        "A noiva usa vestido fluido com mangas de renda, cabelo semi-preso com flores do campo. O noivo veste terno de linho em tom areia, sem gravata, com sapatos de couro camurça. Maquiagem natural, pele iluminada e blush terracota.",
        "Trajes leves: ela com vestido boho de bordados florais, ele com suspensórios e camisa de algodão cru. Ambos usam acessórios artesanais e flores na lapela ou no cabelo.",
      ],
      papelaria: [
        "Convites em papel kraft com impressão letterpress em tons terrosos. Envelopes forrados com papel estampado floral. Menus em placas de madeira gravadas a laser. Place cards em pedras lisas pintadas manualmente.",
        "Papelaria ecológica: papel reciclado com impressão botânica, envolto em tecido de algodão cru amarrado com ráfia. Site do casal com timeline ilustrada em aquarela.",
      ],
      fornecedores: [
        "Cerimonialista, Espaço ao ar livre, Buffet de cozinha regional, Decoração com flores do campo, Iluminação rústica, Música ao vivo, Fotografia documental, Mobiliário de madeira, Papelaria artesanal."
      ],
      linhaTempo: [
        "14 meses antes: escolha do sítio e definição da data. 12 meses: fechar cerimonialista, buffet e iluminação. 9 meses: produção artesanal da papelaria e lembranças. 6 meses: prova do vestido e terno; degustação do buffet. 4 meses: envio dos convites. 1 mês: confirmação de presenças e visita técnica."
      ],
      checklist: [
        "Confirmar a data na estação seca. Escolher as espécies de flores do campo que estarão na safra. Contratar banheiros ecológicos e gerador. Preparar plano B para chuva. Personalizar as mantas para os convidados."
      ],
      orcamento: [
        "Espaço e infraestrutura: 15%. Buffet e bebidas: 25%. Decoração e flores: 20%. Música e entretenimento: 8%. Vestuário e beleza: 8%. Fotografia e vídeo: 10%. Papelaria artesanal: 4%. Cerimonialista: 5%. Reserva: 5%."
      ]
    },
    boho: {
      identidade: [
        "A identidade de {{NOME_CASAL}} é um poema de liberdade. A paleta {{PALETA}} evoca pores do sol e texturas naturais: macramê, tapeçarias e aquarelas florais. A tipografia é orgânica e fluida, como se escrita à mão pela natureza.",
        "O estilo boho se traduz na paleta {{PALETA}} com ilustrações botânicas, penas estilizadas e padrões suaves. Linho lavado, rattan e papel reciclado dominam a comunicação visual.",
      ],
      cerimonia: [
        "Em {{LOCAL}}, durante o {{HORARIO}}, um altar assimétrico de madeira e macramê é adornado com flores secas e fitas esvoaçantes. Os convidados sentam-se em puffs, almofadas e bancos de madeira, próximos ao chão e à natureza.",
        "A cerimônia {{CERIMONIA}} acontece em um círculo de pedras e tapetes persas, sob a luz do {{HORARIO}}. O arco é uma instalação de galhos secos e flores silvestres. Música acústica com violão, harpa e vozes suaves embala o ritual.",
      ],
      decoracao: [
        "Lounges com puffs de couro e algodão cru, mesas baixas de madeira com tampos de mosaico e tapeçarias penduradas. {{ILUMINACAO}} criam uma atmosfera mágica e envolvente.",
        "Arranjos desconstruídos de flores secas e frescas em vasos de cerâmica artesanal. Macramês suspensos sustentam velas e plantas. Tapetes sobrepostos, almofadas bordadas e lanternas marroquinas completam o cenário.",
      ],
      mesaPosta: [
        "Pratos de cerâmica com esmalte irregular, talheres vintage garimpados e copos coloridos de vidro soprado. Guardanapos de algodão com estampas étnicas e argolas de madeira ou miçangas decoram cada lugar.",
        "Mesas comunitárias de madeira clara, sem toalhas, com runners de macramê. Louça mix and match, taças de vidro colorido e sousplats de palha. Pequenos vasos com flores secas e velas flutuantes enfeitam o centro.",
      ],
      alimentacao: [
        "Estações gastronômicas com comida de rua gourmet: tacos, espetinhos e mini bowls de açaí. Drinks autorais com ingredientes botânicos e frutas tropicais, servidos em copos de cerâmica.",
        "Finger foods criativos, tábuas de queijos e frios, e estação de chás e infusões. O bar oferece coquetéis com ervas frescas e flores comestíveis em taças de vidro colorido.",
      ],
      entretenimento: [
        "{{MUSICA}} toca folk, indie e world music. {{ATIVIDADES}} garantem a diversão. Uma área de descanso com redes e almofadas convida à contemplação das estrelas.",
        "A pista é livre e animada por {{MUSICA}}. {{ATIVIDADES}} registra momentos espontâneos. Um varal de fotos polaroid e uma mesa de desejos com fitas coloridas envolvem os convidados.",
      ],
      vestuario: [
        "A noiva veste um vestido fluido de renda com mangas amplas, coroa de flores secas e sandálias rasteiras. O noivo usa camisa de linho aberta, calça de sarja e alpargatas. Estilo despojado e romântico.",
        "Ela com macacão de renda ou vestido assimétrico, ele com colete e gravata borboleta despojada. Colares de sementes, pulseiras de couro e flores naturais completam o visual boho-chic.",
      ],
      papelaria: [
        "Convites em papel texturizado com aquarelas florais, envelopes de papel craft com lacre de cera colorida. Menus em formato de leque e place cards em folhas secas com caligrafia manual.",
        "Convite digital animado com ilustrações botânicas e trilha acústica. Tags de agradecimento, plaquinhas de mesa e mapa ilustrado do local mantêm a identidade.",
      ],
      fornecedores: [
        "Cerimonialista, Espaço ao ar livre, Decorador boho, Florista de flores secas, Serviço de coquetel, Bartender de drinks autorais, Música acústica, Fotógrafo fine art, Mobiliário lounge, Papelaria artesanal."
      ],
      linhaTempo: [
        "12 meses antes: reserva do espaço e definição do conceito. 9 meses: fechamento dos fornecedores. 6 meses: escolha do vestido e produção da papelaria. 4 meses: envio dos convites. 2 meses: degustação e ajustes. 1 mês: confirmação de presenças."
      ],
      checklist: [
        "Definir plano B para chuva. Selecionar as flores secas da estação. Confirmar curadoria musical. Testar iluminação de velas e fairy lights. Organizar transporte para convidados."
      ],
      orcamento: [
        "Espaço e estrutura: 18%. Alimentação e bebidas: 28%. Decoração e flores: 20%. Música e entretenimento: 10%. Vestuário e beleza: 8%. Fotografia e vídeo: 8%. Papelaria: 3%. Cerimonialista: 5%."
      ]
    }
  };
  
  // Estilos ainda não preenchidos usarão fallback (sorteio entre os existentes)
  function aleatorio(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
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
  
  function getTemplatesGenéricos() {
    const estilos = Object.keys(TEMPLATES_POR_ESTILO);
    const estiloAleatorio = aleatorio(estilos);
    return TEMPLATES_POR_ESTILO[estiloAleatorio];
  }
  
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