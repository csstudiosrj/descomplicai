import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Circle } from '@react-pdf/renderer';

/**
 * Componente PDF do Roteiro do Cerimonialista
 * Usa @react-pdf/renderer — mesmo padrão do MemorialPDF.jsx
 */

// ─── Helpers de cor ─────────────────────────────────────────────────
function hexToRgbObj(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return { r: 0.54, g: 0.44, b: 0.37 };
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}

function isCorEscura(hex) {
  const c = hexToRgbObj(hex);
  return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b < 0.5;
}

function formatarData(dataISO) {
  if (!dataISO) return 'Data a definir';
  const d = new Date(dataISO);
  if (isNaN(d)) return 'Data a definir';
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Paleta fallback ────────────────────────────────────────────────
const PALETA_FALLBACK = {
  primaria: '#8B6F5E',
  secundaria: '#E5E0D9',
  terciaria: '#F9F7F4',
};

// ─── Status config ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  pendente: { label: 'Pendente', cor: '#9E9E9E' },
  em_andamento: { label: 'Em andamento', cor: '#C9A96E' },
  concluido: { label: 'Concluido', cor: '#4CAF50' },
  atrasado: { label: 'Atrasado', cor: '#F44336' },
};

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    paddingBottom: 60,
  },
  capa: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  capaLinha: {
    width: 50,
    height: 1,
    marginBottom: 24,
  },
  capaTitulo: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 12,
  },
  capaSubtitulo: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 3,
  },
  capaLocal: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  capaData: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  paletaContainer: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletaItem: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  paletaNome: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  paletaHex: {
    fontSize: 8,
    marginTop: 1,
    textAlign: 'center',
  },
  tituloSecao: {
    fontSize: 22,
    marginBottom: 14,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  timelineItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E0D9',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  horarioBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horarioTexto: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  itemTitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescricao: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 4,
  },
  itemResponsavel: {
    fontSize: 9,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusTexto: {
    fontSize: 8,
    fontWeight: 'medium',
  },
  rodape: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    paddingTop: 6,
  },
  rodapeTexto: {
    fontSize: 8,
  },
});

// ─── Componente PaletaCirculo ──────────────────────────────────────
function PaletaCirculo({ cor, nome, hex }) {
  const borderColor = isCorEscura(cor) ? '#FFFFFF' : '#1A1714';
  return (
    <View style={styles.paletaItem}>
      <Svg width={44} height={44} viewBox="0 0 44 44">
        <Circle cx={22} cy={22} r={20} fill={cor} stroke={borderColor} strokeWidth={3} />
      </Svg>
      <Text style={[styles.paletaNome, { color: '#1A1714' }]}>{nome}</Text>
      <Text style={[styles.paletaHex, { color: '#5C534A' }]}>{hex}</Text>
    </View>
  );
}

// ─── Componente Rodape ─────────────────────────────────────────────
function Rodape({ nomeEvento, pageNumber, totalPages, corTextoSuave }) {
  return (
    <View style={styles.rodape}>
      <Text style={[styles.rodapeTexto, { color: corTextoSuave }]}>{nomeEvento}</Text>
      <Text style={[styles.rodapeTexto, { color: corTextoSuave }]}>
        descomplicaí · descomplicai.com.br
      </Text>
      <Text style={[styles.rodapeTexto, { color: corTextoSuave }]}>
        {pageNumber} / {totalPages}
      </Text>
    </View>
  );
}

