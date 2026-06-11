// utils/gerador-templates.js
// Gerador interno de memorial — templates extraídos de 60+ memoriais reais

const TEMPLATES_POR_ESTILO = {
    // ========== CLÁSSICO ==========
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
  
    // ========== RÚSTICO ==========
    rustico: {
      identidade: [
        "A identidade visual de {{NOME_CASAL}} é uma homenagem à terra. A paleta {{PALETA}} evoca o interior do Brasil, com texturas de madeira recuperada, fibras naturais e o calor da cerâmica artesanal. A tipografia é serifada e robusta, inspirada em rótulos de produtos coloniais.",
        "O estilo rústico se revela na paleta {{PALETA}} que remete às paisagens do campo. A identidade visual utiliza papel kraft, juta e linho cru, transmitindo autenticidade e aconchego. Detalhes em cobre envelhecido aparecem sutilmente, adicionando sofisticação terrosa ao conjunto.",
        "A comunicação visual do casamento de {{NOME_CASAL}} abraça o natural: madeira de demolição, cerâmicas artesanais e fibras como ráfia e sisal. A paleta {{PALETA}} é suave e orgânica, como a terra, a palha e as folhas de oliveira."
      ],
      cerimonia: [
        "A cerimônia será realizada em {{LOCAL}}, ao ar livre, durante o {{HORARIO}}. O altar é uma estrutura de troncos de eucalipto entrelaçados com flores do campo e ramos de oliveira. O caminho é forrado de tapetes de sisal, ladeado por velas em lanternas de ferro e bacias de cerâmica com velas flutuantes.",
        "Sob a luz do {{HORARIO}}, a cerimônia {{CERIMONIA}} acontece em {{LOCAL}} com um altar de madeira rústica coberto por tecido de linho cru. Os convidados sentam-se em bancos de madeira ou cadeiras de palha, próximos à natureza. A música é tocada por um violonista e um violoncelista, em arranjos acústicos que ecoam pelo campo.",
        "A celebração em {{LOCAL}} é marcada pela simplicidade e beleza natural. O altar é composto por uma mesa de madeira de demolição com arranjos de flores secas, trigo e lavanda. O {{HORARIO}} banha o espaço com luz dourada, e os noivos trocam votos sob um dossel de galhos e folhagens."
      ],
      decoracao: [
        "A decoração é uma celebração do natural. Mesas de madeira maciça sem toalhas, expondo veios e marcas do tempo. Centros de mesa com flores do campo, ramos de eucalipto e velas em potes de vidro reciclado. Pendentes de macramê sustentam velas, e gambiarras de lâmpadas de filamento cruzam o terreiro.",
        "A decoração rústica abraça imperfeições charmosas: cadeiras desencontradas, almofadas de linho, mantas de patchwork. Arranjos assimétricos combinam flores frescas com elementos secos como capim-dos-pampas. {{ILUMINACAO}} criam uma atmosfera íntima e acolhedora.",
        "O espaço se transforma em um cenário bucólico com mobiliário de madeira rústica, centros de mesa com flores silvestres em vasos de barro, e iluminação de lampiões e velas. A natureza é a protagonista, com feixes de trigo seco e alfazema amarrados em colunas de madeira."
      ],
      mesaPosta: [
        "A mesa posta é uma homenagem à simplicidade nobre. Sousplats de madeira natural, pratos de cerâmica artesanal em tons de areia, talheres de aço inoxidável com cabos de madeira. Guardanapos de linho cru amarrados com cordão de juta e raminhos de alecrim fresco.",
        "Mesas longas de madeira recuperada sem toalhas, com corredores de folhas de eucalipto. Louça de barro esmaltado em tons terrosos, copos de vidro reciclado e talheres vintage. Cada lugar tem um cartão escrito à mão em papel kraft com um raminho de lavanda.",
        "A mesa posta é despojada e autêntica: pratos de faiança com esmalte craquelado, talheres de aço escovado, copos de vidro grosso e guardanapos tingidos com pigmentos naturais. O marcador de lugar é uma plaquinha de madeira queimada com o nome pirografado."
      ],
      alimentacao: [
        "O jantar valoriza a cozinha afetiva: fogão a lenha montado no local, panelas de barro com frango caipira, tutu de feijão, arroz com pequi e uma ilha de queijos artesanais. Saladas frescas da horta orgânica e pães de fermentação natural completam a experiência.",
        "As estações gastronômicas oferecem uma viagem pela culinária regional: carnes na chapa, massas frescas, saladas orgânicas e uma mesa de queijos e embutidos locais. O bar de drinks autorais cria coquetéis com ingredientes da estação.",
        "Buffet livre com comida caseira servida em panelas de barro, pães artesanais, queijos da região e doces tradicionais. Bebidas incluem espumante, sucos naturais e drinks à base de cachaça artesanal."
      ],
      entretenimento: [
        "A música fica por conta de {{MUSICA}}, com repertório que mescla folk, MPB e samba de raiz. Uma fogueira central é acesa ao cair da noite, rodeada por puffs e mantas. {{ATIVIDADES}} completam o clima de festa no campo.",
        "{{MUSICA}} comandam a pista com brasilidades e sucessos dançantes. {{ATIVIDADES}} garante diversão aos convidados. O terreiro se transforma naturalmente em pista de dança sob as estrelas.",
        "A animação é orgânica: {{MUSICA}} toca durante toda a festa, enquanto {{ATIVIDADES}}. Ao redor de uma fogueira, os convidados assam marshmallows e ouvem causos, criando memórias afetivas."
      ],
      vestuario: [
        "A noiva usa um vestido fluido com mangas de renda, cabelo semi-preso com flores do campo. O noivo veste terno de linho em tom areia, sem gravata, com sapatos de couro camurça. A maquiagem é natural, com pele iluminada e blush terracota.",
        "Trajes leves e naturais: a noiva de vestido boho com bordados florais, o noivo de suspensórios e camisa de algodão cru. Ambos usam acessórios artesanais e flores na lapela ou no cabelo.",
        "O casal adota o estilo rústico-chique: ela com vestido de renda e botas de couro, ele com terno slim em tons terrosos. A beleza é natural, com cabelos soltos e maquiagem suave em tons de terra."
      ],
      papelaria: [
        "Convites em papel kraft com impressão letterpress em tons terrosos, envelopes forrados com papel estampado floral discreto. Menus em placas de madeira fina gravadas a laser. Place cards em pedras lisas pintadas manualmente.",
        "A papelaria usa papel reciclado com impressão botânica (técnica de cianotipia com folhas de oliveira), envolto em tecido de algodão cru amarrado com ráfia. O site do casal traz timeline com ilustrações aquareladas.",
        "Convites híbridos: versão física em papel kraft com letterpress e versão digital animada com ilustrações florais. Tags de agradecimento em papel semente que pode ser plantado após o evento."
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
  
    // ========== BOHO ==========
    boho: {
      identidade: [
        "A identidade visual de {{NOME_CASAL}} é um poema de liberdade e autenticidade. A paleta {{PALETA}} evoca pores do sol e texturas naturais: macramê, tapeçarias, franjas e aquarelas florais. A tipografia é orgânica e fluida, como se escrita à mão pela natureza.",
        "O estilo boho se traduz na paleta {{PALETA}} com uma atmosfera artística e descontraída. Elementos gráficos incluem ilustrações botânicas, penas estilizadas e padrões geométricos suaves. Texturas de linho lavado, rattan e papel reciclado dominam a comunicação.",
        "A celebração de {{NOME_CASAL}} tem identidade livre e criativa, ancorada na paleta {{PALETA}}. As cores remetem a terras distantes e mercados de artesanato, com tipografia manuscrita e detalhes em aquarela que transmitem movimento e leveza."
      ],
      cerimonia: [
        "A cerimônia será realizada em {{LOCAL}}, durante o {{HORARIO}}, com um altar assimétrico de madeira e macramê, adornado com flores secas, capim-dos-pampas e fitas esvoaçantes. Os convidados sentam-se em puffs, almofadas e bancos de madeira, próximos ao chão e à natureza.",
        "Em {{LOCAL}}, sob a luz do {{HORARIO}}, a cerimônia {{CERIMONIA}} acontece em um círculo de pedras e tapetes persas. O arco é uma instalação de galhos secos e flores silvestres. A música é acústica, com violão, harpa e vozes suaves.",
        "O ritual em {{LOCAL}} é íntimo e simbólico, com um altar montado sobre tapetes e almofadas. Flores secas e folhagens pendem de uma estrutura de bambu. Os noivos entram descalços, acompanhados por música folk instrumental."
      ],
      decoracao: [
        "A decoração é uma explosão de texturas e camadas: lounges com puffs de couro e algodão cru, mesas baixas de madeira com tampos de mosaico, tapeçarias penduradas como cenário. {{ILUMINACAO}} criam uma atmosfera mágica e envolvente.",
        "Arranjos desconstruídos de flores secas e frescas em vasos de cerâmica artesanal e vidros coloridos. Macramês suspensos sustentam velas e plantas. O espaço é preenchido por tapetes sobrepostos, almofadas bordadas e lanternas marroquinas.",
        "A cenografia boho mescla elementos étnicos e naturais: tendas de tecido leve, sonhos de filtro dos sonhos, cadeiras de vime e muita vegetação. A iluminação é composta por {{ILUMINACAO}} que dançam com o vento."
      ],
      mesaPosta: [
        "A mesa posta é um convite à descontração: pratos de cerâmica com esmalte irregular, talheres vintage garimpados, copos coloridos de vidro soprado. Guardanapos de algodão com estampas étnicas e argolas de madeira ou miçangas.",
        "Mesas comunitárias de madeira clara, sem toalhas, decoradas com runners de macramê. Louça mix and match, taças de vidro colorido e sousplats de palha. Pequenos vasos com flores secas e velas flutuantes em potes de vidro.",
        "Cada lugar tem um prato artesanal diferente, talheres com cabos de madrepérola e guardanapos tingidos artesanalmente. O centro de mesa é uma composição de garrafas coloridas com flores silvestres e velas em castiçais de latão."
      ],
      alimentacao: [
        "Estações gastronômicas com comida de rua gourmet: tacos, espetinhos, mini bowls de açaí. Drinks autorais com ingredientes botânicos e frutas tropicais. Tudo servido em louças despojadas e copos de cerâmica.",
        "O menu é uma viagem de sabores: finger foods criativos, tábuas de queijos e frios, e uma estação de chás e infusões. O bar oferece coquetéis com ervas frescas e flores comestíveis, servidos em taças de vidro colorido.",
        "Comida afetiva em formato de coquetel estendido: mini porções de pratos caseiros, pães artesanais e antepastos. Bebidas incluem limonadas gourmet, espumantes e drinks à base de gin com infusões de hibisco."
      ],
      entretenimento: [
        "{{MUSICA}} toca uma seleção de folk, indie e world music. {{ATIVIDADES}} garantem a diversão. Uma área de descanso com redes e almofadas convida à contemplação das estrelas.",
        "A pista é livre e animada por {{MUSICA}}. {{ATIVIDADES}} registra momentos espontâneos. Um varal de fotos polaroid e uma mesa de desejos com fitas coloridas envolvem os convidados.",
        "Música ambiente com {{MUSICA}} cria o clima perfeito. {{ATIVIDADES}} diverte adultos e crianças. Fogueira controlada e marshmallows encerram a noite com sabor de infância."
      ],
      vestuario: [
        "A noiva veste um vestido fluido de renda com mangas amplas, coroa de flores secas e sandálias rasteiras. O noivo usa camisa de linho aberta, calça de sarja e alpargatas. Ambos têm estilo despojado e romântico.",
        "Trajes leves e cheios de personalidade: a noiva de macacão de renda ou vestido assimétrico, o noivo de colete e gravata borboleta despojada. Acessórios artesanais, como colares de sementes e pulseiras de couro.",
        "O casal adota o boho-chic: ela com vestido longo estampado e chapéu de palha, ele com terno de linho claro e flor na lapela. Maquiagem natural, cabelos soltos com ondas e tiaras de flores."
      ],
      papelaria: [
        "Convites em papel texturizado com aquarelas florais, envelopes de papel craft com lacre de cera colorida. Menus em formato de leque e place cards em folhas secas com caligrafia manual.",
        "Convite digital animado com ilustrações botânicas e trilha sonora acústica. A identidade se estende a tags de agradecimento, plaquinhas de mesa e um mapa ilustrado do local.",
        "Papelaria ecológica: papel semente que pode ser plantado, amarrado com barbante de algodão. Convites em formato de marcador de livro com franjas e contas de madeira."
      ],
      fornecedores: [
        "Cerimonialista, Espaço ao ar livre, Decorador boho, Florista especializado em flores secas, Serviço de coquetel, Bartender de drinks autorais, Música acústica, Fotógrafo fine art, Mobiliário lounge, Papelaria artesanal."
      ],
      linhaTempo: [
        "12 meses antes: reserva do espaço e definição do conceito. 9 meses: fechamento dos fornecedores principais. 6 meses: escolha do vestido e produção da papelaria. 4 meses: envio dos convites. 2 meses: degustação e ajustes finais. 1 mês: confirmação de presenças."
      ],
      checklist: [
        "Definir o plano B em caso de chuva. Selecionar as flores secas da estação. Confirmar a curadoria musical com o DJ/banda. Testar a iluminação de velas e fairy lights. Organizar transporte para convidados."
      ],
      orcamento: [
        "Espaço e estrutura: 18%. Alimentação e bebidas: 28%. Decoração e flores: 20%. Música e entretenimento: 10%. Vestuário e beleza: 8%. Fotografia e vídeo: 8%. Papelaria: 3%. Cerimonialista: 5%."
      ]
    },
  
    // ========== MODERNO ==========
    // ... (a ser preenchido)
  };
  
  // Funções auxiliares
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