// components/pdf/MemorialPDF.jsx
// Documento PDF do memorial — layout elegante com fontes nativas (sem download)
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const cores = {
  brand: '#8B6F5E',
  tech: '#10B981',
  texto: '#1A1714',
  textoSecundario: '#5C534A',
  borda: '#E5E0D9',
  fundo: '#F9F7F4',
  branco: '#FFFFFF',
};

const estilos = StyleSheet.create({
  pagina: {
    backgroundColor: cores.branco,
    padding: 0,
  },
  capa: {
    backgroundColor: cores.fundo,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  capaLinha: {
    width: 40,
    height: 1,
    backgroundColor: cores.brand,
    marginBottom: 24,
  },
  capaTitulo: {
    fontFamily: 'Times-Roman',
    fontSize: 36,
    color: cores.texto,
    textAlign: 'center',
    marginBottom: 12,
  },
  capaSubtitulo: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginBottom: 8,
  },
  capaData: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: cores.brand,
    textAlign: 'center',
    marginTop: 8,
  },
  paginaConteudo: {
    backgroundColor: cores.branco,
    padding: 50,
    paddingBottom: 70,
  },
  secaoTitulo: {
    fontFamily: 'Times-Roman',
    fontSize: 22,
    color: cores.brand,
    marginBottom: 12,
    marginTop: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: cores.borda,
    paddingBottom: 8,
  },
  paragrafo: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: cores.texto,
    lineHeight: 1.7,
    marginBottom: 10,
  },
  rodape: {
    position: 'absolute',
    bottom: 24,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: cores.borda,
    paddingTop: 8,
  },
  rodapeTexto: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: cores.textoSecundario,
  },
  rodapeMarca: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: cores.brand,
  },
  paleta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  cor: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

function Rodape({ nomeCasal, numeroPagina }) {
  return (
    <View style={estilos.rodape} fixed>
      <Text style={estilos.rodapeTexto}>{nomeCasal}</Text>
      <Text style={estilos.rodapeMarca}>gerado pelo Descomplicaí · descomplicai.com.br</Text>
      <Text style={estilos.rodapeTexto}>{numeroPagina}</Text>
    </View>
  );
}

function parsearSecoes(textoMarkdown) {
  const secoes = [];
  const linhas = textoMarkdown.split('\n');
  let secaoAtual = null;

  for (const linha of linhas) {
    if (linha.startsWith('## ')) {
      if (secaoAtual) secoes.push(secaoAtual);
      secaoAtual = { titulo: linha.replace('## ', '').trim(), conteudo: '' };
    } else if (secaoAtual) {
      secaoAtual.conteudo += linha + '\n';
    }
  }
  if (secaoAtual) secoes.push(secaoAtual);
  return secoes;
}

export function MemorialPDF({ memorial, dadosEvento }) {
  const nomeCasal =
    dadosEvento.nomePessoa1 && dadosEvento.nomePessoa2
      ? `${dadosEvento.nomePessoa1} & ${dadosEvento.nomePessoa2}`
      : 'Nosso Casamento';

  const secoes = parsearSecoes(memorial);

  return (
    <Document>
      {/* Capa */}
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.capa}>
          <View style={estilos.capaLinha} />
          <Text style={estilos.capaTitulo}>{nomeCasal}</Text>
          <Text style={estilos.capaSubtitulo}>Memorial do Casamento</Text>
          {dadosEvento.cidadeEvento && (
            <Text style={estilos.capaSubtitulo}>{dadosEvento.cidadeEvento}</Text>
          )}
          {dadosEvento.dataEvento && (
            <Text style={estilos.capaData}>{dadosEvento.dataEvento}</Text>
          )}
          <View style={[estilos.capaLinha, { marginTop: 32, marginBottom: 0 }]} />

          {/* Paleta de cores */}
          {dadosEvento.paleta && dadosEvento.paleta.length > 0 && (
            <View style={[estilos.paleta, { marginTop: 24 }]}>
              {dadosEvento.paleta.map((cor, i) => (
                <View key={i} style={[estilos.cor, { backgroundColor: cor }]} />
              ))}
            </View>
          )}
        </View>
        <Rodape nomeCasal={nomeCasal} numeroPagina="1" />
      </Page>

      {/* Páginas de conteúdo */}
      <Page size="A4" style={estilos.paginaConteudo}>
        {secoes.map((secao, index) => (
          <View key={index} wrap={false}>
            <Text style={estilos.secaoTitulo}>{secao.titulo}</Text>
            <Text style={estilos.paragrafo}>{secao.conteudo.trim()}</Text>
          </View>
        ))}
        <Rodape nomeCasal={nomeCasal} numeroPagina="" />
      </Page>
    </Document>
  );
}