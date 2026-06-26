/**
 * Script MASTER - LOTE 2
 * Substitui hardcode em 13 arquivos do memorial
 * 
 * USO: node fix_lote2.js <diretorio-steps>
 */

const fs = require('fs');
const path = require('path');

const stepsDir = process.argv[2];
if (!stepsDir) {
  console.error('Uso: node fix_lote2.js <diretorio-steps>');
  process.exit(1);
}

// ============================================
// CONFIGURAÇÃO POR ARQUIVO
// ============================================

const configs = [
  {
    file: 'Step07dSimbolica.jsx',
    replacements: [
      { from: /O casal despeja areia/g, to: '${termos.pessoa1} e ${termos.pessoa2} despejam areia' },
      { from: /O casal bebe do mesmo cálice/g, to: '${termos.pessoa1} e ${termos.pessoa2} bebem do mesmo cálice' },
      { from: /O casal planta uma muda/g, to: '${termos.pessoa1} e ${termos.pessoa2} plantam uma muda' },
      { from: /Convidados jogam pétalas sobre o casal/g, to: 'Convidados jogam pétalas sobre ${termos.pessoa1} e ${termos.pessoa2}' },
      { from: /O casal oferece lenços/g, to: '${termos.pessoa1} e ${termos.pessoa2} oferecem lenços' },
    ]
  },
  {
    file: 'Step11bTransporte.jsx',
    replacements: [
      { from: /Ônibus para o casal também\?/g, to: '{`Ônibus para ${termos.pessoa1} e ${termos.pessoa2} também?`}' },
    ]
  },
  {
    file: 'Step30Entrada.jsx',
    replacements: [
      { from: /aria-label="Como será a entrada dos noivos\?"/g, to: 'aria-label={`Como será a entrada de ${termos.pessoa1} e ${termos.pessoa2}?`}' },
      { from: /Entrada do casal/g, to: '{`Entrada de ${termos.pessoa1} e ${termos.pessoa2}`}' },
    ]
  },
  {
    file: 'Step32PadrinhosCriancas.jsx',
    replacements: [
      { from: /subtexto: 'Entrada apenas do casal'/g, to: 'subtexto: `{`Entrada apenas de ${termos.pessoa1} e ${termos.pessoa2}`}`' },
    ]
  },
  {
    file: 'StepA15TradicaoFamiliar.jsx',
    replacements: [
      { from: /placeholder="Ex: Todo casamento na família tem churrasco no dia seguinte"/g, to: 'placeholder={`Ex: Todo ${termos.celebracao} na família tem churrasco no dia seguinte`}' },
    ]
  },
  {
    file: 'StepB16DefiniramEntrada.jsx',
    replacements: [
      { from: /Já definiu a entrada dos noivos\?/g, to: '{`Já definiu a entrada de ${termos.pessoa1} e ${termos.pessoa2}?`}' },
      { from: /placeholder="Ex: Noiva com o pai, noivo já no altar"/g, to: 'placeholder={`Ex: ${termos.pessoa1} com o pai, ${termos.pessoa2} já no altar`}' },
    ]
  },
  {
    file: 'StepE10QuemPaga.jsx',
    replacements: [
      { from: /label: "Noivos"/g, to: 'label: `{`${termos.pessoa1} e ${termos.pessoa2}`}`' },
      { from: /label: "Pais do noivo"/g, to: 'label: `{`Pais do ${termos.pessoa2}`}`' },
      { from: /desc: "Família do noivo assume"/g, to: 'desc: `{`Família do ${termos.pessoa2} assume`}`' },
      { from: /label: {}, desc: {}/g, to: 'label: `{`Pais do ${termos.pessoa1}`}`, desc: `{`Família do ${termos.pessoa1} assume`}`' },
    ],
    moveOpcoes: true,
    opcoesTemplate: `const OPCOES = [\n    { valor: "noivos", label: \`\${termos.pessoa1} e \${termos.pessoa2}\`, desc: \`Nós pagamos tudo\` },\n    { valor: "pais_noiva", label: \`Pais do \${termos.pessoa1}\`, desc: \`Família do \${termos.pessoa1} assume\` },\n    { valor: "pais_noivo", label: \`Pais do \${termos.pessoa2}\`, desc: \`Família do \${termos.pessoa2} assume\` },\n    { valor: "ambos_pais", label: "Ambos os pais", desc: "As duas famílias dividem" },\n    { valor: "outros", label: "Outros", desc: "Outra combinação" }\n  ];`
  },
  {
    file: 'StepE3CertidaoDivorcioNoivo.jsx',
    replacements: [
      { from: /aria-label="Certidão de divórcio do noivo"/g, to: 'aria-label={`Certidão de divórcio do ${termos.pessoa2}`}' },
    ]
  },
  {
    file: 'StepE9DocumentacaoEstrangeiro.jsx',
    replacements: [
      { from: /Documentação para casamento no Brasil está em dia\?/g, to: '{`Documentação para ${termos.celebracao} no Brasil está em dia?`}' },
    ]
  },
  {
    file: 'StepH5AulaDanca.jsx',
    replacements: [
      { from: /subtexto: 'Aulas particulares para os noivos'/g, to: 'subtexto: `{`Aulas particulares para ${termos.pessoa1} e ${termos.pessoa2}`}`' },
    ]
  },
  {
    file: 'StepI4AulasDanca.jsx',
    replacements: [
      { from: /subtexto: 'Apenas os noivos'/g, to: 'subtexto: `{`Apenas ${termos.pessoa1} e ${termos.pessoa2}`}`' },
    ]
  },
  {
    file: 'StepI5MudancaLook.jsx',
    replacements: [
      { from: /aria-label="A noiva fará mudança de look\?"/g, to: 'aria-label={`${termos.pessoa1} fará mudança de look?`}' },
      { from: /A noiva fará mudança de look\?/g, to: '{`${termos.pessoa1} fará mudança de look?`}' },
    ],
    injectGetTermos: true,
    injectTermos: true
  },
  {
    file: 'StepM2FotosLuaDeMel.jsx',
    replacements: [
      { from: /subtexto: 'Ensaio pós-casamento no destino'/g, to: 'subtexto: `{`Ensaio pós-${termos.celebracao} no destino`}`' },
    ]
  },
];

