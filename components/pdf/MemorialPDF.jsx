// components/pdf/MemorialPDF.jsx
import React from 'react';
import path from 'path';
import { Document, Page, Text, View, StyleSheet, Font, Image, Svg, Path, G } from '@react-pdf/renderer';
import {
  capitalizarNome,
  formatarData,
  getPaleta,
  isCorEscura,
  getCorContraste,
  getCorBorda,
  getCorTitulo,
  getNomeCor,
  getDicasRegionais,
  getItensOrcamento,
  parsearMemorial,
  extrairChecklist,
  extrairFornecedores,
  getImagem,
} from '../../utils/pdfUtils';
import { sugerirFontes } from '../../utils/sugestoes';

// ========== BIBLIOTECA DE IMAGENS LOCAIS ==========
const BASE_IMAGE_PATH = path.join(process.cwd(), 'public', 'images');

function img(categoria, arquivo) {
  return path.join(BASE_IMAGE_PATH, categoria, arquivo);
}

const IMAGENS = {
  flores: {
    'Rosas': img('flores', 'rosas-1.jpg'),
    'Orquídeas': img('flores', 'flores-default-1.jpg'),
    'Lírios': img('flores', 'flores-default-2.jpg'),
    'Tulipas': img('flores', 'flores-default-3.jpg'),
    'Peônias': img('flores', 'flores-default-4.jpg'),
    'Flores do campo': img('flores', 'flores-do-campo-1.jpg'),
    'Flores secas': img('flores', 'flores-secas-1.jpg'),
    'Eucalipto': img('flores', 'flores-default-5.jpg'),
    'Hortênsias': img('flores', 'flores-default-6.jpg'),
    'Gérberas': img('flores', 'flores-default-7.jpg'),
    'Astilbe': img('flores', 'flores-default-8.jpg'),
    'Dálias': img('flores', 'flores-default-9.jpg'),
    'Chuva de ouro': img('flores', 'flores-default-10.jpg'),
    'Alstroemérias': img('flores', 'flores-default-11.jpg'),
    'Anêmonas': img('flores', 'flores-default-12.jpg'),
    'Ranúnculos': img('flores', 'flores-default-13.jpg'),
    'Lavanda': img('flores', 'flores-default-14.jpg'),
    'Margaridas': img('flores', 'flores-default-15.jpg'),
    'Gipsofila': img('flores', 'flores-default-16.jpg'),
    'Antúrios': img('flores', 'flores-default-17.jpg'),
    'Bromélias': img('flores', 'flores-default-18.jpg'),
    'Orquídeas phalaenopsis': img('flores', 'flores-default-19.jpg'),
    'Crisântemos': img('flores', 'flores-default-20.jpg'),
    'Cala': img('flores', 'flores-default-21.jpg'),
    'Proteas': img('flores', 'flores-default-22.jpg'),
    'Statice': img('flores', 'flores-default-23.jpg'),
    'Verônicas': img('flores', 'flores-default-24.jpg'),
    'Amarílis': img('flores', 'flores-default-25.jpg'),
    default: img('flores', 'flores-default-1.jpg'),
  },
  vestido: {
    'Princesa': img('vestidos', 'vestido-default-1.jpg'),
    'Sereia': img('vestidos', 'vestido-default-2.jpg'),
    'Minimalista': img('vestidos', 'vestido-minimalista-1.jpg'),
    'Boho': img('vestidos', 'vestido-boho-1.jpg'),
    'Romântico': img('vestidos', 'vestido-minimalista-2.jpg'),
    'Clássico': img('vestidos', 'vestido-minimalista-3.jpg'),
    'Moderno': img('vestidos', 'vestido-minimalista-4.jpg'),
    'Rústico': img('vestidos', 'vestido-boho-2.jpg'),
    default: img('vestidos', 'vestido-default-1.jpg'),
  },
  mesaPosta: {
    'classico': img('mesa', 'mesa-classico-1.jpg'),
    'rustico': img('mesa', 'mesa-rustico-1.jpg'),
    'romantico': img('mesa', 'mesa-romantico-1.jpg'),
    'minimalista': img('mesa', 'mesa-minimalista-1.jpg'),
    'boho': img('mesa', 'mesa-rustico-4.jpg'),
    'moderno': img('mesa', 'mesa-default-2.jpg'),
    default: img('mesa', 'mesa-classico-1.jpg'),
  },
  decoracao: {
    'classico': img('decoracao', 'decor-classico-1.jpg'),
    'rustico': img('decoracao', 'decor-rustico-1.jpg'),
    'romantico': img('decoracao', 'decor-romantico-1.jpg'),
    'minimalista': img('decoracao', 'decor-minimalista-1.jpg'),
    'boho': img('decoracao', 'decor-boho-1.jpg'),
    'moderno': img('decoracao', 'decor-moderno-1.jpg'),
    default: img('decoracao', 'decor-classico-1.jpg'),
  },
  cerimonia: {
    'classico': img('cerimonia', 'cerimonia-altar-1.jpg'),
    'rustico': img('cerimonia', 'cerimonia-corredor-3.jpg'),
    'romantico': img('cerimonia', 'cerimonia-beijo-1.jpg'),
    'minimalista': img('cerimonia', 'cerimonia-aliancas-1.jpg'),
    'boho': img('cerimonia', 'cerimonia-entrada-noiva-4.jpg'),
    'moderno': img('cerimonia', 'cerimonia-saida-1.jpg'),
    default: img('cerimonia', 'cerimonia-altar-1.jpg'),
  },
};

// ========== COMPONENTE RODAPÉ ==========
function Rodape({ nomeCasal }) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 20,
        left: 50,
        right: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 0.5,
        borderTopColor: '#C8BFB4',
        paddingTop: 6,
      }}
      fixed
      render={({ pageNumber, totalPages }) => (
        <>
          <Text style={{ fontSize: 8, color: '#5C534A', fontFamily: 'Helvetica' }}>{nomeCasal}</Text>
          <Text style={{ fontSize: 8, color: '#5C534A', fontFamily: 'Helvetica' }}>
            gerado pelo descomplicaí · arxum.csstudios.site/descomplicai
          </Text>
          <Text style={{ fontSize: 8, color: '#5C534A', fontFamily: 'Helvetica' }}>
            {pageNumber} / {totalPages}
          </Text>
        </>
      )}
    />
  );
}

// ========== COMPONENTE PALETA SWATCH ==========
function PaletaSwatch({ cor, hex, corBorda, fonteCorpo }) {
  return (
    <View style={{ alignItems: 'center', marginHorizontal: 14 }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: hex,
          borderWidth: 2,
          borderColor: corBorda,
        }}
      />
      <Text style={{ fontSize: 9, fontFamily: fonteCorpo, color: '#1A1714', marginTop: 5, textAlign: 'center' }}>
        {getNomeCor(hex)}
      </Text>
      <Text style={{ fontSize: 8, fontFamily: fonteCorpo, color: '#5C534A', marginTop: 1, textAlign: 'center' }}>
        {hex}
      </Text>
    </View>
  );
}