// ─── Componente principal ──────────────────────────────────────────
export function RoteiroPDF({ evento, itens, paleta }) {
  const p = { ...PALETA_FALLBACK, ...paleta };
  const corPrimaria = p.primaria || p.cor1 || PALETA_FALLBACK.primaria;
  const corSecundaria = p.secundaria || p.cor2 || PALETA_FALLBACK.secundaria;
  const corTerciaria = p.terciaria || p.cor3 || PALETA_FALLBACK.terciaria;
  const corTexto = '#1A1714';
  const corTextoSuave = '#5C534A';
  const corTitulo = isCorEscura(corPrimaria) ? corPrimaria : '#5C4A3D';

  const nomeEvento = evento?.nome_evento || 'Roteiro do Evento';
  const dataFormatada = formatarData(evento?.data_evento);
  const cidade = evento?.cidade || '';

  const paletaArray = [
    { cor: corPrimaria, nome: 'Principal', hex: corPrimaria },
    { cor: corSecundaria, nome: 'Secundaria', hex: corSecundaria },
    { cor: corTerciaria, nome: 'Terciaria', hex: corTerciaria },
  ];

  const itensOrdenados = (itens || []).sort((a, b) => {
    if (a.ordem !== b.ordem) return (a.ordem || 0) - (b.ordem || 0);
    return String(a.horario || '').localeCompare(String(b.horario || ''));
  });

  return (
    <Document>
      {/* CAPA */}
      <Page size="A4" style={[styles.page, { backgroundColor: corTerciaria }]}>
        <View style={styles.capa}>
          <View style={[styles.capaLinha, { backgroundColor: corPrimaria }]} />
          <Text style={[styles.capaTitulo, { color: corTitulo, fontFamily: 'Times-Roman' }]}>
            {nomeEvento}
          </Text>
          <Text style={[styles.capaSubtitulo, { color: corTextoSuave, fontFamily: 'Helvetica' }]}>
            R O T E I R O  D O  E V E N T O
          </Text>
          {cidade && (
            <Text style={[styles.capaLocal, { color: corTextoSuave, fontFamily: 'Helvetica' }]}>
              {cidade}
            </Text>
          )}
          <Text style={[styles.capaData, { color: corTextoSuave, fontFamily: 'Helvetica' }]}>
            {dataFormatada}
          </Text>
          <View style={[styles.capaLinha, { marginTop: 28, backgroundColor: corPrimaria }]} />
          <View style={styles.paletaContainer}>
            {paletaArray.map((item, i) => (
              <PaletaCirculo key={i} cor={item.cor} nome={item.nome} hex={item.hex} />
            ))}
          </View>
        </View>
        <Rodape nomeEvento={nomeEvento} pageNumber={1} totalPages={2} corTextoSuave={corTextoSuave} />
      </Page>

      {/* TIMELINE */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.tituloSecao, { color: corTitulo, borderBottomColor: corSecundaria, fontFamily: 'Times-Roman' }]}>
          Timeline Hora a Hora
        </Text>

        {itensOrdenados.map((item, index) => {
          const status = item.status || 'pendente';
          const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.pendente;

          return (
            <View key={item.id || index} style={styles.timelineItem}>
              <View style={styles.timelineHeader}>
                <View style={[styles.horarioBadge, { backgroundColor: corPrimaria + '18' }]}>
                  <Text style={[styles.horarioTexto, { color: corPrimaria }]}>
                    {item.horario ? item.horario.slice(0, 5) : '--:--'}
                  </Text>
                </View>

                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitulo, { color: corTexto, fontFamily: 'Helvetica-Bold' }]}>
                    {item.titulo || 'Sem titulo'}
                  </Text>
                  {item.descricao && (
                    <Text style={[styles.itemDescricao, { color: corTextoSuave, fontFamily: 'Helvetica' }]}>
                      {item.descricao}
                    </Text>
                  )}
                  {item.responsavel && (
                    <Text style={[styles.itemResponsavel, { color: corTextoSuave, fontFamily: 'Helvetica' }]}>
                      Responsavel: {item.responsavel}
                    </Text>
                  )}
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.cor + '18' }]}>
                    <Text style={[styles.statusTexto, { color: statusInfo.cor }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        <Rodape
          nomeEvento={nomeEvento}
          pageNumber={2}
          totalPages={2}
          corTextoSuave={corTextoSuave}
        />
      </Page>
    </Document>
  );
}

export default RoteiroPDF;
