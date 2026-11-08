import fs from 'fs';

const oficios = [
  { num: '0501-2026', id: '1352', nome: 'arquivo_0501-2026.pdf' },
  { num: '0503-2026', id: '1354', nome: 'arquivo_0503-2026.pdf' },
  { num: '0505-2026', id: '1356', nome: 'arquivo_0505-2026.pdf' },
  { num: '0506-2026', id: '1357', nome: 'arquivo_0506-2026.pdf' },
  { num: '0514-2026', id: '1365', nome: 'arquivo_0514-2026.pdf' },
  { num: '0515-2026', id: '1366', nome: 'arquivo_0515-2026.pdf' },
  { num: '0516-2026', id: '1367', nome: 'arquivo_0516-2026.pdf' },
];

async function getPdfUrl(oficio) {
  const url = 'https://www.camaracontenda.pr.gov.br/indexAjax.php?pag=T0RJPU9UVT1PVFE9T1dFPU9HVT1PV1E9T1RZPQ==';
  const formData = new URLSearchParams();
  formData.append('pag', 'T0RJPU9UVT1PVFE9T1dFPU9HVT1PV1E9T1RZPQ=');
  formData.append('nome_arquivo', oficio.nome);
  formData.append('nome_tabela', 'pdf_protocolo_dinamico_2');
  formData.append('id', oficio.id);
  formData.append('idtipolei', '');
  formData.append('mostraDataCodigoIndividial', 'false');
  formData.append('descricao', '.pdf');
  formData.append('download', '');

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });

  const text = await resp.text();
  const m = text.match(/location\.href=['"]\.\/temp\/([^'"]+)['"]/);
  if (m) {
    const directUrl = 'https://www.camaracontenda.pr.gov.br/temp/' + m[1];
    console.log(`Oficio ${oficio.num} direct URL: ${directUrl}`);
    
    // Download PDF
    const pdfResp = await fetch(directUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const buf = await pdfResp.arrayBuffer();
    fs.writeFileSync(`C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/oficio_${oficio.num.replace('-', '_')}.pdf`, Buffer.from(buf));
    console.log(`Saved oficio_${oficio.num}, size: ${buf.byteLength}`);
  } else {
    console.log(`Failed to get URL for ${oficio.num}. Response:`, text);
  }
}

async function run() {
  // Let's first verify the exact ID for each of the other ofícios from the detail pages
  const data = JSON.parse(fs.readFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/relatorio_comparacao_outubro_2026.json', 'utf8'));
  const foundMap = {};
  for (const item of data) {
    for (const r of item.respostasExecutivo) {
      if (!foundMap[r.numOficio]) {
        foundMap[r.numOficio] = { num: r.numOficio, id: r.fileId, nome: r.filePdf };
      }
    }
  }

  console.log('Unique ofícios found in October items:');
  console.log(foundMap);

  for (const k of Object.keys(foundMap)) {
    await getPdfUrl(foundMap[k]);
  }
}

run().catch(console.error);

