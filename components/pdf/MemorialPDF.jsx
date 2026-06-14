// components/pdf/MemorialPDF.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image, Svg, Path, G } from '@react-pdf/renderer';
import {
  capitalizarNome, formatarData, getPaleta, isCorEscura, getCorContraste,
  getCorBorda, getCorTitulo, getNomeCor, getDicasRegionais, getItensOrcamento,
  parsearMemorial, extrairChecklist, extrairFornecedores, getImagem,
} from '../../utils/pdfUtils';
import { sugerirFontes } from '../../utils/sugestoes';

function Rodape({ nomeCasal }) {
  return (
    <View
      style={{ position: 'absolute', bottom: 20, left: 50, right: 50, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: '#C8BFB4', paddingTop: 6 }}
      fixed
      render={({ pageNumber, totalPages }) => (
        <>
          <Text style={{ fontSize: 8, color: '#5C534A', fontFamily: 'Helvetica', wrap: true }}>{nomeCasal}</Text>
          <Text style={{ fontSize: 8, color: '#5C534A', fontFamily: 'Helvetica', wrap: true }}>gerado pelo descomplicaí · arxum.csstudios.site/descomplicai</Text>
          <Text style={{ fontSize: 8, color: '#5C534A', fontFamily: 'Helvetica', wrap: true }}>{pageNumber} / {totalPages}</Text>
        </>
      )}
    />
  );
}

