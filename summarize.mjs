import fs from 'fs';

const data = JSON.parse(fs.readFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/relatorio_comparacao_outubro_2026.json', 'utf8'));

console.log(`Total items analyzed: ${data.length}`);
const respondidos = data.filter(x => x.respostasExecutivo.length > 0);
const semResposta = data.filter(x => x.respostasExecutivo.length === 0);

console.log(`Respondidos pela Prefeitura: ${respondidos.length}`);
console.log(`Sem Resposta Registrada: ${semResposta.length}`);

console.log('\n--- ITENS RESPONDIDOS ---');
respondidos.forEach(x => {
  console.log(`[${x.tipo}] ${x.numero} (${x.dataApresentacao}) - Autor: ${x.autor}`);
  x.respostasExecutivo.forEach(r => {
    console.log(`  -> Ofício Executivo Nº ${r.numOficio} em ${r.dataOficio}: ${r.assuntoOficio} (PDF: ${r.filePdf})`);
  });
});

console.log('\n--- ITENS SEM RESPOSTA REGISTRADA ---');
semResposta.forEach(x => {
  console.log(`[${x.tipo}] ${x.numero} (${x.dataApresentacao}) - Autor: ${x.autor} | Situação na Câmara: ${x.situacaoCamara}`);
  console.log(`  Ementa: ${x.ementa.slice(0, 100)}...`);
});

