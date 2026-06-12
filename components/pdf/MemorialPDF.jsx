// components/pdf/MemorialPDF.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { sugerirFontes } from '../../utils/sugestoes';

// ========== REGISTRO DE FONTES LOCAIS (nomes exatos dos arquivos) ==========
const FONTES_LOCAIS = {
  'Cormorant Garamond': {
    regular: '/fonts/cormorant-garamond-v21-latin-regular.woff2',
    bold: '/fonts/cormorant-garamond-v21-latin-700.woff2',
  },
  'Playfair Display': {
    regular: '/fonts/playfair-display-v40-latin-regular.woff2',
    bold: '/fonts/playfair-display-v40-latin-700.woff2',
  },
  'Amatic SC': {
    regular: '/fonts/amatic-sc-v28-latin-regular.woff2',
    bold: '/fonts/amatic-sc-v28-latin-700.woff2',
  },
  'Lora': {
    regular: '/fonts/lora-v37-latin-regular.woff2',
    bold: '/fonts/lora-v37-latin-700.woff2',
  },
  'Josefin Sans': {
    regular: '/fonts/josefin-sans-v34-latin-regular.woff2',
    bold: '/fonts/josefin-sans-v34-latin-700.woff2',
  },
  'Montserrat': {
    regular: '/fonts/montserrat-v31-latin-regular.woff2',
    bold: '/fonts/montserrat-v31-latin-700.woff2',
  },
  'Open Sans': {
    regular: '/fonts/open-sans-v44-latin-regular.woff2',
    bold: '/fonts/open-sans-v44-latin-700.woff2',
  },
  'Inter': {
    regular: '/fonts/inter-v20-latin-regular.woff2',
    bold: '/fonts/inter-v20-latin-700.woff2',
  },
  'Oswald': {
    regular: '/fonts/oswald-v57-latin-regular.woff2',
    bold: '/fonts/oswald-v57-latin-700.woff2',
  },
  'Roboto': {
    regular: '/fonts/roboto-v51-latin-regular.woff2',
    bold: '/fonts/roboto-v51-latin-700.woff2',
  },
  'Pacifico': {
    regular: '/fonts/pacifico-v23-latin-regular.woff2',
  },
  'Nunito': {
    regular: '/fonts/nunito-v32-latin-regular.woff2',
    bold: '/fonts/nunito-v32-latin-700.woff2',
  },
  'Great Vibes': {
    regular: '/fonts/great-vibes-v21-latin-regular.woff2',
  },
  'Crimson Text': {
    regular: '/fonts/crimson-text-v19-latin-regular.woff2',
    bold: '/fonts/crimson-text-v19-latin-700.woff2',
  },
  'EB Garamond': {
    regular: '/fonts/eb-garamond-v32-latin-regular.woff2',
    bold: '/fonts/eb-garamond-v32-latin-700.woff2',
  },
  'DM Sans': {
    light: '/fonts/dm-sans-v17-latin-300.woff2',
    regular: '/fonts/dm-sans-v17-latin-regular.woff2',
    medium: '/fonts/dm-sans-v17-latin-500.woff2',
    bold: '/fonts/dm-sans-v17-latin-700.woff2',
  },
  'Space Mono': {
    regular: '/fonts/space-mono-v17-latin-regular.woff2',
    bold: '/fonts/space-mono-v17-latin-700.woff2',
    italic: '/fonts/space-mono-v17-latin-italic.woff2',
    boldItalic: '/fonts/space-mono-v17-latin-700italic.woff2',
  },
  // Fontes adicionais sugeridas pelo Claude (já baixadas)
  'Dancing Script': {
    regular: '/fonts/dancing-script-v29-latin-regular.woff2',
    bold: '/fonts/dancing-script-v29-latin-700.woff2',
  },
  'JetBrains Mono': {
    regular: '/fonts/jetbrains-mono-v24-latin-regular.woff2',
    bold: '/fonts/jetbrains-mono-v24-latin-700.woff2',
  },
  'Lato': {
    regular: '/fonts/lato-v25-latin-regular.woff2',
    bold: '/fonts/lato-v25-latin-700.woff2',
  },
  'Libre Baskerville': {
    regular: '/fonts/libre-baskerville-v24-latin-regular.woff2',
    bold: '/fonts/libre-baskerville-v24-latin-700.woff2',
  },
  'Parisienne': {
    regular: '/fonts/parisienne-v14-latin-regular.woff2',
  },
  'Source Serif 4': {
    regular: '/fonts/source-serif-4-v14-latin-regular.woff2',
    bold: '/fonts/source-serif-4-v14-latin-700.woff2',
  },
};