function PizzaChart({ data, colors, size = 140 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 10;
  const total = data.reduce((s, d) => s + d.percentual, 0);
  let startAngle = 0;
  const paths = [];
  data.forEach((item, i) => {
    const angle = (item.percentual / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    paths.push(<Path key={i} d={d} fill={colors[i % colors.length]} stroke="#FFFFFF" strokeWidth={2} />);
    startAngle = endAngle;
  });
  return <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><G>{paths}</G></Svg>;
}

function ImagemEditorial({ src, dimensoes, maxWidth = 240, maxHeight = 500 }) {
  let width = maxWidth;
  let height = maxHeight;
  if (dimensoes && dimensoes.width && dimensoes.height) {
    const ratio = Math.min(maxWidth / dimensoes.width, maxHeight / dimensoes.height);
    width = Math.round(dimensoes.width * ratio);
    height = Math.round(dimensoes.height * ratio);
  }
  return (
    <Image
      src={src}
      style={{ width, height, borderRadius: 4 }}
    />
  );
}

function SecaoEditorial({ titulo, secao, imagemSrc, dimensoes, fonteCorpo, fonteDisplay, corTexto, corTitulo, corSecundaria, nomeCasal, estilo }) {
  const isVertical = dimensoes && dimensoes.height > dimensoes.width;
  
  return (
    <Page size="A4" style={{ backgroundColor: '#FFFFFF', padding: 50, paddingBottom: 70 }}>
      <Text style={{ fontFamily: fonteDisplay, fontSize: 22, color: corTitulo, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: corSecundaria, paddingBottom: 10, wrap: true }}>
        {titulo}
      </Text>
      
      <View style={{ flexDirection: isVertical ? 'row' : 'column', gap: 20 }}>
        {/* Coluna de texto */}
        <View style={{ flex: isVertical ? 1.2 : 1 }}>
          {secao?.linhas?.length > 0 ? (
            secao.linhas.map((linha, i) => {
              const texto = linha.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();
              if (!texto) return null;
              if (linha.startsWith('### ')) {
                return <Text key={i} style={{ fontFamily: fonteDisplay, fontSize: 12, color: corTitulo, marginTop: 10, marginBottom: 5, wrap: true }}>{texto}</Text>;
              }
              if (linha.startsWith('- ') || linha.startsWith('* ')) {
                return <Text key={i} style={{ fontFamily: fonteCorpo, fontSize: 10, color: corTexto, lineHeight: 1.6, marginBottom: 3, marginLeft: 10, wrap: true }}>• {texto}</Text>;
              }
              return <Text key={i} style={{ fontFamily: fonteCorpo, fontSize: 10, color: corTexto, lineHeight: 1.6, marginBottom: 6, wrap: true }}>{texto}</Text>;
            }).filter(Boolean)
          ) : (
            <Text style={{ fontFamily: fonteCorpo, fontSize: 10, color: corTexto, lineHeight: 1.6, wrap: true }}>
              Conteúdo da seção {titulo} para {nomeCasal}. Estilo {estilo}.
            </Text>
          )}
        </View>

        {/* Coluna de imagem */}
        {imagemSrc && (
          <View style={{ 
            flex: isVertical ? 0.8 : 1, 
            alignItems: 'center', 
            justifyContent: 'flex-start',
            marginTop: isVertical ? 0 : 16 
          }}>
            <ImagemEditorial 
              src={imagemSrc} 
              dimensoes={dimensoes} 
              maxWidth={isVertical ? 220 : 440} 
              maxHeight={isVertical ? 520 : 260} 
            />
          </View>
        )}
      </View>
      <Rodape nomeCasal={nomeCasal} />
    </Page>
  );
}

export function MemorialPDF({ memorial, dadosEvento, usarFontesNativas = false, qrCodeDataUri = null, dimensoesImagens = {} }) {
  const estilo = dadosEvento?.estilo || 'classico';
  const paleta = getPaleta(dadosEvento);
  const corPrimaria = paleta[0];
  const corSecundaria = paleta[1];
  const corTerciaria = paleta[2];
  const corBorda = getCorBorda(paleta);
  const corTexto = '#1A1714';
  const corTextoSuave = '#5C534A';
  const corTitulo = getCorTitulo(corPrimaria, corBorda);

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

  const secoes = parsearMemorial(memorial);
  const secoesNormais = secoes.filter(s => {
    const t = s.titulo.toLowerCase();
    return !t.includes('fornecedor') && !t.includes('orçamento') && !t.includes('orcamento') && !t.includes('checklist') && !t.includes('decisões') && !t.includes('decisoes') && !t.includes('linha do tempo');
  });

  const checklist = extrairChecklist(secoes);
  const fornecedores = extrairFornecedores(secoes);
  const itensOrcamento = getItensOrcamento(cidade, estado);
  const dicasRegionais = getDicasRegionais(cidade, estado);

  const flores = dadosEvento?.flores || '';
  const imagemFlores = getImagem('flores', flores) || getImagem('flores', 'default');
  const imagemVestido = getImagem('vestido', dadosEvento?.estiloVestido) || getImagem('vestido', 'default');
  const imagemMesa = getImagem('mesaPosta', estilo) || getImagem('mesaPosta', 'default');
  const imagemDecoracao = getImagem('decoracao', estilo) || getImagem('decoracao', 'default');
  const imagemCerimonia = getImagem('cerimonia', estilo) || getImagem('cerimonia', 'default');
  const imagemAlimentacao = getImagem('alimentacao', estilo) || getImagem('alimentacao', 'default');
  const imagemEntretenimento = getImagem('entretenimento', estilo) || getImagem('entretenimento', 'default');
  const imagemLocal = getImagem('local', estilo) || getImagem('local', 'default');
  const imagemPapelaria = getImagem('papelaria', estilo) || getImagem('papelaria', 'default');

  const S = StyleSheet.create({
    capa: { backgroundColor: corTerciaria, height: '100%', alignItems: 'center', justifyContent: 'center', padding: 60 },
    capaLinha: { width: 60, height: 1.5, backgroundColor: getCorContraste(corTerciaria), marginBottom: 28 },
    capaTitulo: { fontFamily: fonteDisplay, fontSize: 40, color: getCorContraste(corTerciaria), textAlign: 'center', marginBottom: 16, wrap: true },
    capaSubtitulo: { fontFamily: fonteCorpo, fontSize: 14, color: getCorContraste(corTerciaria), textAlign: 'center', marginBottom: 10, letterSpacing: 2, wrap: true },
    capaData: { fontFamily: fonteCorpo, fontSize: 13, color: getCorContraste(corTerciaria), textAlign: 'center', marginTop: 12, wrap: true },
    capaLocal: { fontFamily: fonteCorpo, fontSize: 12, color: getCorContraste(corTerciaria), textAlign: 'center', marginTop: 6, wrap: true },
    paletaContainer: { flexDirection: 'row', marginTop: 36, alignItems: 'center', justifyContent: 'center' },
    pagina: { backgroundColor: '#FFFFFF', padding: 50, paddingBottom: 70 },
    tituloSecao: { fontFamily: fonteDisplay, fontSize: 22, color: corTitulo, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: corSecundaria, paddingBottom: 10, wrap: true },
    tituloSecaoPequeno: { fontFamily: fonteDisplay, fontSize: 16, color: corTitulo, marginBottom: 12, marginTop: 14, wrap: true },
    paragrafo: { fontFamily: fonteCorpo, fontSize: 10, color: corTexto, lineHeight: 1.6, marginBottom: 6, wrap: true },
    subtitulo: { fontFamily: fonteCorpo, fontSize: 11, color: corTitulo, marginTop: 10, marginBottom: 5, wrap: true },
    tabela: { marginTop: 6, marginBottom: 6 },
    tabelaLinha: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#E5E0D9', paddingVertical: 4, alignItems: 'center' },
    tabelaLinhaHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: corTitulo, paddingVertical: 5, backgroundColor: corSecundaria + '18', alignItems: 'center' },
    tabelaCelula: { fontFamily: fonteCorpo, fontSize: 9, color: corTexto, flex: 1, paddingRight: 4, wrap: true },
    tabelaCelulaHeader: { fontFamily: fonteCorpo, fontSize: 9, color: corTitulo, flex: 1, paddingRight: 4, wrap: true },
    boxInfo: { backgroundColor: corSecundaria + '12', borderRadius: 4, padding: 10, marginVertical: 6, borderLeftWidth: 2, borderLeftColor: corTitulo },
    boxInfoTexto: { fontFamily: fonteCorpo, fontSize: 9.5, color: corTexto, lineHeight: 1.6, wrap: true },
    twoColumn: { flexDirection: 'row', gap: 16 },
    column: { flex: 1 },
    ctaContainer: { alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40 },
    ctaTitulo: { fontFamily: fonteDisplay, fontSize: 24, color: corTitulo, textAlign: 'center', marginBottom: 20, wrap: true },
    ctaTexto: { fontFamily: fonteCorpo, fontSize: 11, color: corTexto, textAlign: 'center', lineHeight: 1.7, marginBottom: 14, wrap: true },
    ctaUrl: { fontFamily: fonteCorpo, fontSize: 12, color: corTitulo, textAlign: 'center', marginTop: 8, wrap: true },
    quote: { fontFamily: fonteDisplay, fontSize: 13, color: corTitulo, fontStyle: 'italic', textAlign: 'center', marginVertical: 14, paddingHorizontal: 20, wrap: true },
  });

  // Cores contrastantes para o gráfico de pizza — NADA de tons de marrom iguais
  const CORES_PIZZA = ['#2E7D32', '#1565C0', '#C62828', '#F9A825', '#6A1B9A', '#E65100', '#00838F', '#AD1457', '#5D4037', '#455A64', '#827717', '#D84315'];

  return (
    <Document>
      {/* CAPA */}
      <Page size="A4" style={S.capa}>
        <View style={S.capaLinha} />
        <Text style={S.capaTitulo}>{nomeCasal}</Text>
        <Text style={S.capaSubtitulo}>M E M O R I A L   D O   C A S A M E N T O</Text>
        <Text style={S.capaLocal}>{localCompleto}</Text>
        <Text style={S.capaData}>{dataFormatada}</Text>
        <View style={[S.capaLinha, { marginTop: 36, marginBottom: 0 }]} />
        <View style={S.paletaContainer}>
          {paleta.map((cor, i) => (
            <View key={i} style={{ alignItems: 'center', marginHorizontal: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: cor, borderWidth: 3, borderColor: isCorEscura(cor) ? '#FFFFFF' : '#1A1714' }} />
              <Text style={{ fontSize: 9, fontFamily: fonteCorpo, color: corTexto, marginTop: 5, textAlign: 'center', wrap: true }}>{getNomeCor(cor)}</Text>
              <Text style={{ fontSize: 8, fontFamily: fonteCorpo, color: corTextoSuave, marginTop: 1, textAlign: 'center', wrap: true }}>{cor}</Text>
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* ÍNDICE */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Bem-vindos ao seu Memorial</Text>
        <Text style={S.paragrafo}>Este memorial foi criado exclusivamente para {nomeCasal} pelo descomplicaí. Ele reúne todas as decisões, referências visuais e orientações práticas para tornar o planejamento do seu casamento uma experiência leve, organizada e inesquecível.</Text>
        <Text style={S.paragrafo}>Cada seção deste documento reflete as escolhas que você fez ao longo do questionário. Use-o como guia de consulta, apresente-o aos seus fornecedores e compartilhe com quem está ao seu lado nessa jornada.</Text>
        
        <Text style={[S.tituloSecao, { fontSize: 16, marginTop: 20 }]}>Índice</Text>
        <View style={S.tabela}>
          {[
            ['Identidade Visual', '3'], ['Cerimônia', '4'], ['Decoração', '5'], ['Mesa Posta', '6'],
            ['Alimentação e Bebidas', '7'], ['Entretenimento', '8'], ['Vestuário e Beleza', '9'],
            ['Papelaria e Identidade', '10'], ['Linha do Tempo Visual', '11'], ['Checklist de Decisões', '13'],
            ['Fornecedores', '15'], ['Orçamento Detalhado', '17'], ['Dicas Regionais', '19'],
          ].map(([secao, pag], i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { flex: 3 }]}>{secao}</Text>
              <Text style={[S.tabelaCelula, { width: 50, textAlign: 'right' }]}>{pag}</Text>
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* IDENTIDADE VISUAL */}
      <SecaoEditorial
        titulo="Identidade Visual"
        secao={secoesNormais.find(s => s.titulo.toLowerCase().includes('identidade') || s.titulo.toLowerCase().includes('visual'))}
        imagemSrc={imagemDecoracao}
        dimensoes={dimensoesImagens?.imagemDecoracao}
        fonteCorpo={fonteCorpo}
        fonteDisplay={fonteDisplay}
        corTexto={corTexto}
        corTitulo={corTitulo}
        corSecundaria={corSecundaria}
        nomeCasal={nomeCasal}
        estilo={estilo}
      />

      {/* IDENTIDADE VISUAL — DETALHES */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Identidade Visual — Detalhes</Text>
        <View style={{ flexDirection: 'row', marginBottom: 14, gap: 12 }}>
          {paleta.map((cor, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: cor, borderWidth: 3, borderColor: isCorEscura(cor) ? '#FFFFFF' : '#1A1714', marginBottom: 4 }} />
              <Text style={{ fontFamily: fonteCorpo, fontSize: 9, color: corTexto, textAlign: 'center', wrap: true }}>{getNomeCor(cor)}</Text>
              <Text style={{ fontFamily: fonteCorpo, fontSize: 8, color: corTextoSuave, textAlign: 'center', wrap: true }}>{cor}</Text>
              <Text style={{ fontFamily: fonteCorpo, fontSize: 7, color: corTextoSuave, textAlign: 'center', marginTop: 1, wrap: true }}>{i === 0 ? 'Principal' : i === 1 ? 'Secundária' : 'Terciária'}</Text>
            </View>
          ))}
        </View>
        <Text style={S.subtitulo}>Fontes Sugeridas</Text>
        <View style={S.boxInfo}>
          <Text style={S.boxInfoTexto}>Display (títulos): {fonteDisplay}</Text>
          <Text style={S.boxInfoTexto}>Corpo (textos): {fonteCorpo}</Text>
          <Text style={S.boxInfoTexto}>Escolhidas para harmonizar com o estilo {estilo}.</Text>
        </View>
        <Text style={S.subtitulo}>Materiais Recomendados</Text>
        <View style={S.boxInfo}>
          <Text style={S.boxInfoTexto}>• Papel: Couchê fosco ou texturizado natural</Text>
          <Text style={S.boxInfoTexto}>• Acabamentos: Hot stamping, relevo seco ou corte laser</Text>
          <Text style={S.boxInfoTexto}>• Tecidos: Linho, algodão orgânico ou seda</Text>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* CERIMÔNIA */}
      <SecaoEditorial
        titulo="Cerimônia"
        secao={secoesNormais.find(s => s.titulo.toLowerCase().includes('cerimonia'))}
        imagemSrc={imagemCerimonia}
        dimensoes={dimensoesImagens?.imagemCerimonia}
        fonteCorpo={fonteCorpo}
        fonteDisplay={fonteDisplay}
        corTexto={corTexto}
        corTitulo={corTitulo}
        corSecundaria={corSecundaria}
        nomeCasal={nomeCasal}
        estilo={estilo}
      />

      {/* CERIMÔNIA — DETALHES */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Cerimônia — Roteiro e Músicas</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 70 }]}>Momento</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Descrição</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 60 }]}>Duração</Text>
          </View>
          {[
            ['Entrada da noiva', 'Marcha nupcial com acompanhamento dos pais', '~3 min'],
            ['Recepção', 'Saudação e boas-vindas aos convidados', '~2 min'],
            ['Leituras', 'Textos escolhidos pelo casal', '~5 min'],
            ['Votos', `Promessas pessoais de ${nome1} e ${nome2}`, '~5 min'],
            ['Alianças', 'Troca simbólica com bênção', '~2 min'],
            ['Declaração', 'Oficialização e primeiro beijo', '~1 min'],
            ['Saída', 'Marcha com confetes ou pétalas', '~3 min'],
          ].map(([m, d, t], i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 70 }]}>{m}</Text>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{d}</Text>
              <Text style={[S.tabelaCelula, { width: 60 }]}>{t}</Text>
            </View>
          ))}
        </View>
        <Text style={S.subtitulo}>Sugestões de Músicas</Text>
        <View style={S.boxInfo}>
          <Text style={S.boxInfoTexto}>• Entrada: Canon in D (Pachelbel) ou A Thousand Years (Christina Perri)</Text>
          <Text style={S.boxInfoTexto}>• Cerimônia: instrumental suave conforme estilo {estilo}</Text>
          <Text style={S.boxInfoTexto}>• Saída: Signed, Sealed, Delivered (Stevie Wonder)</Text>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* DECORAÇÃO */}
      <SecaoEditorial
        titulo="Decoração"
        secao={secoesNormais.find(s => s.titulo.toLowerCase().includes('decoração') || s.titulo.toLowerCase().includes('decoracao'))}
        imagemSrc={imagemFlores}
        dimensoes={dimensoesImagens?.imagemFlores}
        fonteCorpo={fonteCorpo}
        fonteDisplay={fonteDisplay}
        corTexto={corTexto}
        corTitulo={corTitulo}
        corSecundaria={corSecundaria}
        nomeCasal={nomeCasal}
        estilo={estilo}
      />

      {/* DECORAÇÃO — DETALHES */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Decoração — Flores e Iluminação</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 90 }]}>Local</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Sugestão Floral</Text>
          </View>
          {[
            ['Altar', 'Arranjo principal com flores escolhidas'],
            ['Corredor', 'Flores ao longo do caminho'],
            ['Entrada', 'Guirlanda ou arco floral'],
            ['Mesas', 'Centros de mesa variados'],
            ['Mesa do bolo', 'Arranjo especial com flores decorativas'],
            ['Lounge', 'Vasos suspensos ou arranjos em garrafas'],
          ].map(([l, s], i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 90 }]}>{l}</Text>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{s}</Text>
            </View>
          ))}
        </View>
        <Text style={S.subtitulo}>Iluminação e Velas</Text>
        <View style={S.twoColumn}>
          <View style={S.column}>
            <Text style={S.paragrafo}>Combine luzes quentes com velas estrategicamente posicionadas para criar pontos de interesse.</Text>
            <View style={S.boxInfo}>
              <Text style={S.boxInfoTexto}>• Lustres ou spots quentes</Text>
              <Text style={S.boxInfoTexto}>• Velas em castiçais ao longo das mesas</Text>
              <Text style={S.boxInfoTexto}>• Fairy lights em áreas externas</Text>
            </View>
          </View>
          <View style={S.column}>
            <Text style={S.paragrafo}>Mobiliário conforme estilo {estilo}:</Text>
            <View style={S.boxInfo}>
              <Text style={S.boxInfoTexto}>• Cadeiras conforme sugestão do estilo</Text>
              <Text style={S.boxInfoTexto}>• Mesas redondas ou retangulares</Text>
              <Text style={S.boxInfoTexto}>• Áreas de descanso com sofás</Text>
            </View>
          </View>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* MESA POSTA */}
      <SecaoEditorial
        titulo="Mesa Posta"
        secao={secoesNormais.find(s => s.titulo.toLowerCase().includes('mesa'))}
        imagemSrc={imagemMesa}
        dimensoes={dimensoesImagens?.imagemMesa}
        fonteCorpo={fonteCorpo}
        fonteDisplay={fonteDisplay}
        corTexto={corTexto}
        corTitulo={corTitulo}
        corSecundaria={corSecundaria}
        nomeCasal={nomeCasal}
        estilo={estilo}
      />

      {/* MESA POSTA — DETALHES */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Mesa Posta — Especificações</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 100 }]}>Elemento</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Sugestão</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 70 }]}>Cor/Tom</Text>
          </View>
          {[
            ['Toalha', 'Material conforme identidade visual', paleta[1]],
            ['Louças', 'Porcelana ou cerâmica', 'Branco'],
            ['Talheres', 'Prata, dourado ou cobre', paleta[0]],
            ['Taças', 'Cristal ou vidro colorido', 'Transparente'],
            ['Centro de mesa', 'Arranjo floral', paleta[0]],
            ['Guardanapo', 'Linho ou algodão', paleta[1]],
            ['Cartão de lugar', 'Papelaria personalizada', paleta[0]],
            ['Menu', 'Papel texturizado', paleta[2]],
          ].map(([e, s, c], i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 100 }]}>{e}</Text>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{s}</Text>
              <Text style={[S.tabelaCelula, { width: 70 }]}>{c}</Text>
            </View>
          ))}
        </View>
        <Text style={S.subtitulo}>Dicas de Montagem</Text>
        <View style={S.boxInfo}>
          <Text style={S.boxInfoTexto}>1. Toalha é a base da composição visual.</Text>
          <Text style={S.boxInfoTexto}>2. Distribua talheres na ordem de uso.</Text>
          <Text style={S.boxInfoTexto}>3. Centro de mesa não deve impedir conversação.</Text>
          <Text style={S.boxInfoTexto}>4. Cartão e menu alinhados com o prato.</Text>
          <Text style={S.boxInfoTexto}>5. Toque pessoal: flor solta ou bilhete.</Text>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* ALIMENTAÇÃO */}
      <SecaoEditorial
        titulo="Alimentação e Bebidas"
        secao={secoesNormais.find(s => s.titulo.toLowerCase().includes('alimentação') || s.titulo.toLowerCase().includes('alimentacao') || s.titulo.toLowerCase().includes('bebidas'))}
        imagemSrc={imagemAlimentacao}
        dimensoes={dimensoesImagens?.imagemAlimentacao}
        fonteCorpo={fonteCorpo}
        fonteDisplay={fonteDisplay}
        corTexto={corTexto}
        corTitulo={corTitulo}
        corSecundaria={corSecundaria}
        nomeCasal={nomeCasal}
        estilo={estilo}
      />

      {/* ALIMENTAÇÃO — DETALHES */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Alimentação e Bebidas — Detalhes</Text>
        <View style={S.twoColumn}>
          <View style={S.column}>
            <Text style={S.subtitulo}>Coquetel de Boas-Vindas</Text>
            <Text style={S.paragrafo}>Drinks que dialoguem com o estilo {estilo}.</Text>
            <View style={S.boxInfo}>
              <Text style={S.boxInfoTexto}>• Drink assinatura do casal</Text>
              <Text style={S.boxInfoTexto}>• Águas aromatizadas e sucos</Text>
              <Text style={S.boxInfoTexto}>• Petiscos e canapés variados</Text>
            </View>
            <Text style={S.subtitulo}>Jantar / Almoço</Text>
            <Text style={S.paragrafo}>Cardápio elaborado conforme restrições. Degustação 4 meses antes.</Text>
          </View>
          <View style={S.column}>
            <Text style={S.subtitulo}>Bolo e Doces</Text>
            <Text style={S.paragrafo}>Momento mais fotografado. Escolha sabores que representem o casal.</Text>
            <View style={S.boxInfo}>
              <Text style={S.boxInfoTexto}>• Bolo principal: estilo {estilo}</Text>
              <Text style={S.boxInfoTexto}>• Mesa de doces: brigadeiros, macarons, bem-casados</Text>
              <Text style={S.boxInfoTexto}>• Bem-casados: embalagem personalizada</Text>
            </View>
            <Text style={S.subtitulo}>Bar e Bebidas</Text>
            <Text style={S.paragrafo}>Bar completo com cervejas artesanais e vinhos.</Text>
          </View>
        </View>
        <Text style={S.subtitulo}>Restrições Alimentares</Text>
        <Text style={S.paragrafo}>Verifique com antecedência: vegetarianos, veganos, intolerantes, alergias. Prepare opções alternativas.</Text>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* ENTRETENIMENTO */}
      <SecaoEditorial
        titulo="Entretenimento"
        secao={secoesNormais.find(s => s.titulo.toLowerCase().includes('entretenimento') || s.titulo.toLowerCase().includes('festa') || s.titulo.toLowerCase().includes('música'))}
        imagemSrc={imagemEntretenimento}
        dimensoes={dimensoesImagens?.imagemEntretenimento}
        fonteCorpo={fonteCorpo}
        fonteDisplay={fonteDisplay}
        corTexto={corTexto}
        corTitulo={corTitulo}
        corSecundaria={corSecundaria}
        nomeCasal={nomeCasal}
        estilo={estilo}
      />

      {/* ENTRETENIMENTO — DETALHES */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Entretenimento — Cronograma</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 70 }]}>Horário</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Atividade</Text>
          </View>
          {[
            ['18:00', 'Cerimônia'], ['19:00', 'Coquetel'], ['20:00', 'Jantar'],
            ['21:30', 'Discursos e brindes'], ['22:00', 'Corte do bolo'], ['22:30', 'Primeira dança'],
            ['23:00', 'Pista de dança'], ['00:00', 'Bem-casados'], ['01:00', 'Despedida'],
          ].map(([h, a], i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 70 }]}>{h}</Text>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{a}</Text>
            </View>
          ))}
        </View>
        <Text style={S.subtitulo}>Atividades Interativas</Text>
        <Text style={S.paragrafo}>Cabine de fotos, bar de cigarros, food truck, fogos de artifício (se permitido), lanternas sky lanterns.</Text>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* VESTUÁRIO */}
      <SecaoEditorial
        titulo="Vestuário e Beleza"
        secao={secoesNormais.find(s => s.titulo.toLowerCase().includes('vestuário') || s.titulo.toLowerCase().includes('vestuario') || s.titulo.toLowerCase().includes('beleza'))}
        imagemSrc={imagemVestido}
        dimensoes={dimensoesImagens?.imagemVestido}
        fonteCorpo={fonteCorpo}
        fonteDisplay={fonteDisplay}
        corTexto={corTexto}
        corTitulo={corTitulo}
        corSecundaria={corSecundaria}
        nomeCasal={nomeCasal}
        estilo={estilo}
      />

      {/* VESTUÁRIO — DETALHES */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Vestuário e Beleza — Detalhes</Text>
        <View style={S.twoColumn}>
          <View style={S.column}>
            <Text style={S.subtitulo}>Traje da Noiva</Text>
            <Text style={S.paragrafo}>Prova 6 meses antes, ajustes 2 semanas antes.</Text>
            <View style={S.boxInfo}>
              <Text style={S.boxInfoTexto}>• Acessórios: véu, grinalda, joias</Text>
              <Text style={S.boxInfoTexto}>• Sapatos: conforto é essencial</Text>
              <Text style={S.boxInfoTexto}>• Lingerie: peça especial</Text>
            </View>
            <Text style={S.subtitulo}>Traje do Noivo</Text>
            <Text style={S.paragrafo}>Terno, smoking ou traje conforme estilo e horário.</Text>
          </View>
          <View style={S.column}>
            <Text style={S.subtitulo}>Maquiagem e Cabelo</Text>
            <Text style={S.paragrafo}>Prova 2 meses antes. Visual deve durar 12+ horas.</Text>
            <View style={S.boxInfo}>
              <Text style={S.boxInfoTexto}>• Maquiagem à prova d'água</Text>
              <Text style={S.boxInfoTexto}>• Cabelo: teste de penteado</Text>
              <Text style={S.boxInfoTexto}>• Manicure e pedicure: 2 dias antes</Text>
            </View>
            <Text style={S.subtitulo}>Madrinhas e Padrinhos</Text>
            <Text style={S.paragrafo}>Defina uma cor que dialogue com a paleta. Coesão visual é mais importante que uniformidade.</Text>
          </View>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* PAPELARIA */}
      <SecaoEditorial
        titulo="Papelaria e Identidade"
        secao={secoesNormais.find(s => s.titulo.toLowerCase().includes('papelaria') || s.titulo.toLowerCase().includes('identidade') || s.titulo.toLowerCase().includes('convite'))}
        imagemSrc={imagemPapelaria}
        dimensoes={dimensoesImagens?.imagemPapelaria}
        fonteCorpo={fonteCorpo}
        fonteDisplay={fonteDisplay}
        corTexto={corTexto}
        corTitulo={corTitulo}
        corSecundaria={corSecundaria}
        nomeCasal={nomeCasal}
        estilo={estilo}
      />

      {/* PAPELARIA — DETALHES */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Papelaria e Identidade — Itens</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 100 }]}>Item</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Descrição</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 70 }]}>Prazo</Text>
          </View>
          {[
            ['Save the Date', 'Anúncio inicial da data', '10-12 meses'],
            ['Convite', 'Cartão formal com informações', '3-4 meses'],
            ['Site do casamento', 'Página digital com lista de presentes', '6 meses'],
            ['Menu', 'Impresso individual ou quadro', '1 mês'],
            ['Cartão de lugar', 'Identificação do convidado', '1 mês'],
            ['Sinalização', 'Placas de boas-vindas', '2 semanas'],
            ['Monograma', 'Símbolo personalizado', '6 meses'],
            ['Lembrancinha', 'Presente de agradecimento', '2 meses'],
          ].map(([i, d, p], idx) => (
            <View key={idx} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 100 }]}>{i}</Text>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{d}</Text>
              <Text style={[S.tabelaCelula, { width: 70 }]}>{p}</Text>
            </View>
          ))}
        </View>
        <Text style={S.subtitulo}>Monograma do Casal</Text>
        <Text style={S.paragrafo}>O monograma une as iniciais de {nome1} e {nome2}. Use-o em convites, selos, taças, bolo e materiais impressos.</Text>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* LINHA DO TEMPO VISUAL */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Linha do Tempo Visual</Text>
        <Text style={S.paragrafo}>O planejamento de um casamento exige organização. Esta linha do tempo divide as tarefas por período.</Text>
        <View style={{ marginTop: 14, marginBottom: 16 }}>
          {[
            { meses: '12-8 meses antes', cor: '#4CAF50', tarefas: ['Definir data e reservar local', 'Contratar cerimonialista', 'Iniciar lista de convidados', 'Definir estilo e paleta'] },
            { meses: '7-4 meses antes', cor: '#FFC107', tarefas: ['Fechar buffet e bebidas', 'Contratar fotógrafo e vídeo', 'Provar vestido e traje', 'Definir decoração e flores'] },
            { meses: '3-1 meses antes', cor: '#FF9800', tarefas: ['Enviar convites', 'Confirmar presenças', 'Ajustar detalhes decorativos', 'Prova de cabelo e maquiagem'] },
            { meses: 'Última semana', cor: '#F44336', tarefas: ['Ensaio geral', 'Confirmar fornecedores', 'Separar itens do dia', 'Descansar e se hidratar'] },
          ].map((item, i) => (
            <View key={i} style={{ marginBottom: 16, flexDirection: 'row' }}>
              <View style={{ width: 12, alignItems: 'center', marginRight: 10 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.cor, marginTop: 2 }} />
                {i < 3 && <View style={{ width: 2, flex: 1, backgroundColor: '#E5E0D9', marginTop: 4 }} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonteDisplay, fontSize: 11, color: corTitulo, marginBottom: 3, wrap: true }}>{item.meses}</Text>
                {item.tarefas.map((t, j) => (
                  <Text key={j} style={{ fontFamily: fonteCorpo, fontSize: 9, color: corTexto, lineHeight: 1.5, marginBottom: 1, wrap: true }}>• {t}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
        <Text style={S.subtitulo}>Legenda de Urgência</Text>
        <View style={{ flexDirection: 'row', marginTop: 6, flexWrap: 'wrap' }}>
          {[
            { cor: '#4CAF50', label: 'Tranquilo (12-8 meses)' },
            { cor: '#FFC107', label: 'Atenção (7-4 meses)' },
            { cor: '#FF9800', label: 'Urgente (3-1 meses)' },
            { cor: '#F44336', label: 'Crítico (última semana)' },
          ].map((l, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 4 }}>
              <View style={{ width: 12, height: 12, backgroundColor: l.cor, borderRadius: 2, marginRight: 5 }} />
              <Text style={{ fontFamily: fonteCorpo, fontSize: 8, color: corTexto, wrap: true }}>{l.label}</Text>
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* LINHA DO TEMPO — CALENDÁRIO */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Linha do Tempo — Calendário Mensal</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 50 }]}>Mês</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Tarefas Prioritárias</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 50 }]}>Status</Text>
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
          ].map(([m, t, s], i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 50 }]}>{m}</Text>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{t}</Text>
              <Text style={[S.tabelaCelula, { width: 50 }]}>[ ]</Text>
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* CHECKLIST */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Checklist de Decisões Pendentes</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Decisão Pendente</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 90 }]}>Prazo</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 30 }]}>✓</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 1.5 }]}>Anotações</Text>
          </View>
          {checklist.slice(0, 12).map((item, i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{item.item}</Text>
              <Text style={[S.tabelaCelula, { width: 90 }]}>{item.prazo}</Text>
              <Text style={[S.tabelaCelula, { width: 30, textAlign: 'center' }]}>[ ]</Text>
              <View style={[S.tabelaCelula, { flex: 1.5, borderBottomWidth: 0.5, borderBottomColor: '#D4CFC9', borderStyle: 'dashed', height: 14 }]} />
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* CHECKLIST — ANOTAÇÕES */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Checklist — Anotações</Text>
        <View style={{ marginTop: 10 }}>
          {(checklist.length > 12 ? checklist.slice(12, 20) : checklist.slice(0, 8)).map((item, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                <Text style={[S.tabelaCelula, { width: 25 }]}>[ ]</Text>
                <Text style={[S.tabelaCelula, { flex: 1 }]}>{item.item}</Text>
              </View>
              <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#D4CFC9', borderStyle: 'dashed', height: 18 }} />
              <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#D4CFC9', borderStyle: 'dashed', height: 18 }} />
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* FORNECEDORES */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Fornecedores</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 80 }]}>Categoria</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 1.2 }]}>Nome</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 1 }]}>Telefone</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 1.2 }]}>E-mail</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 50 }]}>Status</Text>
          </View>
          {fornecedores.slice(0, 14).map((item, i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 80 }]}>{item.categoria}</Text>
              <Text style={[S.tabelaCelula, { flex: 1.2 }]}>{item.nome}</Text>
              <Text style={[S.tabelaCelula, { flex: 1 }]}>________________</Text>
              <Text style={[S.tabelaCelula, { flex: 1.2 }]}>________________</Text>
              <Text style={[S.tabelaCelula, { width: 50 }]}>A definir</Text>
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* FORNECEDORES — ANOTAÇÕES */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Fornecedores — Anotações</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { width: 80 }]}>Categoria</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 1 }]}>Valor</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 1 }]}>Prazo</Text>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Anotações</Text>
          </View>
          {fornecedores.slice(0, 10).map((item, i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { width: 80 }]}>{item.categoria}</Text>
              <Text style={[S.tabelaCelula, { flex: 1 }]}>R$ ____________</Text>
              <Text style={[S.tabelaCelula, { flex: 1 }]}>____________</Text>
              <View style={[S.tabelaCelula, { flex: 2, borderBottomWidth: 0.5, borderBottomColor: '#D4CFC9', borderStyle: 'dashed', height: 14 }]} />
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* ORÇAMENTO */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Orçamento Detalhado</Text>
        <Text style={S.paragrafo}>Esta estimativa foi regionalizada com base em {cidade || 'sua cidade'} / {estado || 'seu estado'}.</Text>
        <Text style={S.subtitulo}>Distribuição do Orçamento</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
          <PizzaChart data={itensOrcamento.slice(0, 8)} colors={CORES_PIZZA} size={130} />
          <View style={{ marginLeft: 16, flex: 1 }}>
            {itensOrcamento.slice(0, 8).map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                <View style={{ width: 10, height: 10, backgroundColor: CORES_PIZZA[i % CORES_PIZZA.length], marginRight: 6 }} />
                <Text style={{ fontFamily: fonteCorpo, fontSize: 8, color: corTexto, wrap: true }}>{item.item} ({item.percentual}%)</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Item</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 50 }]}>%</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 80 }]}>Valor Est.</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 80 }]}>Valor Real</Text>
          </View>
          {itensOrcamento.slice(0, 15).map((item, i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{item.item}</Text>
              <Text style={[S.tabelaCelula, { width: 50 }]}>{item.percentual}%</Text>
              <Text style={[S.tabelaCelula, { width: 80 }]}>R$ {item.valor.toLocaleString('pt-BR')}</Text>
              <Text style={[S.tabelaCelula, { width: 80 }]}>R$ ____________</Text>
            </View>
          ))}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* ORÇAMENTO — CONTINUAÇÃO */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Orçamento Detalhado — Continuação</Text>
        <View style={S.tabela}>
          <View style={S.tabelaLinhaHeader}>
            <Text style={[S.tabelaCelulaHeader, { flex: 2 }]}>Item</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 50 }]}>%</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 80 }]}>Valor Est.</Text>
            <Text style={[S.tabelaCelulaHeader, { width: 80 }]}>Valor Real</Text>
          </View>
          {itensOrcamento.slice(15).map((item, i) => (
            <View key={i} style={S.tabelaLinha}>
              <Text style={[S.tabelaCelula, { flex: 2 }]}>{item.item}</Text>
              <Text style={[S.tabelaCelula, { width: 50 }]}>{item.percentual}%</Text>
              <Text style={[S.tabelaCelula, { width: 80 }]}>R$ {item.valor.toLocaleString('pt-BR')}</Text>
              <Text style={[S.tabelaCelula, { width: 80 }]}>R$ ____________</Text>
            </View>
          ))}
          <View style={[S.tabelaLinha, { borderTopWidth: 1, borderTopColor: corTitulo, marginTop: 3 }]}>
            <Text style={[S.tabelaCelula, { flex: 2, fontFamily: fonteDisplay, color: corTitulo }]}>TOTAL ESTIMADO</Text>
            <Text style={[S.tabelaCelula, { width: 50, color: corTitulo }]}>100%</Text>
            <Text style={[S.tabelaCelula, { width: 80, color: corTitulo }]}>R$ {itensOrcamento.reduce((s, i) => s + i.valor, 0).toLocaleString('pt-BR')}</Text>
            <Text style={[S.tabelaCelula, { width: 80, color: corTitulo }]}>R$ ____________</Text>
          </View>
        </View>
        <View style={S.boxInfo}>
          <Text style={S.boxInfoTexto}>Dica: reserve 10% do orçamento para imprevistos. Negocie pacotes completos com fornecedores.</Text>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* DICAS REGIONAIS */}
      <Page size="A4" style={S.pagina}>
        <Text style={S.tituloSecao}>Dicas Regionais</Text>
        <Text style={S.paragrafo}>Informações específicas para {localCompleto}.</Text>
        <Text style={S.subtitulo}>Clima Local</Text>
        <View style={S.boxInfo}><Text style={S.boxInfoTexto}>{dicasRegionais.clima}</Text></View>
        <Text style={S.subtitulo}>Cuidados Especiais</Text>
        {dicasRegionais.cuidados.map((c, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 4, marginLeft: 8 }}>
            <Text style={{ fontFamily: fonteCorpo, fontSize: 9, color: corTitulo, marginRight: 4 }}>•</Text>
            <Text style={{ fontFamily: fonteCorpo, fontSize: 9, color: corTexto, flex: 1, lineHeight: 1.5, wrap: true }}>{c}</Text>
          </View>
        ))}
        <Text style={S.subtitulo}>Melhores Épocas</Text>
        {dicasRegionais.melhoresEpocas.map((e, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 4, marginLeft: 8 }}>
            <Text style={{ fontFamily: fonteCorpo, fontSize: 9, color: corTitulo, marginRight: 4 }}>✓</Text>
            <Text style={{ fontFamily: fonteCorpo, fontSize: 9, color: corTexto, flex: 1, lineHeight: 1.5, wrap: true }}>{e}</Text>
          </View>
        ))}
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* CTA FINAL */}
      <Page size="A4" style={S.pagina}>
        <View style={S.ctaContainer}>
          <Text style={S.ctaTitulo}>Obrigado por confiar no descomplicaí</Text>
          <Text style={S.ctaTexto}>{nomeCasal}, este memorial é apenas o começo. Assine o descomplicaí e tenha acesso à gestão completa do seu casamento.</Text>
          <Text style={[S.ctaTexto, { fontFamily: fonteDisplay, fontSize: 13, color: corTitulo, marginTop: 10 }]}>"O amor é a poesia dos sentidos."</Text>
          <Text style={[S.ctaTexto, { fontSize: 9, color: corTextoSuave }]}>— Honoré de Balzac</Text>
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            {qrCodeDataUri ? <Image src={qrCodeDataUri} style={{ width: 90, height: 90 }} /> : <View style={{ width: 90, height: 90, backgroundColor: '#F3F0EC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: corBorda }}><Text style={{ fontSize: 8, color: corTextoSuave }}>QR Code</Text></View>}
            <Text style={[S.ctaUrl, { marginTop: 10 }]}>arxum.csstudios.site/descomplicai</Text>
          </View>
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>
    </Document>
  );
}