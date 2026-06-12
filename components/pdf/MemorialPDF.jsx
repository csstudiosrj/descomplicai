// components/pdf/MemorialPDF.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { sugerirFontes } from '../../utils/sugestoes';

// ========== MAPEAMENTO DE IMAGENS DE REFERÊNCIA (URLs públicas) ==========
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
  if (IMAGENS[categoria] && IMAGENS[categoria][chave]) {
    return IMAGENS[categoria][chave];
  }
  return IMAGENS[categoria]?.default || null;
}

// ========== FUNÇÕES AUXILIARES ==========
function registrarFontes(estilo) {
  const fontes = sugerirFontes(estilo) || [];
  fontes.forEach((fonte) => {
    try {
      const fontMap = {
        'Cormorant Garamond': 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3YmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2',
        'Playfair Display': 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtY.woff2',
        'Montserrat': 'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXo.woff2',
        'Inter': 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
        'Lora': 'https://fonts.gstatic.com/s/lora/v26/0QIvMX1D_JOuMwr7Iw.woff2',
        'Great Vibes': 'https://fonts.gstatic.com/s/greatvibes/v15/RWmMoKWR9v4ksMfaWd_JN9XFiaQ.woff2',
        'Oswald': 'https://fonts.gstatic.com/s/oswald/v49/TK3_WkUHHAIjg75cFRf3bXL8LICs1xvsUhiZTaR.woff2',
        'Roboto': 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
        'Pacifico': 'https://fonts.gstatic.com/s/pacifico/v22/FwZY7-Qmy14u9lezJ-6H6Mw.woff2',
        'Nunito': 'https://fonts.gstatic.com/s/nunito/v25/XRXI3I6Li01BKofiOc5wtlZ2di8HDOIT.woff2',
        'Cinzel Decorative': 'https://fonts.gstatic.com/s/cinzeldecorative/v14/daaCSScvJGqLYhG8nNt8KPPswUAPni7TTMw.woff2',
        'Crimson Text': 'https://fonts.gstatic.com/s/crimsontext/v19/wlp2gwHKFkZgtmSR3NB0oRJfbwhT.woff2',
        'Josefin Sans': 'https://fonts.gstatic.com/s/josefinsans/v26/Qw3PZQNVED7rKGKxtqIqX5E-AVSJrOCfjY46_DjQbMlh.woff2',
        'EB Garamond': 'https://fonts.gstatic.com/s/ebgaramond/v27/SlGDmQSNjdsmc35JDF1K5E55YMjF_7DPuGi-6_RUAw.woff2',
        'Amatic SC': 'https://fonts.gstatic.com/s/amaticsc/v26/TUZyzwprpvBS1izr_vO0DQ.woff2',
        'Open Sans': 'https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVI.woff2',
        'DM Sans': 'https://fonts.gstatic.com/s/dmsans/v14/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2',
      };
      if (fontMap[fonte.nome]) {
        Font.register({ family: fonte.nome, src: fontMap[fonte.nome] });
      }
    } catch (e) {}
  });
}