// ============================================
// PROCESSAMENTO
// ============================================

console.log('═══════════════════════════════════════════════════════');
console.log('  CORREÇÃO — LOTE 2 (13 arquivos)');
console.log('═══════════════════════════════════════════════════════\n');

for (const config of configs) {
  const filePath = path.join(stepsDir, config.file);
  console.log(`\n▶ ${config.file}`);
  console.log('  ───────────────────────────────────────');

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  Arquivo não encontrado: ${filePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  let modified = false;

  // Injetar import { getTermos } se necessário
  if (config.injectGetTermos && !content.includes('import { getTermos }')) {
    const lastImportMatch = content.match(/^(import\s+.*?from\s+['"][^'"]+['"];?)$/gm);
    if (lastImportMatch && lastImportMatch.length > 0) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      content = content.replace(lastImport, lastImport + "\nimport { getTermos } from '../../../utils/linguagemCasal';");
      console.log('  ✅ Injetado: import { getTermos }');
      modified = true;
    }
  }

  // Injetar const perfil + termos se necessário
  if (config.injectTermos && !content.includes('const perfil = estadoAtual?.perfilCasal')) {
    const funcMatch = content.match(/(export\s+default\s+)?function\s+\w+\s*\([^)]*\)\s*\{/);
    if (funcMatch) {
      const funcDecl = funcMatch[0];
      content = content.replace(funcDecl, funcDecl + "\n  const perfil = estadoAtual?.perfilCasal || 'nao-especificar';\n  const termos = getTermos(perfil);");
      console.log('  ✅ Injetado: const perfil + termos');
      modified = true;
    }
  }

  // Mover OPCOES para dentro do componente se necessário
  if (config.moveOpcoes) {
    const opcoesMatch = content.match(/const OPCOES = \[\s*\{[\s\S]*?\}\s*\];/);
    if (opcoesMatch && content.indexOf(opcoesMatch[0]) < content.indexOf('export default function')) {
      content = content.replace(opcoesMatch[0], '');
      console.log('  ✅ Removido: const OPCOES do topo');

      const termosLine = "const termos = getTermos(perfil);";
      content = content.replace(termosLine, termosLine + "\n\n  " + config.opcoesTemplate);
      console.log('  ✅ Inserido: const OPCOES dentro do componente');
      modified = true;
    }
  }

  // Aplicar replacements
  for (const rep of config.replacements) {
    if (content.includes(rep.from.source || rep.from)) {
      content = content.replace(rep.from, rep.to);
      modified = true;
      console.log(`  ✅ Substituído: ${rep.from.source || rep.from}`);
    }
  }

  // Limpar linhas em branco duplicadas
  content = content.replace(/\n{3,}/g, '\n\n');

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✅ Arquivo salvo`);
  } else {
    console.log(`  ℹ️  Nenhuma modificação necessária`);
  }
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('  LOTE 2 CONCLUÍDO');
console.log('═══════════════════════════════════════════════════════');
console.log('\nPróximos passos:');
console.log('  1. npm run build');
console.log('  2. git add . && git commit -m "fix: substitui hardcode lote 2" && git push');
