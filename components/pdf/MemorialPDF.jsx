// components/pdf/MemorialPDF.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { sugerirFontes } from '../../utils/sugestoes';
import path from 'path';
import fs from 'fs';

const BASE_FONTS = path.resolve(process.cwd(), 'public', 'fonts');

const FONTES_LOCAIS = {
  'Cormorant Garamond': { regular: path.join(BASE_FONTS, 'cormorant-garamond-v21-latin-regular.woff2') },
  'Playfair Display': { regular: path.join(BASE_FONTS, 'playfair-display-v40-latin-regular.woff2') },
  'Amatic SC': { regular: path.join(BASE_FONTS, 'amatic-sc-v28-latin-regular.woff2') },
  'Lora': { regular: path.join(BASE_FONTS, 'lora-v37-latin-regular.woff2') },
  'Josefin Sans': { regular: path.join(BASE_FONTS, 'josefin-sans-v34-latin-regular.woff2') },
  'Montserrat': { regular: path.join(BASE_FONTS, 'montserrat-v31-latin-regular.woff2') },
  'Open Sans': { regular: path.join(BASE_FONTS, 'open-sans-v44-latin-regular.woff2') },
  'Inter': { regular: path.join(BASE_FONTS, 'inter-v20-latin-regular.woff2') },
  'Oswald': { regular: path.join(BASE_FONTS, 'oswald-v57-latin-regular.woff2') },
  'Roboto': { regular: path.join(BASE_FONTS, 'roboto-v51-latin-regular.woff2') },
  'Pacifico': { regular: path.join(BASE_FONTS, 'pacifico-v23-latin-regular.woff2') },
  'Nunito': { regular: path.join(BASE_FONTS, 'nunito-v32-latin-regular.woff2') },
  'Great Vibes': { regular: path.join(BASE_FONTS, 'great-vibes-v21-latin-regular.woff2') },
  'Crimson Text': { regular: path.join(BASE_FONTS, 'crimson-text-v19-latin-regular.woff2') },
  'EB Garamond': { regular: path.join(BASE_FONTS, 'eb-garamond-v32-latin-regular.woff2') },
  'DM Sans': { regular: path.join(BASE_FONTS, 'dm-sans-v17-latin-regular.woff2') },
  'Space Mono': { regular: path.join(BASE_FONTS, 'space-mono-v17-latin-regular.woff2') },
};

function registrarFontesLocais(estilo) {
  const fontes = sugerirFontes(estilo) || [];
  fontes.forEach((fonte) => {
    const arquivo = FONTES_LOCAIS[fonte.nome]?.regular;
    if (!arquivo) return;
    if (!fs.existsSync(arquivo) || fs.statSync(arquivo).size === 0) return;
    try {
      Font.register({ family: fonte.nome, src: arquivo });
    } catch (e) {
      console.warn(`Falha ao registrar fonte ${fonte.nome}:`, e.message);
    }
  });
}

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