function registrarFontesLocais(estilo) {
  const fontes = sugerirFontes(estilo) || [];
  fontes.forEach((fonte) => {
    const arquivos = FONTES_LOCAIS[fonte.nome];
    if (!arquivos) return;
    try {
      const fonts = [];
      if (arquivos.light) fonts.push({ src: arquivos.light, fontWeight: 300 });
      if (arquivos.regular) fonts.push({ src: arquivos.regular, fontWeight: 400 });
      if (arquivos.medium) fonts.push({ src: arquivos.medium, fontWeight: 500 });
      if (arquivos.bold) fonts.push({ src: arquivos.bold, fontWeight: 700 });
      if (arquivos.italic) fonts.push({ src: arquivos.italic, fontWeight: 400, fontStyle: 'italic' });
      if (arquivos.boldItalic) fonts.push({ src: arquivos.boldItalic, fontWeight: 700, fontStyle: 'italic' });
      if (fonts.length > 0) {
        Font.register({ family: fonte.nome, fonts });
      }
    } catch (e) {
      /* fallback para Times-Roman/Helvetica */
    }
  });
}

// ========== MAPEAMENTO DE IMAGENS DE REFERÊNCIA ==========
const IMAGENS = {
  flores: {
    'Rosas': 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=400',
    'Orquídeas': 'https://images.unsplash.com/photo-1524592628638-25ae9e6a7c74?w=400',
    'Hortênsias': 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=400',
    'Girassóis': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
    'Margaridas': 'https://images.unsplash.com/photo-1508610041833-9f3d18d4ce3f?w=400',
    'Ranúnculos': 'https://images.unsplash.com/photo-1589123053646-4e8c49b46e1a?w=400',
    'Flores secas': 'https://images.unsplash.com/photo-1606041008023-472cdb5e530f?w=400',
    'Antúrios': 'https://images.unsplash.com/photo-1561181286-d5ef734d74e6?w=400',
    'Helicônias': 'https://images.unsplash.com/photo-1573481070555-1ba1cd7f7c54?w=400',
    'Copo-de-leite': 'https://images.unsplash.com/photo-1593483316242-1eae1e0c1cf8?w=400',
    'Flores do campo': 'https://images.unsplash.com/photo-1503249025-3db4d9a8b2e7?w=400',
    default: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400',
  },
  vestido: {
    'Princesa': 'https://images.unsplash.com/photo-1520975916093-a1b5c5a1b3f0?w=400',
    'Sereia': 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
    'Boho': 'https://images.unsplash.com/photo-1515562141580-4f50a5d4e4e4?w=400',
    'Minimalista': 'https://images.unsplash.com/photo-1550639525-c97d454acf70?w=400',
    'Jumpsuit': 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e2?w=400',
    default: 'https://images.unsplash.com/photo-1551787766-1f3e9e1e6e3a?w=400',
  },
  mesaPosta: {
    'classico': 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400',
    'rustico': 'https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?w=400',
    'boho': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
    'moderno': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
    'minimalista': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
    'industrial': 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400',
    'tropical': 'https://images.unsplash.com/photo-1520453803296-c39e5b1e4e3a?w=400',
    'romantico': 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400',
    'gotico': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
    'vintage': 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=400',
    default: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400',
  },
  decoracao: {
    'classico': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
    'rustico': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
    'boho': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
    'moderno': 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400',
    'minimalista': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
    'industrial': 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400',
    'tropical': 'https://images.unsplash.com/photo-1520453803296-c39e5b1e4e3a?w=400',
    'romantico': 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400',
    'gotico': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
    'vintage': 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=400',
    default: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
  },
};

