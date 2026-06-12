// components/pdf/MemorialPDF.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { sugerirFontes } from '../../utils/sugestoes';
import path from 'path';
import fs from 'fs';

// ========== CONFIGURAÇÃO DE FONTES ==========
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
    try { Font.register({ family: fonte.nome, src: arquivo }); } catch (e) {}
  });
}

// ========== IMAGENS DE REFERÊNCIA ==========
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
  return dados?.paleta?.length ? dados.paleta : ['#8B6F5E', '#E5E0D9', '#F9F7F4'];
}
function isCorEscura(hex) {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}
function getCorContraste(hex) { return isCorEscura(hex) ? '#FFFFFF' : '#1A1714'; }
function getCorBorda(paleta) { return paleta.find(isCorEscura) || '#8B6F5E'; }
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
  const estado = dadosEvento?.estadoEvento || '';

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

  // ========== ESTILOS ==========
  const S = StyleSheet.create({
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
    paragrafo: { fontFamily: fonteCorpo, fontSize: 11, color: corTexto, lineHeight: 1.8, marginBottom: 8 },
    subtitulo: { fontFamily: fonteCorpo, fontSize: 14, fontWeight: 'bold', color: corPrimaria, marginTop: 12, marginBottom: 6 },
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
    barraContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 10 },
    barraLabel: { fontFamily: fonteCorpo, fontSize: 9, color: corTexto, width: 100 },
    barra: { height: 12, borderRadius: 4 },
    pizzaFatia: { width: 16, height: 16, borderRadius: 8, marginRight: 6 },
  });

  function Rodape({ nome, pagina }) {
    return (
      <View style={S.rodape} fixed>
        <Text style={S.rodapeTexto}>{nome}</Text>
        <Text style={S.rodapeTexto}>Gerado pelo descomplicaí · arxum.csstudios.site/descomplicai</Text>
        <Text style={S.rodapeTexto}>{pagina}</Text>
      </View>
    );
  }

  // Parse do memorial
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

  const secoesNormais = [];
  let secaoFornecedores = null;
  let secaoOrcamento = null;
  let secaoChecklist = null;
  let secaoLinhaTempo = null;

  secoes.forEach(s => {
    const t = s.titulo.toLowerCase();
    if (t.includes('fornecedor')) secaoFornecedores = s;
    else if (t.includes('orçamento') || t.includes('orcamento')) secaoOrcamento = s;
    else if (t.includes('checklist') || t.includes('decisões')) secaoChecklist = s;
    else if (t.includes('linha do tempo')) secaoLinhaTempo = s;
    else secoesNormais.push(s);
  });

  // ========== RENDERIZAÇÃO DO DOCUMENTO ==========
  return (
    <Document>
      {/* CAPA */}
      <Page size="A4" style={S.capa}>
        <View style={S.capaLinha} />
        <Text style={S.capaTitulo}>{nomeCasal}</Text>
        <Text style={S.capaSubtitulo}>Memorial do Casamento</Text>
        {cidade ? <Text style={S.capaLocal}>{cidade}{estado ? `, ${estado}` : ''}</Text> : null}
        <Text style={S.capaData}>{dataFormatada}</Text>
        <View style={[S.capaLinha, { marginTop: 36, marginBottom: 0 }]} />
        <View style={S.paletaContainer}>
          {paleta.map((cor, i) => (
            <View key={i} style={{ alignItems: 'center' }}>
              <View style={[S.corSwatch, { backgroundColor: cor }]} />
              <Text style={S.corLabel}>{cor}</Text>
            </View>
          ))}
        </View>
        <Rodape nome={nomeCasal} pagina="1" />
      </Page>

      {/* ÍNDICE E BOAS-VINDAS */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Bem-vindos ao seu memorial</Text>
        <Text style={S.paragrafo}>
          Este memorial foi criado exclusivamente para {nomeCasal} pelo Descomplicaí. Ele reúne todas as decisões, referências e orientações práticas para tornar o planejamento do seu casamento uma experiência leve e organizada.
        </Text>
        <Text style={[S.tituloSecao, { fontSize: 16, marginTop: 20 }]}>Índice</Text>
        {secoesNormais.map((s, i) => (
          <Text key={i} style={[S.paragrafo, { marginLeft: 20 }]}>{s.titulo} — pág. {2 + i}</Text>
        ))}
        <Rodape nome={nomeCasal} pagina="2" />
      </Page>

      {/* SEÇÕES NORMAIS */}
      {secoesNormais.map((secao, idx) => (
        <Page key={`normal-${idx}`} size="A4" style={S.pagina}>
          <Text style={S.tituloSecao}>{secao.titulo}</Text>
          {secao.linhas.map((linha, i) => {
            const texto = linha.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();
            if (!texto) return null;
            if (linha.startsWith('### ')) return <Text key={i} style={S.subtitulo}>{texto}</Text>;
            return <Text key={i} style={S.paragrafo}>{texto}</Text>;
          })}
          {secao.titulo.includes('Identidade Visual') && <Image style={S.imagem} src={imagemDecoracao} />}
          {secao.titulo.includes('Decoração') && <Image style={S.imagem} src={imagemFlores} />}
          {secao.titulo.includes('Mesa Posta') && <Image style={S.imagem} src={imagemMesa} />}
          {secao.titulo.includes('Vestuário') && <Image style={S.imagem} src={imagemVestido} />}
          <Rodape nome={nomeCasal} pagina={String(3 + idx)} />
        </Page>
      ))}

      {/* LINHA DO TEMPO VISUAL */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Linha do Tempo</Text>
        {[
          { meses: '12-8 meses', cor: '#4CAF50', tarefas: 'Definir data, local, estilo e lista de convidados. Contratar cerimonialista.' },
          { meses: '7-4 meses', cor: '#FFC107', tarefas: 'Fechar buffet, fotógrafo, DJ/banda. Provar vestido/traje.' },
          { meses: '3-1 meses', cor: '#FF9800', tarefas: 'Enviar convites, confirmar presenças, ajustar decoração.' },
          { meses: 'Última semana', cor: '#F44336', tarefas: 'Ensaio geral, confirmar fornecedores, relaxar.' },
        ].map((item, i) => (
          <View key={i} style={S.barraContainer}>
            <Text style={S.barraLabel}>{item.meses}</Text>
            <View style={[S.barra, { backgroundColor: item.cor, width: `${(4 - i) * 60}px` }]} />
            <Text style={[S.paragrafo, { flex: 1, marginLeft: 10 }]}>{item.tarefas}</Text>
          </View>
        ))}
        <Rodape nome={nomeCasal} pagina={String(3 + secoesNormais.length)} />
      </Page>

      {/* CHECKLIST */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Checklist de Decisões Pendentes</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinha}>
            <Text style={S.tabelaCelulaHeader}>Decisão</Text>
            <Text style={S.tabelaCelulaHeader}>Prazo</Text>
            <Text style={S.tabelaCelulaHeader}>✓</Text>
          </View>
          {(secaoChecklist?.linhas || [
            'Definir data do casamento (12 meses antes)',
            'Reservar local (10 meses antes)',
            'Contratar fotógrafo (8 meses antes)',
            'Provar vestido/traje (6 meses antes)',
            'Definir cardápio (4 meses antes)',
            'Enviar convites (3 meses antes)',
            'Prova de cabelo/maquiagem (2 meses antes)',
            'Confirmar presenças (1 mês antes)',
            'Ensaio geral (1 semana antes)',
          ]).map((linha, i) => {
            const texto = typeof linha === 'string' ? linha : linha.item || '';
            const match = texto.match(/(.*?)\s*\((\d+.*?)\)/);
            const item = match ? match[1].trim() : texto;
            const prazo = match ? match[2].trim() : '';
            return (
              <View key={i} style={S.tabelaLinha}>
                <Text style={S.tabelaCelula}>{item}</Text>
                <Text style={S.tabelaCelula}>{prazo}</Text>
                <Text style={S.tabelaCelula}>[ ]</Text>
              </View>
            );
          })}
        </View>
        <Rodape nome={nomeCasal} pagina={String(4 + secoesNormais.length)} />
      </Page>

      {/* FORNECEDORES */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Fornecedores Necessários</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinha}>
            <Text style={S.tabelaCelulaHeader}>Categoria</Text>
            <Text style={S.tabelaCelulaHeader}>Fornecedor</Text>
            <Text style={S.tabelaCelulaHeader}>Contato</Text>
            <Text style={S.tabelaCelulaHeader}>Status</Text>
          </View>
          {(secaoFornecedores?.linhas?.filter(l => l.trim().startsWith('* '))?.map(l => {
            const nome = l.replace(/^\*\s*/, '').replace(/\*\*/g, '').trim();
            return { categoria: '', nome };
          }) || [
            { categoria: 'Fotografia', nome: 'Fotógrafo' },
            { categoria: 'Buffet', nome: 'Buffet' },
            { categoria: 'Espaço', nome: 'Espaço / Venue' },
          ]).map((item, i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={S.tabelaCelula}>{item.categoria}</Text>
              <Text style={S.tabelaCelula}>{item.nome}</Text>
              <Text style={S.tabelaCelula}>________________</Text>
              <Text style={S.tabelaCelula}>A contratar</Text>
            </View>
          ))}
        </View>
        <Rodape nome={nomeCasal} pagina={String(5 + secoesNormais.length)} />
      </Page>

      {/* ORÇAMENTO */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Estimativa de Orçamento</Text>
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          {[
            { label: 'Espaço', pct: 20, cor: corPrimaria },
            { label: 'Buffet', pct: 30, cor: corSecundaria },
            { label: 'Decoração', pct: 15, cor: corTerciaria },
            { label: 'Fotografia', pct: 10, cor: corBorda },
            { label: 'Música', pct: 8, cor: '#888888' },
            { label: 'Vestuário', pct: 7, cor: '#AAAAAA' },
            { label: 'Outros', pct: 10, cor: '#CCCCCC' },
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
              <View style={[S.pizzaFatia, { backgroundColor: item.cor }]} />
              <Text style={{ fontFamily: fonteCorpo, fontSize: 9 }}>{item.label} {item.pct}%</Text>
            </View>
          ))}
        </View>
        <View style={S.tabela}>
          <View style={S.tabelaLinha}>
            <Text style={S.tabelaCelulaHeader}>Item</Text>
            <Text style={S.tabelaCelulaHeader}>%</Text>
            <Text style={S.tabelaCelulaHeader}>Valor Estimado</Text>
          </View>
          {[
            { item: 'Espaço e locação', percentual: 18, valor: 4500 },
            { item: 'Buffet e alimentação', percentual: 28, valor: 7000 },
            { item: 'Bebidas e bar', percentual: 10, valor: 2500 },
            { item: 'Decoração e flores', percentual: 15, valor: 3750 },
            { item: 'Fotografia e vídeo', percentual: 10, valor: 2500 },
            { item: 'Música e entretenimento', percentual: 8, valor: 2000 },
            { item: 'Vestuário e beleza', percentual: 6, valor: 1500 },
            { item: 'Papelaria e convites', percentual: 3, valor: 750 },
            { item: 'Transporte e logística', percentual: 2, valor: 500 },
          ].map((item, i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={S.tabelaCelula}>{item.item}</Text>
              <Text style={S.tabelaCelula}>{item.percentual}%</Text>
              <Text style={S.tabelaCelula}>R$ {item.valor.toLocaleString('pt-BR')}</Text>
            </View>
          ))}
        </View>
        <Rodape nome={nomeCasal} pagina={String(6 + secoesNormais.length)} />
      </Page>

      {/* CONTRACAPA */}
      <Page size="A4" style={S.pagina}>
        <View style={S.ctaContainer}>
          <Text style={S.ctaTitulo}>Seu casamento merece o melhor</Text>
          <Text style={S.ctaTexto}>
            Assine o Descomplicaí e faça a gestão total do seu casamento de forma inteligente e descomplicada. Você terá controle total de tudo — fornecedores, orçamento, convidados e cronograma — em um só lugar. E ainda pode convidar seu cerimonialista para colaborar.
          </Text>
          <Text style={[S.ctaTexto, { fontWeight: 'bold', marginTop: 8 }]}>
            Acesse arxum.csstudios.site/descomplicai e comece agora.
          </Text>
        </View>
        <Rodape nome={nomeCasal} pagina={String(7 + secoesNormais.length)} />
      </Page>
    </Document>
  );
}