function getPaleta(dados) {
  if (dados?.paleta && Array.isArray(dados.paleta) && dados.paleta.length > 0) {
    return dados.paleta;
  }
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

// ========== COMPONENTE ==========
export function MemorialPDF({ memorial, dadosEvento }) {
  if (dadosEvento?.estilo) registrarFontes(dadosEvento.estilo);

  const paleta = getPaleta(dadosEvento);
  const corPrimaria = paleta[0] || '#8B6F5E';
  const corSecundaria = paleta[1] || '#E5E0D9';
  const corTerciaria = paleta[2] || '#F9F7F4';
  const corBorda = getCorBorda(paleta);
  const corTexto = '#1A1714';
  const corTextoSuave = '#5C534A';

  const nome1 = capitalizarNome(dadosEvento?.nomePessoa1 || '');
  const nome2 = capitalizarNome(dadosEvento?.nomePessoa2 || '');
  const nomeCasal = nome1 && nome2 ? `${nome1} & ${nome2}` : 'Nosso Casamento';
  const dataFormatada = formatarData(dadosEvento?.dataEvento);
  const cidade = dadosEvento?.cidadeEvento || '';
  const estilo = dadosEvento?.estilo || 'classico';
  const fontesSugeridas = dadosEvento?.estilo ? sugerirFontes(dadosEvento.estilo) : [];
  const fonteDisplay = fontesSugeridas.find(f => f.uso === 'display')?.nome || 'Times-Roman';
  const fonteCorpo = fontesSugeridas.find(f => f.uso === 'corpo')?.nome || 'Helvetica';

  // Extrai lista de flores escolhidas
  const flores = dadosEvento?.flores || '';
  const imagemFlores = getImagem('flores', flores) || getImagem('flores', 'default');
  const imagemVestido = getImagem('vestido', dadosEvento?.estiloVestido) || getImagem('vestido', 'default');
  const imagemMesa = getImagem('mesaPosta', estilo) || getImagem('mesaPosta', 'default');
  const imagemDecoracao = getImagem('decoracao', estilo) || getImagem('decoracao', 'default');

  const estilos = StyleSheet.create({
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
    subtitulo: { fontFamily: fonteCorpo, fontSize: 14, fontWeight: 'bold', color: corPrimaria, marginTop: 12, marginBottom: 6 },
    paragrafo: { fontFamily: fonteCorpo, fontSize: 11, color: corTexto, lineHeight: 1.8, marginBottom: 8 },
    imagem: { width: 200, height: 150, alignSelf: 'center', marginVertical: 12, borderRadius: 4 },
    rodape: { position: 'absolute', bottom: 20, left: 50, right: 50, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: corSecundaria, paddingTop: 6 },
    rodapeTexto: { fontFamily: fonteCorpo, fontSize: 8, color: corTextoSuave },
  });

  function Rodape({ nome, pagina }) {
    return (
      <View style={estilos.rodape} fixed>
        <Text style={estilos.rodapeTexto}>{nome}</Text>
        <Text style={estilos.rodapeTexto}>gerado pelo descomplicaí · arxum.csstudios.site/descomplicai</Text>
        <Text style={estilos.rodapeTexto}>{pagina}</Text>
      </View>
    );
  }

  // Parse do conteúdo markdown
  const secoes = [];
  const linhas = (memorial || '').split('\n');
  let atual = null;
  for (const linha of linhas) {
    if (linha.startsWith('## ')) {
      if (atual) secoes.push(atual);
      atual = { titulo: linha.replace('## ', '').trim(), linhas: [] };
    } else if (atual) {
      atual.linhas.push(linha);
    }
  }
  if (atual) secoes.push(atual);

  return (
    <Document>
      {/* CAPA */}
      <Page size="A4" style={estilos.capa}>
        <View style={estilos.capaLinha} />
        <Text style={estilos.capaTitulo}>{nomeCasal}</Text>
        <Text style={estilos.capaSubtitulo}>Memorial do Casamento</Text>
        {cidade ? <Text style={estilos.capaLocal}>{cidade}</Text> : null}
        <Text style={estilos.capaData}>{dataFormatada}</Text>
        <View style={[estilos.capaLinha, { marginTop: 36, marginBottom: 0 }]} />
        <View style={estilos.paletaContainer}>
          {paleta.map((cor, i) => (
            <View key={i} style={{ alignItems: 'center' }}>
              <View style={[estilos.corSwatch, { backgroundColor: cor }]} />
              <Text style={{ fontSize: 8, fontFamily: fonteCorpo, color: corTextoSuave, marginTop: 4 }}>{cor}</Text>
            </View>
          ))}
        </View>
        <Rodape nome={nomeCasal} pagina="1" />
      </Page>

      {/* SEÇÕES */}
      {secoes.map((secao, idx) => (
        <Page key={idx} size="A4" style={estilos.pagina}>
          <Text style={estilos.tituloSecao}>{secao.titulo}</Text>
          {secao.linhas.map((l, i) => (
            <Text key={i} style={estilos.paragrafo}>{l.replace(/[*_]{1,2}/g, '').trim()}</Text>
          ))}
          {/* Imagens de referência específicas por seção */}
          {secao.titulo.includes('Identidade Visual') && (
            <Image style={estilos.imagem} src={imagemDecoracao} />
          )}
          {secao.titulo.includes('Decoração') && (
            <Image style={estilos.imagem} src={imagemFlores} />
          )}
          {secao.titulo.includes('Mesa Posta') && (
            <Image style={estilos.imagem} src={imagemMesa} />
          )}
          {secao.titulo.includes('Vestuário') && (
            <Image style={estilos.imagem} src={imagemVestido} />
          )}
          <Rodape nome={nomeCasal} pagina={`${idx + 2}`} />
        </Page>
      ))}

      {/* Páginas adicionais: Fornecedores, Orçamento, etc. (a serem detalhadas futuramente) */}
    </Document>
  );
}