function getImagem(categoria, chave) {
  return IMAGENS[categoria]?.[chave] || IMAGENS[categoria]?.default || null;
}

// ========== UTILITÁRIOS ==========
function getPaleta(dados) {
  if (dados?.paleta?.length) return dados.paleta;
  return ['#8B6F5E', '#E5E0D9', '#F9F7F4'];
}

function isCorEscura(hex) {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

function getCorBorda(paleta) {
  return paleta.find(isCorEscura) || '#8B6F5E';
}

function capitalizarNome(nome) {
  if (!nome) return '';
  return nome.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
}

function formatarData(dataISO) {
  if (!dataISO) return 'Data a definir';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

// ========== COMPONENTE PRINCIPAL ==========
export function MemorialPDF({ memorial, dadosEvento }) {
  const estilo = dadosEvento?.estilo || 'classico';
  registrarFontesLocais(estilo);

  const paleta = getPaleta(dadosEvento);
  const corPrimaria = paleta[0];
  const corSecundaria = paleta[1];
  const corTerciaria = paleta[2];
  const corBorda = getCorBorda(paleta);
  const corTexto = '#1A1714';
  const corTextoSuave = '#5C534A';

  const nome1 = capitalizarNome(dadosEvento?.nomePessoa1 || '');
  const nome2 = capitalizarNome(dadosEvento?.nomePessoa2 || '');
  const nomeCasal = nome1 && nome2 ? `${nome1} & ${nome2}` : 'Nosso Casamento';
  const dataFormatada = formatarData(dadosEvento?.dataEvento);
  const cidade = dadosEvento?.cidadeEvento || '';
  const fontesSugeridas = sugerirFontes(estilo);
  const fonteDisplay = fontesSugeridas.find(f => f.uso === 'display')?.nome || 'Times-Roman';
  const fonteCorpo = fontesSugeridas.find(f => f.uso === 'corpo')?.nome || 'Helvetica';

  const flores = dadosEvento?.flores || '';
  const imagemFlores = getImagem('flores', flores) || getImagem('flores', 'default');
  const imagemVestido = getImagem('vestido', dadosEvento?.estiloVestido) || getImagem('vestido', 'default');
  const imagemMesa = getImagem('mesaPosta', estilo) || getImagem('mesaPosta', 'default');
  const imagemDecoracao = getImagem('decoracao', estilo) || getImagem('decoracao', 'default');

  const estilosPDF = StyleSheet.create({
    capa: { backgroundColor: corTerciaria, height: '100%', alignItems: 'center', justifyContent: 'center', padding: 60 },
    capaLinha: { width: 50, height: 1.5, backgroundColor: corPrimaria, marginBottom: 28 },
    capaTitulo: { fontFamily: fonteDisplay, fontSize: 38, color: corTexto, textAlign: 'center', marginBottom: 16 },
    capaSubtitulo: { fontFamily: fonteCorpo, fontSize: 13, color: corTextoSuave, textAlign: 'center', marginBottom: 10 },
    capaData: { fontFamily: fonteCorpo, fontSize: 12, color: corPrimaria, textAlign: 'center', marginTop: 12 },
    capaLocal: { fontFamily: fonteCorpo, fontSize: 12, color: corTextoSuave, textAlign: 'center', marginTop: 6 },
    paletaContainer: { flexDirection: 'row', gap: 12, marginTop: 32, alignItems: 'center', justifyContent: 'center' },
    corSwatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: corBorda },
    pagina: { backgroundColor: '#FFFFFF', padding: 50, paddingBottom: 70 },
    tituloSecao: { fontFamily: fonteDisplay, fontSize: 24, color: corPrimaria, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: corSecundaria, paddingBottom: 10 },
    paragrafo: { fontFamily: fonteCorpo, fontSize: 11, color: corTexto, lineHeight: 1.8, marginBottom: 8 },
    imagem: { width: 200, height: 150, alignSelf: 'center', marginVertical: 12, borderRadius: 4 },
    rodape: { position: 'absolute', bottom: 20, left: 50, right: 50, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: corSecundaria, paddingTop: 6 },
    rodapeTexto: { fontFamily: fonteCorpo, fontSize: 8, color: corTextoSuave },
    tabela: { marginTop: 8, marginBottom: 8 },
    tabelaLinha: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: corSecundaria, paddingVertical: 4 },
    tabelaCelula: { fontFamily: fonteCorpo, fontSize: 10, color: corTexto, flex: 1 },
    tabelaCelulaHeader: { fontFamily: fonteCorpo, fontSize: 10, fontWeight: 'bold', color: corPrimaria, flex: 1 },
    ctaContainer: { alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40 },
    ctaTitulo: { fontFamily: fonteDisplay, fontSize: 24, color: corPrimaria, textAlign: 'center', marginBottom: 16 },
    ctaTexto: { fontFamily: fonteCorpo, fontSize: 12, color: corTexto, textAlign: 'center', lineHeight: 1.8, marginBottom: 20 },
  });

  function Rodape({ nome, pagina }) {
    return (
      <View style={estilosPDF.rodape} fixed>
        <Text style={estilosPDF.rodapeTexto}>{nome}</Text>
        <Text style={estilosPDF.rodapeTexto}>gerado pelo descomplicaí · descomplicai.com.br</Text>
        <Text style={estilosPDF.rodapeTexto}>{pagina}</Text>
      </View>
    );
  }

  // Parse markdown
  const secoes = [];
  const linhasMemorial = (memorial || '').split('\n');
  let atual = null;
  for (const linha of linhasMemorial) {
    if (linha.startsWith('## ')) {
      if (atual) secoes.push(atual);
      atual = { titulo: linha.replace('## ', '').trim(), linhas: [] };
    } else if (atual) {
      atual.linhas.push(linha);
    }
  }
  if (atual) secoes.push(atual);

  const fornecedores = dadosEvento?.fornecedoresNecessarios || [
    { categoria: 'Fotografia', nome: 'Fotógrafo' },
    { categoria: 'Buffet', nome: 'Buffet' },
    { categoria: 'Espaço', nome: 'Espaço / Venue' },
  ];

  const itensOrcamento = [
    { item: 'Espaço e locação', percentual: 18, valorEstimado: 4500 },
    { item: 'Buffet e alimentação', percentual: 28, valorEstimado: 7000 },
    { item: 'Bebidas e bar', percentual: 10, valorEstimado: 2500 },
    { item: 'Decoração e flores', percentual: 15, valorEstimado: 3750 },
    { item: 'Fotografia e vídeo', percentual: 10, valorEstimado: 2500 },
    { item: 'Música e entretenimento', percentual: 8, valorEstimado: 2000 },
    { item: 'Vestuário e beleza', percentual: 6, valorEstimado: 1500 },
    { item: 'Papelaria e convites', percentual: 3, valorEstimado: 750 },
    { item: 'Transporte e logística', percentual: 2, valorEstimado: 500 },
  ];

  const checklist = [
    { item: 'Definir data do casamento', prazo: '12 meses antes' },
    { item: 'Reservar local', prazo: '10 meses antes' },
    { item: 'Contratar fotógrafo', prazo: '8 meses antes' },
    { item: 'Provar vestido/traje', prazo: '6 meses antes' },
    { item: 'Definir cardápio', prazo: '4 meses antes' },
    { item: 'Enviar convites', prazo: '3 meses antes' },
    { item: 'Prova de cabelo/maquiagem', prazo: '2 meses antes' },
    { item: 'Confirmar presenças', prazo: '1 mês antes' },
    { item: 'Ensaio geral', prazo: '1 semana antes' },
  ];

  const basePagina = 2;

  return (
    <Document>
      {/* CAPA */}
      <Page size="A4" style={estilosPDF.capa}>
        <View style={estilosPDF.capaLinha} />
        <Text style={estilosPDF.capaTitulo}>{nomeCasal}</Text>
        <Text style={estilosPDF.capaSubtitulo}>Memorial do Casamento</Text>
        {cidade ? <Text style={estilosPDF.capaLocal}>{cidade}</Text> : null}
        <Text style={estilosPDF.capaData}>{dataFormatada}</Text>
        <View style={[estilosPDF.capaLinha, { marginTop: 36, marginBottom: 0 }]} />
        <View style={estilosPDF.paletaContainer}>
          {paleta.map((cor, i) => (
            <View key={i} style={{ alignItems: 'center' }}>
              <View style={[estilosPDF.corSwatch, { backgroundColor: cor }]} />
              <Text style={{ fontSize: 8, fontFamily: fonteCorpo, color: corTextoSuave, marginTop: 4 }}>{cor}</Text>
            </View>
          ))}
        </View>
        <Rodape nome={nomeCasal} pagina="1" />
      </Page>

      {/* BOAS-VINDAS */}
      <Page size="A4" style={estilosPDF.pagina}>
        <Text style={estilosPDF.tituloSecao}>Bem-vindos ao seu memorial</Text>
        <Text style={estilosPDF.paragrafo}>
          Este memorial foi criado exclusivamente para {nomeCasal} pelo Descomplicaí. Ele reúne todas as decisões, referências e orientações práticas para tornar o planejamento do seu casamento uma experiência leve e organizada.
        </Text>
        <Text style={{ ...estilosPDF.tituloSecao, fontSize: 16, marginTop: 20 }}>Índice</Text>
        {secoes.map((s, i) => (
          <Text key={i} style={estilosPDF.paragrafo}>{s.titulo} — pág. {basePagina + i}</Text>
        ))}
        <Text style={estilosPDF.paragrafo}>Fornecedores — pág. {basePagina + secoes.length}</Text>
        <Text style={estilosPDF.paragrafo}>Orçamento — pág. {basePagina + secoes.length + 1}</Text>
        <Text style={estilosPDF.paragrafo}>Checklist — pág. {basePagina + secoes.length + 2}</Text>
        <Rodape nome={nomeCasal} pagina="2" />
      </Page>

      {/* SEÇÕES */}
      {secoes.map((secao, idx) => (
        <Page key={idx} size="A4" style={estilosPDF.pagina}>
          <Text style={estilosPDF.tituloSecao}>{secao.titulo}</Text>
          {secao.linhas.map((l, i) => (
            <Text key={i} style={estilosPDF.paragrafo}>{l.replace(/[*_]{1,2}/g, '').trim()}</Text>
          ))}
          {secao.titulo.includes('Identidade Visual') && <Image style={estilosPDF.imagem} src={imagemDecoracao} />}
          {secao.titulo.includes('Decoração') && <Image style={estilosPDF.imagem} src={imagemFlores} />}
          {secao.titulo.includes('Mesa Posta') && <Image style={estilosPDF.imagem} src={imagemMesa} />}
          {secao.titulo.includes('Vestuário') && <Image style={estilosPDF.imagem} src={imagemVestido} />}
          <Rodape nome={nomeCasal} pagina={String(basePagina + idx)} />
        </Page>
      ))}

      {/* FORNECEDORES */}
      <Page size="A4" style={estilosPDF.pagina}>
        <Text style={estilosPDF.tituloSecao}>Fornecedores Necessários</Text>
        <View style={estilosPDF.tabela}>
          <View style={estilosPDF.tabelaLinha}>
            <Text style={estilosPDF.tabelaCelulaHeader}>Categoria</Text>
            <Text style={estilosPDF.tabelaCelulaHeader}>Fornecedor</Text>
            <Text style={estilosPDF.tabelaCelulaHeader}>Contato</Text>
            <Text style={estilosPDF.tabelaCelulaHeader}>Status</Text>
          </View>
          {fornecedores.map((f, i) => (
            <View key={i} style={estilosPDF.tabelaLinha}>
              <Text style={estilosPDF.tabelaCelula}>{f.categoria}</Text>
              <Text style={estilosPDF.tabelaCelula}>{f.nome}</Text>
              <Text style={estilosPDF.tabelaCelula}>________________</Text>
              <Text style={estilosPDF.tabelaCelula}>A contratar</Text>
            </View>
          ))}
        </View>
        <Rodape nome={nomeCasal} pagina={String(basePagina + secoes.length)} />
      </Page>

      {/* ORÇAMENTO */}
      <Page size="A4" style={estilosPDF.pagina}>
        <Text style={estilosPDF.tituloSecao}>Estimativa de Orçamento</Text>
        <View style={estilosPDF.tabela}>
          <View style={estilosPDF.tabelaLinha}>
            <Text style={estilosPDF.tabelaCelulaHeader}>Item</Text>
            <Text style={estilosPDF.tabelaCelulaHeader}>%</Text>
            <Text style={estilosPDF.tabelaCelulaHeader}>Valor Estimado</Text>
          </View>
          {itensOrcamento.map((item, i) => (
            <View key={i} style={estilosPDF.tabelaLinha}>
              <Text style={estilosPDF.tabelaCelula}>{item.item}</Text>
              <Text style={estilosPDF.tabelaCelula}>{item.percentual}%</Text>
              <Text style={estilosPDF.tabelaCelula}>R$ {item.valorEstimado.toLocaleString('pt-BR')}</Text>
            </View>
          ))}
        </View>
        <Rodape nome={nomeCasal} pagina={String(basePagina + secoes.length + 1)} />
      </Page>

      {/* CHECKLIST */}
      <Page size="A4" style={estilosPDF.pagina}>
        <Text style={estilosPDF.tituloSecao}>Checklist de Decisões</Text>
        <View style={estilosPDF.tabela}>
          <View style={estilosPDF.tabelaLinha}>
            <Text style={estilosPDF.tabelaCelulaHeader}>Decisão</Text>
            <Text style={estilosPDF.tabelaCelulaHeader}>Prazo</Text>
            <Text style={estilosPDF.tabelaCelulaHeader}>✓</Text>
          </View>
          {checklist.map((item, i) => (
            <View key={i} style={estilosPDF.tabelaLinha}>
              <Text style={estilosPDF.tabelaCelula}>{item.item}</Text>
              <Text style={estilosPDF.tabelaCelula}>{item.prazo}</Text>
              <Text style={estilosPDF.tabelaCelula}>[ ]</Text>
            </View>
          ))}
        </View>
        <Rodape nome={nomeCasal} pagina={String(basePagina + secoes.length + 2)} />
      </Page>

      {/* CONTRACAPA */}
      <Page size="A4" style={estilosPDF.pagina}>
        <View style={estilosPDF.ctaContainer}>
          <Text style={estilosPDF.ctaTitulo}>Seu casamento merece o melhor</Text>
          <Text style={estilosPDF.ctaTexto}>
            Assine o Descomplicaí e faça a gestão total do seu casamento de forma inteligente e descomplicada. Você terá controle total de tudo — fornecedores, orçamento, convidados e cronograma — em um só lugar. E ainda pode convidar seu cerimonialista para colaborar.
          </Text>
          <Text style={[estilosPDF.ctaTexto, { fontWeight: 'bold', marginTop: 8 }]}>
            Acesse descomplicai.com.br e comece agora.
          </Text>
        </View>
        <Rodape nome={nomeCasal} pagina={String(basePagina + secoes.length + 3)} />
      </Page>
    </Document>
  );
}