// ========== GRÁFICO DE PIZZA REAL (SVG) ==========
function PizzaChart({ data, colors, size = 160 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const total = data.reduce((s, d) => s + d.percentual, 0);
  let startAngle = 0;

  const paths = [];
  data.forEach((item, i) => {
    const angle = (item.percentual / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    paths.push(
      <Path key={i} d={d} fill={colors[i % colors.length]} stroke="#FFFFFF" strokeWidth={1} />
    );
    startAngle = endAngle;
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G>{paths}</G>
    </Svg>
  );
}

// ========== FUNÇÃO PARA RENDERIZAR TEXTO DO MEMORIAL ==========
function renderizarTextoMemorial(linhas, fonteCorpo, corTexto, corPrimaria) {
  return linhas.map((linha, i) => {
    const texto = linha.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();
    if (!texto) return null;
    if (linha.startsWith('### ')) {
      return (
        <Text key={i} style={{ fontFamily: fonteCorpo, fontSize: 12, color: corPrimaria, marginTop: 10, marginBottom: 5, wrap: true }}>
          {texto}
        </Text>
      );
    }
    if (linha.startsWith('- ') || linha.startsWith('* ')) {
      return (
        <Text key={i} style={{ fontFamily: fonteCorpo, fontSize: 10.5, color: corTexto, lineHeight: 1.7, marginBottom: 4, marginLeft: 12, wrap: true }}>
          • {texto}
        </Text>
      );
    }
    return (
      <Text key={i} style={{ fontFamily: fonteCorpo, fontSize: 10.5, color: corTexto, lineHeight: 1.7, marginBottom: 6, wrap: true }}>
        {texto}
      </Text>
    );
  }).filter(Boolean);
}

// ========== COMPONENTE PRINCIPAL ==========
export function MemorialPDF({ memorial, dadosEvento, usarFontesNativas = false, qrCodeDataUri = null }) {
  const estilo = dadosEvento?.estilo || 'classico';
  const paleta = getPaleta(dadosEvento);
  const corPrimaria = paleta[0];
  const corSecundaria = paleta[1];
  const corTerciaria = paleta[2];
  const corBorda = getCorBorda(paleta);
  const corTexto = '#1A1714';
  const corTextoSuave = '#5C534A';
  const corFundoPagina = '#FFFFFF';

  // COR DOS TÍTULOS: garante contraste (não pode sumir no fundo branco)
  const corTitulo = getCorTitulo(corPrimaria, corBorda);

  // FONTES: via sugerirFontes do motor de sugestões
  const fontesSugeridas = !usarFontesNativas ? sugerirFontes(estilo) : [];
  const fonteDisplay = fontesSugeridas.find(f => f.uso === 'display')?.nome || 'Times-Roman';
  const fonteCorpo = fontesSugeridas.find(f => f.uso === 'corpo')?.nome || 'Helvetica';

  const nome1 = capitalizarNome(dadosEvento?.nomePessoa1 || '');
  const nome2 = capitalizarNome(dadosEvento?.nomePessoa2 || '');
  const nomeCasal = nome1 && nome2 ? `${nome1} & ${nome2}` : 'Nosso Casamento';
  const dataFormatada = formatarData(dadosEvento?.dataEvento);
  const cidade = dadosEvento?.cidadeEvento || '';
  const estado = dadosEvento?.estadoEvento || '';
  const localCompleto = cidade && estado ? `${cidade}, ${estado}` : cidade || estado || 'Local a definir';

  // Parse do memorial em seções
  const secoes = parsearMemorial(memorial);
  const secoesNormais = secoes.filter(s => {
    const t = s.titulo.toLowerCase();
    return !t.includes('fornecedor') && !t.includes('orçamento') && !t.includes('orcamento') && !t.includes('checklist') && !t.includes('decisões') && !t.includes('decisoes') && !t.includes('linha do tempo');
  });

  const checklist = extrairChecklist(secoes);
  const fornecedores = extrairFornecedores(secoes);
  const itensOrcamento = getItensOrcamento(cidade, estado);
  const dicasRegionais = getDicasRegionais(cidade, estado);

  // Imagens
  const flores = dadosEvento?.flores || '';
  const imagemFlores = IMAGENS.flores[flores] || IMAGENS.flores.default;
  const imagemVestido = IMAGENS.vestido[dadosEvento?.estiloVestido] || IMAGENS.vestido.default;
  const imagemMesa = IMAGENS.mesaPosta[estilo] || IMAGENS.mesaPosta.default;
  const imagemDecoracao = IMAGENS.decoracao[estilo] || IMAGENS.decoracao.default;
  const imagemCerimonia = IMAGENS.cerimonia[estilo] || IMAGENS.cerimonia.default;

  // Estilos base
  const S = StyleSheet.create({
    capa: { backgroundColor: corTerciaria, height: '100%', alignItems: 'center', justifyContent: 'center', padding: 60 },
    capaLinha: { width: 60, height: 1.5, backgroundColor: getCorContraste(corTerciaria), marginBottom: 28 },
    capaTitulo: { fontFamily: fonteDisplay, fontSize: 40, color: getCorContraste(corTerciaria), textAlign: 'center', marginBottom: 16 },
    capaSubtitulo: { fontFamily: fonteCorpo, fontSize: 14, color: getCorContraste(corTerciaria), textAlign: 'center', marginBottom: 10, letterSpacing: 2 },
    capaData: { fontFamily: fonteCorpo, fontSize: 13, color: getCorContraste(corTerciaria), textAlign: 'center', marginTop: 12 },
    capaLocal: { fontFamily: fonteCorpo, fontSize: 12, color: getCorContraste(corTerciaria), textAlign: 'center', marginTop: 6 },
    paletaContainer: { flexDirection: 'row', marginTop: 36, alignItems: 'center', justifyContent: 'center' },
    pagina: { backgroundColor: corFundoPagina, padding: 50, paddingBottom: 70 },
    tituloSecao: { fontFamily: fonteDisplay, fontSize: 24, color: corTitulo, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: corSecundaria, paddingBottom: 10, wrap: true },
    tituloSecaoPequeno: { fontFamily: fonteDisplay, fontSize: 18, color: corTitulo, marginBottom: 12, marginTop: 16, wrap: true },
    paragrafo: { fontFamily: fonteCorpo, fontSize: 11, color: corTexto, lineHeight: 1.8, marginBottom: 8, wrap: true },
    paragrafoDestaque: { fontFamily: fonteCorpo, fontSize: 11, color: corPrimaria, lineHeight: 1.8, marginBottom: 8, wrap: true },
    subtitulo: { fontFamily: fonteCorpo, fontSize: 13, color: corTitulo, marginTop: 12, marginBottom: 6, wrap: true },
    imagem: { width: 220, height: 160, alignSelf: 'center', marginTop: 12, marginBottom: 20, borderRadius: 4 },
    imagemPequena: { width: 160, height: 120, alignSelf: 'center', marginTop: 8, marginBottom: 16, borderRadius: 4 },
    tabela: { marginTop: 8, marginBottom: 8 },
    tabelaLinha: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: corSecundaria, paddingVertical: 5, alignItems: 'center' },
    tabelaLinhaHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: corTitulo, paddingVertical: 6, backgroundColor: corSecundaria + '20', alignItems: 'center' },
    tabelaCelula: { fontFamily: fonteCorpo, fontSize: 9.5, color: corTexto, flex: 1, paddingRight: 4 },
    tabelaCelulaHeader: { fontFamily: fonteCorpo, fontSize: 9.5, color: corTitulo, flex: 1, paddingRight: 4 },
    tabelaCelulaPequena: { fontFamily: fonteCorpo, fontSize: 9, color: corTexto, width: 40, textAlign: 'center' },
    tabelaCelulaCheckbox: { fontFamily: fonteCorpo, fontSize: 12, color: corTexto, width: 30, textAlign: 'center' },
    linhaPautada: { borderBottomWidth: 0.5, borderBottomColor: '#D4CFC9', borderStyle: 'dashed', height: 20, marginBottom: 4 },
    ctaContainer: { alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40 },
    ctaTitulo: { fontFamily: fonteDisplay, fontSize: 26, color: corTitulo, textAlign: 'center', marginBottom: 20 },
    ctaTexto: { fontFamily: fonteCorpo, fontSize: 12, color: corTexto, textAlign: 'center', lineHeight: 1.8, marginBottom: 16, wrap: true },
    ctaUrl: { fontFamily: fonteCorpo, fontSize: 13, color: corTitulo, textAlign: 'center', marginTop: 8 },
    barraContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginLeft: 10 },
    barraLabel: { fontFamily: fonteCorpo, fontSize: 9, color: corTexto, width: 110 },
    barra: { height: 14, borderRadius: 3 },
    barraTexto: { fontFamily: fonteCorpo, fontSize: 9, color: corTexto, flex: 1, marginLeft: 10 },
    pizzaContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, marginBottom: 16 },
    pizzaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 6, width: 140 },
    pizzaFatia: { width: 14, height: 14, borderRadius: 7, marginRight: 6 },
    pizzaLabel: { fontFamily: fonteCorpo, fontSize: 9, color: corTexto },
    pizzaValor: { fontFamily: fonteCorpo, fontSize: 9, color: corTextoSuave },
    twoColumn: { flexDirection: 'row', gap: 20 },
    column: { flex: 1 },
    boxInfo: { backgroundColor: corSecundaria + '15', borderRadius: 6, padding: 12, marginVertical: 8, borderLeftWidth: 3, borderLeftColor: corTitulo },
    boxInfoTexto: { fontFamily: fonteCorpo, fontSize: 10, color: corTexto, lineHeight: 1.7, wrap: true },
    quote: { fontFamily: fonteDisplay, fontSize: 14, color: corTitulo, fontStyle: 'italic', textAlign: 'center', marginVertical: 16, paddingHorizontal: 20, wrap: true },
  });

  return (
    <Document>
      {/* PÁGINA 1: CAPA */}
      <Page size="A4" style={S.capa}>
        <View style={S.capaLinha} />
        <Text style={S.capaTitulo}>{nomeCasal}</Text>
        <Text style={S.capaSubtitulo}>M E M O R I A L   D O   C A S A M E N T O</Text>
        <Text style={S.capaLocal}>{localCompleto}</Text>
        <Text style={S.capaData}>{dataFormatada}</Text>
        <View style={[S.capaLinha, { marginTop: 36, marginBottom: 0 }]} />
        <View style={S.paletaContainer}>
          {paleta.map((cor, i) => (
            <PaletaSwatch key={i} cor={cor} hex={cor} corBorda={corBorda} fonteCorpo={fonteCorpo} />
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINA 2: ÍNDICE E BOAS-VINDAS */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Bem-vindos ao seu Memorial</Text>
        <Text style={S.paragrafo}>
          Este memorial foi criado exclusivamente para {nomeCasal} pelo descomplicaí. Ele reúne todas as decisões, referências visuais e orientações práticas para tornar o planejamento do seu casamento uma experiência leve, organizada e inesquecível.
        </Text>
        <Text style={S.paragrafo}>
          Cada seção deste documento reflete as escolhas que você fez ao longo do questionário. Use-o como guia de consulta, apresente-o aos seus fornecedores e compartilhe com quem está ao seu lado nessa jornada.
        </Text>
        <Text style={[S.tituloSecao, { fontSize: 18, marginTop: 24 }]}>Índice</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { flex: 3 }]}>Seção</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 60, textAlign: 'right' }]}>Página</Text>
          </View>
          {[
            ['Identidade Visual', '3'],
            ['Cerimônia', '5'],
            ['Decoração', '7'],
            ['Mesa Posta', '9'],
            ['Alimentação e Bebidas', '11'],
            ['Entretenimento', '13'],
            ['Vestuário e Beleza', '14'],
            ['Papelaria e Identidade', '16'],
            ['Linha do Tempo Visual', '18'],
            ['Checklist de Decisões', '20'],
            ['Fornecedores', '22'],
            ['Orçamento Detalhado', '24'],
            ['Dicas Regionais', '26'],
          ].map(([secao, pag], i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { flex: 3 }]}>{secao}</Text>
              <Text style={[S.tabelaCelula, { width: 60, textAlign: 'right' }]}>{pag}</Text>
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINAS 3-4: IDENTIDADE VISUAL */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Identidade Visual</Text>
        {secoesNormais.find(s => s.titulo.toLowerCase().includes('identidade'))?.linhas
          ? renderizarTextoMemorial(secoesNormais.find(s => s.titulo.toLowerCase().includes('identidade')).linhas, fonteCorpo, corTexto, corTitulo)
          : <Text style={S.paragrafo}>A identidade visual do seu casamento reflete a personalidade de {nomeCasal}. A paleta escolhida, as fontes sugeridas e os materiais recomendados criam uma narrativa visual coesa que será aplicada em todos os elementos do evento.</Text>}
        <Image style={S.imagem} src={imagemDecoracao} />
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Identidade Visual — Detalhes</Text>
        <Text style={S.subtitulo}>Paleta de Cores Detalhada</Text>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {paleta.map((cor, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', marginHorizontal: 8 }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: cor, borderWidth: 2, borderColor: corBorda, marginBottom: 6 }} />
              <Text style={{ fontFamily: fonteCorpo, fontSize: 10, color: corTexto, textAlign: 'center' }}>{getNomeCor(cor)}</Text>
              <Text style={{ fontFamily: fonteCorpo, fontSize: 9, color: corTextoSuave, textAlign: 'center' }}>{cor}</Text>
              <Text style={{ fontFamily: fonteCorpo, fontSize: 8, color: corTextoSuave, textAlign: 'center', marginTop: 2 }}>
                {i === 0 ? 'Cor principal (destaques)' : i === 1 ? 'Cor secundária (fundo/contraste)' : 'Cor terciária (detalhes)'}
              </Text>
            </View>
          ))}
        </View>
        <Text style={S.subtitulo}>Fontes Sugeridas</Text>
        <View style={S.boxInfo}>
          <Text style={S.boxInfoTexto}>Fonte de display (títulos e destaques): {fonteDisplay}</Text>
          <Text style={S.boxInfoTexto}>Fonte de corpo (textos e parágrafos): {fonteCorpo}</Text>
          <Text style={S.boxInfoTexto}>Ambas as fontes foram escolhidas para harmonizar com o estilo {estilo} e garantir legibilidade em todos os materiais.</Text>
        </View>
        <Text style={S.subtitulo}>Texturas e Materiais Recomendados</Text>
        <Text style={S.paragrafo}>Considere aplicar as texturas sugeridas em convites, menus, placas de boas-vindas e lembrancinhas. A coerência material reforça a identidade visual do evento.</Text>
        <View style={S.boxInfo}>
          <Text style={S.boxInfoTexto}>• Papel: Couchê fosco ou texturizado natural</Text>
          <Text style={S.boxInfoTexto}>• Acabamentos: Hot stamping, relevo seco ou corte laser</Text>
          <Text style={S.boxInfoTexto}>• Tecidos: Linho, algodão orgânico ou seda (conforme estilo)</Text>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINAS 5-6: CERIMÔNIA */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Cerimônia</Text>
        {secoesNormais.find(s => s.titulo.toLowerCase().includes('cerimonia'))?.linhas
          ? renderizarTextoMemorial(secoesNormais.find(s => s.titulo.toLowerCase().includes('cerimonia')).linhas, fonteCorpo, corTexto, corTitulo)
          : <Text style={S.paragrafo}>A cerimônia é o coração do seu casamento. Cada detalhe — desde a entrada até a saída — deve refletir a essência de {nomeCasal} e emocionar a todos os presentes.</Text>}
        <Image style={S.imagem} src={imagemCerimonia} />
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Cerimônia — Roteiro e Músicas</Text>
        <Text style={S.subtitulo}>Roteiro Sugerido</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 80 }]}>Momento</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Descrição</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 80 }]}>Duração</Text>
          </View>
          {[
            ['Entrada da noiva', 'Marcha nupcial com acompanhamento dos pais ou padrinho', '~3 min'],
            ['Recepção pelo celebrante', 'Saudação e boas-vindas aos convidados', '~2 min'],
            ['Leituras e reflexões', 'Textos escolhidos pelo casal, poesias ou cartas', '~5 min'],
            ['Votos do casal', `Promessas pessoais escritas por ${nome1} e ${nome2}`, '~5 min'],
            ['Troca de alianças', 'Momento simbólico com bênção das alianças', '~2 min'],
            ['Declaração e beijo', 'Oficialização da união e primeiro beijo como casal', '~1 min'],
            ['Saída dos noivos', 'Marcha de saída com confetes, pétalas ou bolhas de sabão', '~3 min'],
          ].map(([momento, desc, dur], i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 80 }]}>{momento}</Text>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{desc}</Text>
              <Text style={[S.tabelaCelula, { width: 80 }]}>{dur}</Text>
            </View>
          ))}
        </View>
        <Text style={S.subtitulo}>Sugestões de Músicas</Text>
        <View style={S.boxInfo}>
          <Text style={S.boxInfoTexto}>• Entrada da noiva: Canon in D (Pachelbel) ou A Thousand Years (Christina Perri)</Text>
          <Text style={S.boxInfoTexto}>• Durante a cerimônia: instrumental suave conforme estilo {estilo}</Text>
          <Text style={S.boxInfoTexto}>• Saída dos noivos: Signed, Sealed, Delivered (Stevie Wonder) ou All You Need Is Love (The Beatles)</Text>
        </View>
        <Text style={S.subtitulo}>Elementos Decorativos da Cerimônia</Text>
        <Text style={S.paragrafo}>Considere arcos florais, tapetes personalizados, velas ao longo do corredor e um altar que dialogue com a paleta de cores escolhida. Cada elemento deve criar uma atmosfera imersiva.</Text>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINAS 7-8: DECORAÇÃO */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Decoração</Text>
        {secoesNormais.find(s => s.titulo.toLowerCase().includes('decoração') || s.titulo.toLowerCase().includes('decoracao'))?.linhas
          ? renderizarTextoMemorial(secoesNormais.find(s => s.titulo.toLowerCase().includes('decoração') || s.titulo.toLowerCase().includes('decoracao')).linhas, fonteCorpo, corTexto, corTitulo)
          : <Text style={S.paragrafo}>A decoração transforma o espaço escolhido em um ambiente que conta a história de {nomeCasal}. Cada elemento visual deve dialogar com o estilo {estilo} e a paleta de cores definida.</Text>}
        <Image style={S.imagem} src={imagemFlores} />
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Decoração — Flores e Iluminação</Text>
        <Text style={S.subtitulo}>Flores por Localização</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 100 }]}>Localização</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Sugestão Floral</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 80 }]}>Estilo</Text>
          </View>
          {[
            ['Altar', 'Arranjo principal com flores escolhidas pelo casal', estilo],
            ['Corredor', 'Flores ao longo do caminho ou em hastes suspensas', estilo],
            ['Entrada', 'Guirlanda ou arco floral de boas-vindas', estilo],
            ['Mesas de convidados', 'Centros de mesa variados (altos e baixos)', estilo],
            ['Mesa do bolo', 'Arranjo especial com flores comestíveis ou decorativas', estilo],
            ['Lounge / área externa', 'Vasos suspensos ou arranjos em garrafas', estilo],
            ['Banheiros', 'Pequenos arranjos em vasos de cerâmica', estilo],
          ].map(([loc, sug, est], i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 100 }]}>{loc}</Text>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{sug}</Text>
              <Text style={[S.tabelaCelula, { width: 80 }]}>{est}</Text>
            </View>
          ))}
        </View>
        <Text style={S.subtitulo}>Iluminação e Velas</Text>
        <View style={S.twoColumn}>
          <View style={S.column}>
            <Text style={S.paragrafo}>A iluminação cria a atmosfera do evento. Combine luzes quentes com velas estrategicamente posicionadas para criar pontos de interesse e áreas de intimidade.</Text>
            <View style={S.boxInfo}>
              <Text style={S.boxInfoTexto}>• Lustres ou spots quentes para área principal</Text>
              <Text style={S.boxInfoTexto}>• Velas em castiçais ao longo das mesas</Text>
              <Text style={S.boxInfoTexto}>• Fairy lights ou cordões de luz em áreas externas</Text>
            </View>
          </View>
          <View style={S.column}>
            <Text style={S.paragrafo}>Mobiliário recomendado conforme estilo {estilo}:</Text>
            <View style={S.boxInfo}>
              <Text style={S.boxInfoTexto}>• Cadeiras: conforme sugestão do estilo</Text>
              <Text style={S.boxInfoTexto}>• Mesas: redondas para interação ou retangulares para espaços amplos</Text>
              <Text style={S.boxInfoTexto}>• Áreas de descanso: sofás, puffs ou bancos rústicos</Text>
            </View>
          </View>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINAS 9-10: MESA POSTA */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Mesa Posta</Text>
        {secoesNormais.find(s => s.titulo.toLowerCase().includes('mesa'))?.linhas
          ? renderizarTextoMemorial(secoesNormais.find(s => s.titulo.toLowerCase().includes('mesa')).linhas, fonteCorpo, corTexto, corTitulo)
          : <Text style={S.paragrafo}>A mesa posta é uma das expressões mais tangíveis da identidade visual do casamento. Cada elemento — desde a toalha até o cartão de lugar — deve conversar com o estilo {estilo} e a paleta escolhida.</Text>}
        <Image style={S.imagem} src={imagemMesa} />
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Mesa Posta — Especificações</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 120 }]}>Elemento</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Sugestão</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 80 }]}>Cor/Tom</Text>
          </View>
          {[
            ['Toalha', 'Material e estilo conforme identidade visual', paleta[1]],
            ['Louças', 'Porcelana, cerâmica ou design contemporâneo', 'Branco ou paleta'],
            ['Talheres', 'Prata, dourado, cobre ou inox escovado', paleta[0]],
            ['Taças', 'Cristal fino, vidro colorido ou mason jars', 'Transparente ou paleta'],
            ['Centro de mesa', 'Arranjo floral ou escultura conforme estilo', paleta[0]],
            ['Guardanapo', 'Linho, algodão ou material temático', paleta[1]],
            ['Cartão de lugar', 'Papelaria personalizada com monograma', paleta[0]],
            ['Menu individual', 'Impresso em papel texturizado ou papel vegetal', paleta[2]],
          ].map(([elem, sug, cor], i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 120 }]}>{elem}</Text>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{sug}</Text>
              <Text style={[S.tabelaCelula, { width: 80 }]}>{cor}</Text>
            </View>
          ))}
        </View>
        <Text style={S.subtitulo}>Dicas de Montagem</Text>
        <View style={S.boxInfo}>
          <Text style={S.boxInfoTexto}>1. Comece pela toalha: ela é a base de toda a composição visual.</Text>
          <Text style={S.boxInfoTexto}>2. Distribua os talheres na ordem de uso (de fora para dentro).</Text>
          <Text style={S.boxInfoTexto}>3. O centro de mesa não deve impedir a conversação entre convidados.</Text>
          <Text style={S.boxInfoTexto}>4. O cartão de lugar e o menu devem estar alinhados com o prato principal.</Text>
          <Text style={S.boxInfoTexto}>5. Adicione um toque pessoal: uma flor solta, um bilhete ou uma lembrancinha no prato.</Text>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINAS 11-12: ALIMENTAÇÃO E BEBIDAS */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Alimentação e Bebidas</Text>
        {secoesNormais.find(s => s.titulo.toLowerCase().includes('alimentação') || s.titulo.toLowerCase().includes('alimentacao') || s.titulo.toLowerCase().includes('bebidas'))?.linhas
          ? renderizarTextoMemorial(secoesNormais.find(s => s.titulo.toLowerCase().includes('alimentação') || s.titulo.toLowerCase().includes('alimentacao') || s.titulo.toLowerCase().includes('bebidas')).linhas, fonteCorpo, corTexto, corTitulo)
          : <Text style={S.paragrafo}>A experiência gastronômica é um dos pilares da celebração. Do coquetel de boas-vindas ao bolo de casamento, cada momento deve surpreender e agradar o paladar dos convidados.</Text>}
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Alimentação e Bebidas — Detalhes</Text>
        <View style={S.twoColumn}>
          <View style={S.column}>
            <Text style={S.subtitulo}>Coquetel de Boas-Vindas</Text>
            <Text style={S.paragrafo}>Drinks de recepção que dialoguem com o estilo {estilo} e a estação do ano. Considere uma assinatura do casal.</Text>
            <View style={S.boxInfo}>
              <Text style={S.boxInfoTexto}>• Drink assinatura do casal</Text>
              <Text style={S.boxInfoTexto}>• Águas aromatizadas e sucos naturais</Text>
              <Text style={S.boxInfoTexto}>• Petiscos e canapés variados</Text>
            </View>
            <Text style={S.subtitulo}>Jantar / Almoço</Text>
            <Text style={S.paragrafo}>Cardápio elaborado conforme restrições alimentares informadas. Degustação recomendada 4 meses antes.</Text>
          </View>
          <View style={S.column}>
            <Text style={S.subtitulo}>Bolo e Doces</Text>
            <Text style={S.paragrafo}>O bolo é um dos momentos mais fotografados do casamento. Escolha sabores que representem o casal.</Text>
            <View style={S.boxInfo}>
              <Text style={S.boxInfoTexto}>• Bolo principal: estilo {estilo}</Text>
              <Text style={S.boxInfoTexto}>• Mesa de doces: brigadeiros gourmet, macarons, bem-casados</Text>
              <Text style={S.boxInfoTexto}>• Bem-casados: embalagem personalizada</Text>
            </View>
            <Text style={S.subtitulo}>Bar e Bebidas</Text>
            <Text style={S.paragrafo}>Bar completo com cervejas artesanais, vinhos selecionados e drinks à pedido. Álcool e não-álcool.</Text>
          </View>
        </View>
        <Text style={S.subtitulo}>Restrições Alimentares</Text>
        <Text style={S.paragrafo}>Verifique com antecedência: vegetarianos, veganos, intolerantes à lactose/glúten, alergias. Prepare opções alternativas discretas e saborosas.</Text>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINA 13: ENTRETENIMENTO */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Entretenimento</Text>
        {secoesNormais.find(s => s.titulo.toLowerCase().includes('entretenimento') || s.titulo.toLowerCase().includes('festa') || s.titulo.toLowerCase().includes('música'))?.linhas
          ? renderizarTextoMemorial(secoesNormais.find(s => s.titulo.toLowerCase().includes('entretenimento') || s.titulo.toLowerCase().includes('festa') || s.titulo.toLowerCase().includes('música')).linhas, fonteCorpo, corTexto, corTitulo)
          : <Text style={S.paragrafo}>A festa é a celebração da união de {nomeCasal}. A música, as atividades e o cronograma devem manter a energia alta e criar momentos inesquecíveis para todos os convidados.</Text>}
        <Text style={S.subtitulo}>Música e Atrações</Text>
        <View style={S.boxInfo}>
          <Text style={S.boxInfoTexto}>• Cerimônia: música instrumental ao vivo ou playlist curada</Text>
          <Text style={S.boxInfoTexto}>• Coquetel: jazz acústico, bossa nova ou playlist ambiente</Text>
          <Text style={S.boxInfoTexto}>• Jantar: música de fundo que permita conversação</Text>
          <Text style={S.boxInfoTexto}>• Festa: DJ ou banda ao vivo com repertório variado</Text>
          <Text style={S.boxInfoTexto}>• Momento especial: primeira dança do casal</Text>
        </View>
        <Text style={S.subtitulo}>Cronograma Sugerido da Festa</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 80 }]}>Horário</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Atividade</Text>
          </View>
          {[
            ['18:00', 'Cerimônia'],
            ['19:00', 'Coquetel de boas-vindas'],
            ['20:00', 'Jantar'],
            ['21:30', 'Discursos e brindes'],
            ['22:00', 'Corte do bolo'],
            ['22:30', 'Primeira dança'],
            ['23:00', 'Abertura da pista de dança'],
            ['00:00', 'Distribuição de bem-casados'],
            ['01:00', 'Última música e despedida'],
          ].map(([hora, ativ], i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 80 }]}>{hora}</Text>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{ativ}</Text>
            </View>
          ))}
        </View>
        <Text style={S.subtitulo}>Atividades Interativas</Text>
        <Text style={S.paragrafo}>Considere: cabine de fotos instantâneas, bar de cigarros, food truck de madrugada, fogos de artifício (se permitido), lanternas sky lanterns, ou uma área de descanso com sofás.</Text>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINAS 14-15: VESTUÁRIO E BELEZA */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Vestuário e Beleza</Text>
        {secoesNormais.find(s => s.titulo.toLowerCase().includes('vestuário') || s.titulo.toLowerCase().includes('vestuario') || s.titulo.toLowerCase().includes('beleza'))?.linhas
          ? renderizarTextoMemorial(secoesNormais.find(s => s.titulo.toLowerCase().includes('vestuário') || s.titulo.toLowerCase().includes('vestuario') || s.titulo.toLowerCase().includes('beleza')).linhas, fonteCorpo, corTexto, corTitulo)
          : <Text style={S.paragrafo}>O vestuário e a beleza são expressões pessoais que devem fazer {nome1} e {nome2} se sentirem a melhor versão de si mesmos no grande dia.</Text>}
        <Image style={S.imagem} src={imagemVestido} />
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Vestuário e Beleza — Detalhes</Text>
        <View style={S.twoColumn}>
          <View style={S.column}>
            <Text style={S.subtitulo}>Traje da Noiva</Text>
            <Text style={S.paragrafo}>Escolha que valorize o corpo e a personalidade. Considere: prova 6 meses antes, ajustes finais 2 semanas antes, e um kit de emergência (costureira, absorvente, água boricada).</Text>
            <View style={S.boxInfo}>
              <Text style={S.boxInfoTexto}>• Estilo sugerido: conforme escolha no questionário</Text>
              <Text style={S.boxInfoTexto}>• Acessórios: véu, grinalda, joias ou tiara</Text>
              <Text style={S.boxInfoTexto}>• Sapatos: conforto é essencial — teste antes</Text>
              <Text style={S.boxInfoTexto}>• Lingerie: peça especial para o dia</Text>
            </View>
            <Text style={S.subtitulo}>Traje do Noivo</Text>
            <Text style={S.paragrafo}>Terno, smoking ou traje conforme estilo e horário do evento. Gravata, abotoaduras e relógio completam o visual.</Text>
          </View>
          <View style={S.column}>
            <Text style={S.subtitulo}>Maquiagem e Cabelo</Text>
            <Text style={S.paragrafo}>Agende a prova 2 meses antes. Leve referências e fotos do vestido. O visual deve durar 12+ horas.</Text>
            <View style={S.boxInfo}>
              <Text style={S.boxInfoTexto}>• Maquiagem: à prova d'água e com fixador</Text>
              <Text style={S.boxInfoTexto}>• Cabelo: teste de penteado na prova</Text>
              <Text style={S.boxInfoTexto}>• Manicure e pedicure: 2 dias antes</Text>
              <Text style={S.boxInfoTexto}>• Kit de retoque: batom, pó, alfinetes</Text>
            </View>
            <Text style={S.subtitulo}>Padronização de Madrinhas e Padrinhos</Text>
            <Text style={S.paragrafo}>Defina uma cor ou tom que dialogue com a paleta. Não precisa ser uniforme — a coesão visual é mais importante que a uniformidade.</Text>
          </View>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINAS 16-17: PAPELARIA E IDENTIDADE */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Papelaria e Identidade</Text>
        {secoesNormais.find(s => s.titulo.toLowerCase().includes('papelaria') || s.titulo.toLowerCase().includes('identidade') || s.titulo.toLowerCase().includes('convite'))?.linhas
          ? renderizarTextoMemorial(secoesNormais.find(s => s.titulo.toLowerCase().includes('papelaria') || s.titulo.toLowerCase().includes('identidade') || s.titulo.toLowerCase().includes('convite')).linhas, fonteCorpo, corTexto, corTitulo)
          : <Text style={S.paragrafo}>A papelaria é o primeiro contato dos convidados com o casamento. Cada peça — do save the date ao menu — deve transmitir a identidade visual e criar expectativa.</Text>}
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Papelaria e Identidade — Itens</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 120 }]}>Item</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Descrição</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 80 }]}>Prazo</Text>
          </View>
          {[
            ['Save the Date', 'Anúncio inicial da data (digital ou impresso)', '10-12 meses'],
            ['Convite', 'Cartão formal com informações do evento', '3-4 meses'],
            ['Site do casamento', 'Página digital com lista de presentes e confirmação', '6 meses'],
            ['Menu', 'Impresso individual ou em quadro na entrada', '1 mês'],
            ['Cartão de lugar', 'Identificação do convidado na mesa', '1 mês'],
            ['Sinalização', 'Placas de boas-vindas, direcionais e áreas', '2 semanas'],
            ['Monograma', 'Símbolo personalizado do casal', '6 meses'],
            ['Lembrancinha', 'Presente de agradecimento aos convidados', '2 meses'],
            ['Tags', 'Etiquetas para bem-casados e presentes', '1 mês'],
            ['Certificado', 'Documento decorativo da cerimônia', '2 semanas'],
          ].map(([item, desc, prazo], i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 120 }]}>{item}</Text>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{desc}</Text>
              <Text style={[S.tabelaCelula, { width: 80 }]}>{prazo}</Text>
            </View>
          ))}
        </View>
        <Text style={S.subtitulo}>Itens Digitais</Text>
        <View style={S.boxInfo}>
          <Text style={S.boxInfoTexto}>• Filtro personalizado para Instagram Stories</Text>
          <Text style={S.boxInfoTexto}>• Playlist colaborativa no Spotify</Text>
          <Text style={S.boxInfoTexto}>• QR code para confirmação de presença</Text>
          <Text style={S.boxInfoTexto}>• Álbum de fotos compartilhado (Google Photos ou similar)</Text>
        </View>
        <Text style={S.subtitulo}>Monograma do Casal</Text>
        <Text style={S.paragrafo}>O monograma une as iniciais de {nome1} e {nome2} em um símbolo único. Use-o em convites, selos, taças, bolo e todos os materiais impressos.</Text>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINAS 18-19: LINHA DO TEMPO VISUAL */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Linha do Tempo Visual</Text>
        <Text style={S.paragrafo}>O planejamento de um casamento exige organização. Esta linha do tempo divide as tarefas por período, com cores que indicam a urgência de cada etapa.</Text>
        <View style={{ marginTop: 16, marginBottom: 20 }}>
          {[
            { meses: '12-8 meses antes', cor: '#4CAF50', tarefas: ['Definir data e reservar local', 'Contratar cerimonialista', 'Iniciar lista de convidados', 'Definir estilo e paleta visual'], largura: 280 },
            { meses: '7-4 meses antes', cor: '#FFC107', tarefas: ['Fechar buffet e bebidas', 'Contratar fotógrafo e vídeo', 'Provar vestido e traje', 'Definir decoração e flores'], largura: 220 },
            { meses: '3-1 meses antes', cor: '#FF9800', tarefas: ['Enviar convites', 'Confirmar presenças', 'Ajustar detalhes decorativos', 'Prova de cabelo e maquiagem'], largura: 160 },
            { meses: 'Última semana', cor: '#F44336', tarefas: ['Ensaio geral', 'Confirmar todos os fornecedores', 'Separar itens do dia', 'Descansar e se hidratar'], largura: 100 },
          ].map((item, i) => (
            <View key={i} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Text style={[S.barraLabel, { width: 120, fontSize: 10 }]}>{item.meses}</Text>
                <View style={[S.barra, { backgroundColor: item.cor, width: item.largura }]} />
              </View>
              {item.tarefas.map((t, j) => (
                <Text key={j} style={[S.barraTexto, { marginLeft: 130, fontSize: 9, marginBottom: 2 }]}>• {t}</Text>
              ))}
            </View>
          ))}
        </View>
        <Text style={S.subtitulo}>Legenda de Urgência</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
            <View style={{ width: 14, height: 14, backgroundColor: '#4CAF50', borderRadius: 3, marginRight: 6 }} />
            <Text style={{ fontFamily: fonteCorpo, fontSize: 9, color: corTexto }}>Tranquilo (12-8 meses)</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
            <View style={{ width: 14, height: 14, backgroundColor: '#FFC107', borderRadius: 3, marginRight: 6 }} />
            <Text style={{ fontFamily: fonteCorpo, fontSize: 9, color: corTexto }}>Atenção (7-4 meses)</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
            <View style={{ width: 14, height: 14, backgroundColor: '#FF9800', borderRadius: 3, marginRight: 6 }} />
            <Text style={{ fontFamily: fonteCorpo, fontSize: 9, color: corTexto }}>Urgente (3-1 meses)</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 14, height: 14, backgroundColor: '#F44336', borderRadius: 3, marginRight: 6 }} />
            <Text style={{ fontFamily: fonteCorpo, fontSize: 9, color: corTexto }}>Crítico (última semana)</Text>
          </View>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Linha do Tempo — Calendário Mensal</Text>
        <Text style={S.paragrafo}>Use este calendário como guia de referência rápida. Marque as tarefas concluídas e ajuste os prazos conforme a realidade do seu planejamento.</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 60 }]}>Mês</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Tarefas Prioritárias</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 60 }]}>Status</Text>
          </View>
          {[
            ['Mês 12', 'Definir data, reservar local, contratar cerimonialista', ''],
            ['Mês 11', 'Lista de convidados, definir estilo e paleta', ''],
            ['Mês 10', 'Save the date, procurar vestido e traje', ''],
            ['Mês 9', 'Contratar fotógrafo e vídeo, definir buffet', ''],
            ['Mês 8', 'Provar vestido, definir decoração e flores', ''],
            ['Mês 7', 'Contratar música/entretenimento, definir papelaria', ''],
            ['Mês 6', 'Degustação do buffet, prova de cabelo/maquiagem', ''],
            ['Mês 5', 'Definir bolo e doces, contratar transporte', ''],
            ['Mês 4', 'Enviar convites, confirmar fornecedores', ''],
            ['Mês 3', 'Ajustes finais de decoração, prova de vestido', ''],
            ['Mês 2', 'Confirmar presenças, reunião com cerimonialista', ''],
            ['Mês 1', 'Ensaio geral, separar itens do dia, relaxar', ''],
          ].map(([mes, tarefa, status], i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 60 }]}>{mes}</Text>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{tarefa}</Text>
              <Text style={[S.tabelaCelula, { width: 60 }]}>[ ]</Text>
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINAS 20-21: CHECKLIST */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Checklist de Decisões Pendentes</Text>
        <Text style={S.paragrafo}>Esta lista foi gerada a partir das respostas "ainda não sei" no seu questionário. Use-a como ponto de partida para as próximas conversas com fornecedores e cerimonialista.</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Decisão Pendente</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 100 }]}>Prazo Sugerido</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 40 }]}>✓</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 1.5 }]}>Anotações</Text>
          </View>
          {checklist.slice(0, 10).map((item, i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{item.item}</Text>
              <Text style={[S.tabelaCelula, { width: 100 }]}>{item.prazo}</Text>
              <Text style={[S.tabelaCelula, { width: 40, textAlign: 'center' }]}>[ ]</Text>
              <View style={[S.tabelaCelula, { flex: 1.5, borderBottomWidth: 0.5, borderBottomColor: '#D4CFC9', borderStyle: 'dashed', height: 16 }]} />
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Checklist — Anotações e Observações</Text>
        <Text style={S.paragrafo}>Use este espaço para registrar contatos, valores negociados e observações importantes durante o planejamento.</Text>
        <View style={{ marginTop: 12 }}>
          {checklist.slice(10, 20).map((item, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[S.tabelaCelula, { width: 30 }]}>[ ]</Text>
                <Text style={[S.tabelaCelula, { flex: 1 }]}>{item.item}</Text>
              </View>
              <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#D4CFC9', borderStyle: 'dashed', height: 20 }} />
              <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#D4CFC9', borderStyle: 'dashed', height: 20 }} />
            </View>
          ))}
          {checklist.length <= 10 && Array.from({ length: 8 }).map((_, i) => (
            <View key={`extra-${i}`} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[S.tabelaCelula, { width: 30 }]}>[ ]</Text>
                <Text style={[S.tabelaCelula, { flex: 1 }]}>_________________________________________</Text>
              </View>
              <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#D4CFC9', borderStyle: 'dashed', height: 20 }} />
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINAS 22-23: FORNECEDORES */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Fornecedores</Text>
        <Text style={S.paragrafo}>Mantenha este registro atualizado com os contatos de todos os fornecedores. Compartilhe com seu cerimonialista e padrinhos de confiança.</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 90 }]}>Categoria</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 1.2 }]}>Nome</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 1 }]}>Telefone</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 1.2 }]}>E-mail</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 60 }]}>Status</Text>
          </View>
          {fornecedores.slice(0, 12).map((item, i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 90 }]}>{item.categoria}</Text>
              <Text style={[S.tabelaCelula, { flex: 1.2 }]}>{item.nome}</Text>
              <Text style={[S.tabelaCelula, { flex: 1 }]}>________________</Text>
              <Text style={[S.tabelaCelula, { flex: 1.2 }]}>________________</Text>
              <Text style={[S.tabelaCelula, { width: 60 }]}>A contratar</Text>
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Fornecedores — Anotações</Text>
        <Text style={S.paragrafo}>Registre valores negociados, datas de pagamento e observações importantes sobre cada fornecedor.</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 90 }]}>Categoria</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 1 }]}>Valor</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 1 }]}>Prazo</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Anotações</Text>
          </View>
          {fornecedores.slice(0, 10).map((item, i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 90 }]}>{item.categoria}</Text>
              <Text style={[S.tabelaCelula, { flex: 1 }]}>R$ ____________</Text>
              <Text style={[S.tabelaCelula, { flex: 1 }]}>____________</Text>
              <View style={[S.tabelaCelula, { flex: 2, borderBottomWidth: 0.5, borderBottomColor: '#D4CFC9', borderStyle: 'dashed', height: 16 }]} />
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINAS 24-25: ORÇAMENTO DETALHADO */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Orçamento Detalhado</Text>
        <Text style={S.paragrafo}>Esta estimativa foi regionalizada com base em {cidade || 'sua cidade'} / {estado || 'seu estado'}. Os valores são referências médias de mercado — ajuste conforme seu orçamento real.</Text>
        
        <Text style={S.subtitulo}>Distribuição do Orçamento</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <PizzaChart
            data={itensOrcamento.slice(0, 8)}
            colors={[corPrimaria, corSecundaria, corTerciaria, corBorda, '#8B6F5E', '#C8BFB4', '#5C534A', '#A89F91']}
            size={140}
          />
          <View style={{ marginLeft: 20, flex: 1 }}>
            {itensOrcamento.slice(0, 8).map((item, i) => {
              const coresPizza = [corPrimaria, corSecundaria, corTerciaria, corBorda, '#8B6F5E', '#C8BFB4', '#5C534A', '#A89F91'];
              return (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <View style={{ width: 12, height: 12, backgroundColor: coresPizza[i % coresPizza.length], marginRight: 8 }} />
                  <Text style={{ fontFamily: fonteCorpo, fontSize: 9, color: corTexto }}>{item.item} ({item.percentual}%)</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Item</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 60 }]}>%</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 90 }]}>Valor Estimado</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 90 }]}>Valor Real</Text>
          </View>
          {itensOrcamento.slice(0, 15).map((item, i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{item.item}</Text>
              <Text style={[S.tabelaCelula, { width: 60 }]}>{item.percentual}%</Text>
              <Text style={[S.tabelaCelula, { width: 90 }]}>R$ {item.valor.toLocaleString('pt-BR')}</Text>
              <Text style={[S.tabelaCelula, { width: 90 }]}>R$ ____________</Text>
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Orçamento Detalhado — Continuação</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Item</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 60 }]}>%</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 90 }]}>Valor Estimado</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 90 }]}>Valor Real</Text>
          </View>
          {itensOrcamento.slice(15).map((item, i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{item.item}</Text>
              <Text style={[S.tabelaCelula, { width: 60 }]}>{item.percentual}%</Text>
              <Text style={[S.tabelaCelula, { width: 90 }]}>R$ {item.valor.toLocaleString('pt-BR')}</Text>
              <Text style={[S.tabelaCelula, { width: 90 }]}>R$ ____________</Text>
            </View>
          ))}
          <View style={[S.tabelaLinha, { borderTopWidth: 1, borderTopColor: corTitulo, marginTop: 4 }]}>
            <Text style={[S.tabelaCelula, { flex: 2, fontFamily: fonteDisplay, color: corTitulo }]}>TOTAL ESTIMADO</Text>
            <Text style={[S.tabelaCelula, { width: 60, color: corTitulo }]}>100%</Text>
            <Text style={[S.tabelaCelula, { width: 90, color: corTitulo }]}>
              R$ {itensOrcamento.reduce((s, i) => s + i.valor, 0).toLocaleString('pt-BR')}
            </Text>
            <Text style={[S.tabelaCelula, { width: 90, color: corTitulo }]}>R$ ____________</Text>
          </View>
        </View>
        <View style={S.boxInfo}>
          <Text style={S.boxInfoTexto}>Dica: reserve 10% do orçamento total para imprevistos. O item "Reserva de emergência" já está incluído na tabela acima.</Text>
          <Text style={S.boxInfoTexto}>Negocie pacotes completos com fornecedores — muitos oferecem descontos ao contratar múltiplos serviços.</Text>
          <Text style={S.boxInfoTexto}>Considere casamentos em dias de semana ou fora de temporada para reduzir custos com espaço e buffet.</Text>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINA 26: DICAS REGIONAIS */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Dicas Regionais</Text>
        <Text style={S.paragrafo}>Informações específicas para {localCompleto} baseadas no clima, cultura local e experiências de casamentos na região.</Text>
        
        <Text style={S.subtitulo}>Clima Local</Text>
        <View style={S.boxInfo}>
          <Text style={S.boxInfoTexto}>{dicasRegionais.clima}</Text>
        </View>

        <Text style={S.subtitulo}>Cuidados Especiais</Text>
        {dicasRegionais.cuidados.map((cuidado, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 6, marginLeft: 10 }}>
            <Text style={{ fontFamily: fonteCorpo, fontSize: 10, color: corTitulo, marginRight: 6 }}>•</Text>
            <Text style={{ fontFamily: fonteCorpo, fontSize: 10, color: corTexto, flex: 1, lineHeight: 1.6 }}>{cuidado}</Text>
          </View>
        ))}

        <Text style={S.subtitulo}>Melhores Épocas para Casar</Text>
        {dicasRegionais.melhoresEpocas.map((epoca, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 6, marginLeft: 10 }}>
            <Text style={{ fontFamily: fonteCorpo, fontSize: 10, color: corTitulo, marginRight: 6 }}>✓</Text>
            <Text style={{ fontFamily: fonteCorpo, fontSize: 10, color: corTexto, flex: 1, lineHeight: 1.6 }}>{epoca}</Text>
          </View>
        ))}

        <Text style={S.subtitulo}>Fornecedores Locais Recomendados</Text>
        <Text style={S.paragrafo}>Consulte a base de fornecedores do descomplicaí filtrada por {cidade || 'sua cidade'}. Nossa curadoria inclui apenas profissionais com avaliações verificadas.</Text>
        <View style={S.boxInfo}>
          <Text style={S.boxInfoTexto}>Acesse arxum.csstudios.site/descomplicai para encontrar fornecedores em {cidade || 'sua cidade'}.</Text>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PÁGINA 27: CONTRACAPA */}
      <Page size="A4" style={S.pagina}>
        <View style={S.ctaContainer}>
          <Text style={S.ctaTitulo}>Obrigado por confiar no descomplicaí</Text>
          <Text style={S.ctaTexto}>
            {nomeCasal}, este memorial é apenas o começo da sua jornada. Assine o descomplicaí e tenha acesso à gestão completa do seu casamento: fornecedores, orçamento, convidados, cronograma e muito mais — tudo em um só lugar.
          </Text>
          <Text style={S.ctaTexto}>
            Você ainda pode convidar seu cerimonialista, padrinhos e familiares para colaborar no planejamento. Organize, sonhe e realize com quem você ama.
          </Text>
          <Text style={[S.ctaTexto, { fontFamily: fonteDisplay, fontSize: 14, color: corTitulo, marginTop: 12 }]}>
            "O amor é a poesia dos sentidos."
          </Text>
          <Text style={[S.ctaTexto, { fontSize: 10, color: corTextoSuave }]}>
            — Honoré de Balzac
          </Text>
          <View style={{ marginTop: 24, alignItems: 'center' }}>
            {qrCodeDataUri ? (
              <Image src={qrCodeDataUri} style={{ width: 100, height: 100 }} />
            ) : (
              <View style={{ width: 100, height: 100, backgroundColor: '#F3F0EC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: corBorda }}>
                <Text style={{ fontSize: 8, color: corTextoSuave }}>QR Code</Text>
              </View>
            )}
            <Text style={[S.ctaUrl, { marginTop: 12 }]}>arxum.csstudios.site/descomplicai</Text>
          </View>
          <Text style={[S.ctaTexto, { fontSize: 10, color: corTextoSuave, marginTop: 16 }]}>
            Escaneie o QR code ou acesse o link para começar agora.
          </Text>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>
    </Document>
  );
}