function getCorContraste(hex) {
  return isCorEscura(hex) ? '#FFFFFF' : '#1A1714';
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

// Função para renderizar linhas de markdown em componentes PDF
function renderizarLinha(linha, estilos, idx) {
  // Títulos
  if (linha.startsWith('### ')) {
    return <Text key={idx} style={estilos.subtitulo}>{linha.replace('### ', '')}</Text>;
  }
  // Listas
  if (linha.trim().startsWith('* ') || linha.trim().startsWith('- ')) {
    const texto = linha.trim().substring(2).replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    return (
      <View key={idx} style={{ flexDirection: 'row', marginBottom: 4, marginLeft: 20 }}>
        <Text style={estilos.paragrafo}>• </Text>
        <Text style={estilos.paragrafo}>{texto}</Text>
      </View>
    );
  }
  // Parágrafos normais com suporte a negrito
  const texto = linha.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();
  if (!texto) return <View key={idx} style={{ height: 8 }} />; // linha em branco
  return <Text key={idx} style={estilos.paragrafo}>{texto}</Text>;
}

function renderizarFornecedores(linhas, estilos) {
  // Extrai categorias e nomes do texto markdown
  const itens = [];
  let categoriaAtual = '';
  linhas.forEach(linha => {
    const trimmed = linha.trim();
    if (trimmed.startsWith('### ')) {
      categoriaAtual = trimmed.replace('### ', '').replace(/\*\*/g, '');
    } else if (trimmed.startsWith('* ') && categoriaAtual) {
      const nome = trimmed.substring(2).replace(/\*\*/g, '');
      itens.push({ categoria: categoriaAtual, nome });
    }
  });
  if (itens.length === 0) return null;
  return (
    <View style={estilos.tabela}>
      <View style={estilos.tabelaLinha}>
        <Text style={estilos.tabelaCelulaHeader}>Categoria</Text>
        <Text style={estilos.tabelaCelulaHeader}>Fornecedor</Text>
        <Text style={estilos.tabelaCelulaHeader}>Contato</Text>
        <Text style={estilos.tabelaCelulaHeader}>Status</Text>
      </View>
      {itens.map((item, i) => (
        <View key={i} style={estilos.tabelaLinha}>
          <Text style={estilos.tabelaCelula}>{item.categoria}</Text>
          <Text style={estilos.tabelaCelula}>{item.nome}</Text>
          <Text style={estilos.tabelaCelula}>________________</Text>
          <Text style={estilos.tabelaCelula}>A contratar</Text>
        </View>
      ))}
    </View>
  );
}

function renderizarOrcamento(linhas, estilos, cores) {
  // Procura por padrões de percentual ou valor
  const itens = [];
  linhas.forEach(linha => {
    const match = linha.match(/\*\*(.*?)\*\*:\s*(\d+)%/);
    if (match) {
      itens.push({ item: match[1], percentual: parseInt(match[2]) });
    }
  });
  if (itens.length === 0) return null;
  return (
    <View style={estilos.tabela}>
      <View style={estilos.tabelaLinha}>
        <Text style={estilos.tabelaCelulaHeader}>Categoria</Text>
        <Text style={estilos.tabelaCelulaHeader}>Percentual</Text>
      </View>
      {itens.map((item, i) => (
        <View key={i} style={estilos.tabelaLinha}>
          <Text style={estilos.tabelaCelula}>{item.item}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{ width: `${item.percentual}%`, height: 10, backgroundColor: cores[i % cores.length], marginRight: 8 }} />
            <Text style={estilos.tabelaCelula}>{item.percentual}%</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function renderizarChecklist(linhas, estilos) {
  const itens = [];
  linhas.forEach(linha => {
    const trimmed = linha.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const texto = trimmed.substring(2).replace(/\*\*/g, '');
      // Exemplo: "Definir data do casamento (12 meses antes)"
      const match = texto.match(/(.*?)\s*\((\d+.*?)\)/);
      if (match) {
        itens.push({ item: match[1].trim(), prazo: match[2].trim() });
      } else {
        itens.push({ item: texto, prazo: '' });
      }
    }
  });
  if (itens.length === 0) return null;
  return (
    <View style={estilos.tabela}>
      <View style={estilos.tabelaLinha}>
        <Text style={estilos.tabelaCelulaHeader}>Decisão</Text>
        <Text style={estilos.tabelaCelulaHeader}>Prazo</Text>
        <Text style={estilos.tabelaCelulaHeader}>✓</Text>
      </View>
      {itens.map((item, i) => (
        <View key={i} style={estilos.tabelaLinha}>
          <Text style={estilos.tabelaCelula}>{item.item}</Text>
          <Text style={estilos.tabelaCelula}>{item.prazo}</Text>
          <Text style={estilos.tabelaCelula}>[ ]</Text>
        </View>
      ))}
    </View>
  );
}

export function MemorialPDF({ memorial, dadosEvento, usarFontesNativas = false }) {
  const estilo = dadosEvento?.estilo || 'classico';
  if (!usarFontesNativas) registrarFontesLocais(estilo);

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

  const fontesSugeridas = !usarFontesNativas ? sugerirFontes(estilo) : [];
  const fonteDisplay = fontesSugeridas.find(f => f.uso === 'display')?.nome || 'Times-Roman';
  const fonteCorpo = fontesSugeridas.find(f => f.uso === 'corpo')?.nome || 'Helvetica';

  const flores = dadosEvento?.flores || '';
  const imagemFlores = getImagem('flores', flores) || getImagem('flores', 'default');
  const imagemVestido = getImagem('vestido', dadosEvento?.estiloVestido) || getImagem('vestido', 'default');
  const imagemMesa = getImagem('mesaPosta', estilo) || getImagem('mesaPosta', 'default');
  const imagemDecoracao = getImagem('decoracao', estilo) || getImagem('decoracao', 'default');

  const corFundoCapa = corTerciaria;
  const corTextoCapa = getCorContraste(corFundoCapa);

  const estilosPDF = StyleSheet.create({
    capa: { backgroundColor: corFundoCapa, height: '100%', alignItems: 'center', justifyContent: 'center', padding: 60 },
    capaLinha: { width: 50, height: 1.5, backgroundColor: corTextoCapa, marginBottom: 28 },
    capaTitulo: { fontFamily: fonteDisplay, fontSize: 38, color: corTextoCapa, textAlign: 'center', marginBottom: 16 },
    capaSubtitulo: { fontFamily: fonteCorpo, fontSize: 13, color: corTextoCapa, textAlign: 'center', marginBottom: 10 },
    capaData: { fontFamily: fonteCorpo, fontSize: 12, color: corTextoCapa, textAlign: 'center', marginTop: 12 },
    capaLocal: { fontFamily: fonteCorpo, fontSize: 12, color: corTextoCapa, textAlign: 'center', marginTop: 6 },
    paletaContainer: { flexDirection: 'row', gap: 12, marginTop: 32, alignItems: 'center', justifyContent: 'center' },
    corSwatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: corBorda },
    corLabel: { fontSize: 8, fontFamily: fonteCorpo, color: corTextoCapa, marginTop: 4, textAlign: 'center' },
    pagina: { backgroundColor: '#FFFFFF', padding: 50, paddingBottom: 70 },
    tituloSecao: { fontFamily: fonteDisplay, fontSize: 24, color: corPrimaria, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: corSecundaria, paddingBottom: 10 },
    subtitulo: { fontFamily: fonteCorpo, fontSize: 14, fontWeight: 'bold', color: corPrimaria, marginTop: 12, marginBottom: 6 },
    paragrafo: { fontFamily: fonteCorpo, fontSize: 11, color: corTexto, lineHeight: 1.8, marginBottom: 6 },
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
        <Text style={estilosPDF.rodapeTexto}>Gerado pelo descomplicaí · arxum.csstudios.site/descomplicai</Text>
        <Text style={estilosPDF.rodapeTexto}>{pagina}</Text>
      </View>
    );
  }

  // Parse do memorial em seções
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

  // Identifica seções especiais
  const secoesNormais = [];
  let secaoFornecedores = null;
  let secaoOrcamento = null;
  let secaoChecklist = null;

  secoes.forEach(secao => {
    const tituloLower = secao.titulo.toLowerCase();
    if (tituloLower.includes('fornecedor')) secaoFornecedores = secao;
    else if (tituloLower.includes('orçamento') || tituloLower.includes('orcamento')) secaoOrcamento = secao;
    else if (tituloLower.includes('checklist') || tituloLower.includes('decisões pendentes')) secaoChecklist = secao;
    else secoesNormais.push(secao);
  });

  let paginaAtual = 2;

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
              <Text style={estilosPDF.corLabel}>{cor}</Text>
            </View>
          ))}
        </View>
        <Rodape nome={nomeCasal} pagina="1" />
      </Page>

      {/* ÍNDICE */}
      <Page size="A4" style={estilosPDF.pagina}>
        <Text style={estilosPDF.tituloSecao}>Índice</Text>
        {secoesNormais.map((s, i) => (
          <Text key={i} style={[estilosPDF.paragrafo, { marginLeft: 20 }]}>
            {s.titulo} — pág. {paginaAtual + i}
          </Text>
        ))}
        {secaoFornecedores && <Text style={[estilosPDF.paragrafo, { marginLeft: 20 }]}>Fornecedores — pág. {paginaAtual + secoesNormais.length}</Text>}
        {secaoOrcamento && <Text style={[estilosPDF.paragrafo, { marginLeft: 20 }]}>Orçamento — pág. {paginaAtual + secoesNormais.length + (secaoFornecedores ? 1 : 0)}</Text>}
        {secaoChecklist && <Text style={[estilosPDF.paragrafo, { marginLeft: 20 }]}>Checklist — pág. {paginaAtual + secoesNormais.length + (secaoFornecedores ? 1 : 0) + (secaoOrcamento ? 1 : 0)}</Text>}
        <Rodape nome={nomeCasal} pagina="2" />
      </Page>

      {/* SEÇÕES NORMAIS */}
      {secoesNormais.map((secao, idx) => (
        <Page key={`normal-${idx}`} size="A4" style={estilosPDF.pagina}>
          <Text style={estilosPDF.tituloSecao}>{secao.titulo}</Text>
          {secao.linhas.map((linha, i) => renderizarLinha(linha, estilosPDF, i))}
          {secao.titulo.includes('Identidade Visual') && <Image style={estilosPDF.imagem} src={imagemDecoracao} />}
          {secao.titulo.includes('Decoração') && <Image style={estilosPDF.imagem} src={imagemFlores} />}
          {secao.titulo.includes('Mesa Posta') && <Image style={estilosPDF.imagem} src={imagemMesa} />}
          {secao.titulo.includes('Vestuário') && <Image style={estilosPDF.imagem} src={imagemVestido} />}
          <Rodape nome={nomeCasal} pagina={String(paginaAtual + idx)} />
        </Page>
      ))}

      {/* FORNECEDORES */}
      {secaoFornecedores && (
        <Page size="A4" style={estilosPDF.pagina}>
          <Text style={estilosPDF.tituloSecao}>{secaoFornecedores.titulo}</Text>
          {renderizarFornecedores(secaoFornecedores.linhas, estilosPDF) || 
            secaoFornecedores.linhas.map((linha, i) => renderizarLinha(linha, estilosPDF, i))}
          <Rodape nome={nomeCasal} pagina={String(paginaAtual + secoesNormais.length)} />
        </Page>
      )}

      {/* ORÇAMENTO */}
      {secaoOrcamento && (
        <Page size="A4" style={estilosPDF.pagina}>
          <Text style={estilosPDF.tituloSecao}>{secaoOrcamento.titulo}</Text>
          {renderizarOrcamento(secaoOrcamento.linhas, estilosPDF, paleta) ||
            secaoOrcamento.linhas.map((linha, i) => renderizarLinha(linha, estilosPDF, i))}
          <Rodape nome={nomeCasal} pagina={String(paginaAtual + secoesNormais.length + (secaoFornecedores ? 1 : 0))} />
        </Page>
      )}

      {/* CHECKLIST */}
      {secaoChecklist && (
        <Page size="A4" style={estilosPDF.pagina}>
          <Text style={estilosPDF.tituloSecao}>{secaoChecklist.titulo}</Text>
          {renderizarChecklist(secaoChecklist.linhas, estilosPDF) ||
            secaoChecklist.linhas.map((linha, i) => renderizarLinha(linha, estilosPDF, i))}
          <Rodape nome={nomeCasal} pagina={String(paginaAtual + secoesNormais.length + (secaoFornecedores ? 1 : 0) + (secaoOrcamento ? 1 : 0))} />
        </Page>
      )}

      {/* CONTRACAPA */}
      <Page size="A4" style={estilosPDF.pagina}>
        <View style={estilosPDF.ctaContainer}>
          <Text style={estilosPDF.ctaTitulo}>Seu casamento merece o melhor</Text>
          <Text style={estilosPDF.ctaTexto}>
            Assine o Descomplicaí e faça a gestão total do seu casamento de forma inteligente e descomplicada. Você terá controle total de tudo — fornecedores, orçamento, convidados e cronograma — em um só lugar. E ainda pode convidar seu cerimonialista para colaborar.
          </Text>
          <Text style={[estilosPDF.ctaTexto, { fontWeight: 'bold', marginTop: 8 }]}>
            Acesse arxum.csstudios.site/descomplicai e comece agora.
          </Text>
        </View>
        <Rodape nome={nomeCasal} pagina={String(paginaAtual + secoesNormais.length + (secaoFornecedores ? 1 : 0) + (secaoOrcamento ? 1 : 0) + (secaoChecklist ? 1 : 0) + 1)} />
      </Page>
    </Document>
  );
}