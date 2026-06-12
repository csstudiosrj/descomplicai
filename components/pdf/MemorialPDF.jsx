// components/pdf/MemorialPDF.jsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const cores = {
  brand: '#8B6F5E',
  texto: '#1A1714',
  textoSecundario: '#5C534A',
  borda: '#E5E0D9',
  fundo: '#F9F7F4',
  branco: '#FFFFFF',
};

const estilos = StyleSheet.create({
  // Capa
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
    width: 50,
    height: 1.5,
    backgroundColor: cores.brand,
    marginBottom: 28,
  },
  capaTitulo: {
    fontFamily: 'Times-Roman',
    fontSize: 38,
    color: cores.texto,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 2,
  },
  capaSubtitulo: {
    fontFamily: 'Helvetica',
    fontSize: 13,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginBottom: 10,
  },
  capaData: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: cores.brand,
    textAlign: 'center',
    marginTop: 12,
  },
  capaLocal: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 6,
  },
  paletaContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  // Páginas de conteúdo
  paginaConteudo: {
    backgroundColor: cores.branco,
    padding: 50,
    paddingBottom: 70,
  },
  secaoTitulo: {
    fontFamily: 'Times-Roman',
    fontSize: 24,
    color: cores.brand,
    marginBottom: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    paddingBottom: 10,
  },
  paragrafo: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: cores.texto,
    lineHeight: 1.8,
    marginBottom: 8,
  },
  // Rodapé
  rodape: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: cores.borda,
    paddingTop: 6,
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
  // Página de fornecedores
  fornecedorLinha: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: cores.texto,
    marginBottom: 4,
    marginLeft: 12,
  },
  fornecedorCategoria: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    fontWeight: 'bold',
    color: cores.brand,
    marginTop: 12,
    marginBottom: 4,
  },
});

function Rodape({ nomeCasal }) {
  return (
    <View style={estilos.rodape} fixed>
      <Text style={estilos.rodapeTexto}>{nomeCasal}</Text>
      <Text style={estilos.rodapeMarca}>gerado pelo descomplicaí · arxum.csstudios.site/descomplicai</Text>
      <Text style={estilos.rodapeTexto} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
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
      secaoAtual = { titulo: linha.replace('## ', '').trim(), linhas: [] };
    } else if (secaoAtual) {
      secaoAtual.linhas.push(linha);
    }
  }
  if (secaoAtual) secoes.push(secaoAtual);
  return secoes;
}

function limparLinha(linha) {
  return linha
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .trim();
}

export function MemorialPDF({ memorial, dadosEvento }) {
  const nomeCasal =
    dadosEvento.nomePessoa1 && dadosEvento.nomePessoa2
      ? `${dadosEvento.nomePessoa1} & ${dadosEvento.nomePessoa2}`
      : 'Nosso Casamento';

  const secoes = parsearSecoes(memorial || '');

  // Filtra seções vazias
  const secoesValidas = secoes.filter(
    (s) => s.titulo && s.linhas.some((l) => l.trim().length > 0)
  );

  // Separa a última seção (Fornecedores) se existir
  const secaoFornecedores = secoesValidas.find((s) =>
    s.titulo.toLowerCase().includes('fornecedor')
  );
  const outrasSecoes = secoesValidas.filter((s) => s !== secaoFornecedores);

  return (
    <Document>
      {/* ========== CAPA ========== */}
      <Page size="A4" style={{ backgroundColor: cores.fundo, padding: 0 }}>
        <View style={estilos.capa}>
          <View style={estilos.capaLinha} />
          <Text style={estilos.capaTitulo}>{nomeCasal}</Text>
          <Text style={estilos.capaSubtitulo}>Memorial do Casamento</Text>
          {dadosEvento.cidadeEvento && (
            <Text style={estilos.capaLocal}>{dadosEvento.cidadeEvento}</Text>
          )}
          {dadosEvento.dataEvento && (
            <Text style={estilos.capaData}>{dadosEvento.dataEvento}</Text>
          )}
          <View style={[estilos.capaLinha, { marginTop: 36, marginBottom: 0 }]} />

          {/* Paleta de cores na capa */}
          {dadosEvento.paleta && dadosEvento.paleta.length > 0 && (
            <View style={estilos.paletaContainer}>
              {dadosEvento.paleta.map((cor, i) => (
                <View key={i} style={[estilos.corSwatch, { backgroundColor: cor }]} />
              ))}
            </View>
          )}
        </View>
        <Rodape nomeCasal={nomeCasal} />
      </Page>

      {/* ========== SEÇÕES PRINCIPAIS (cada uma em sua própria página) ========== */}
      {outrasSecoes.map((secao, index) => (
        <Page key={`secao-${index}`} size="A4" style={estilos.paginaConteudo}>
          <Text style={estilos.secaoTitulo}>{secao.titulo}</Text>
          {secao.linhas.map((linha, i) => {
            const textoLimpo = limparLinha(linha);
            if (!textoLimpo) return null;
            return (
              <Text key={i} style={estilos.paragrafo}>
                {textoLimpo}
              </Text>
            );
          })}
          <Rodape nomeCasal={nomeCasal} />
        </Page>
      ))}

      {/* ========== FORNECEDORES (se existir) ========== */}
      {secaoFornecedores && (
        <Page size="A4" style={estilos.paginaConteudo}>
          <Text style={estilos.secaoTitulo}>{secaoFornecedores.titulo}</Text>
          {secaoFornecedores.linhas.map((linha, i) => {
            const textoLimpo = limparLinha(linha);
            if (!textoLimpo) return null;
            return (
              <Text key={i} style={estilos.fornecedorLinha}>
                {textoLimpo}
              </Text>
            );
          })}
          <Rodape nomeCasal={nomeCasal} />
        </Page>
      )}
    </Document>
  );
}