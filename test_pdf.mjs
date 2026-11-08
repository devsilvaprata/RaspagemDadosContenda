import fs from 'fs';

async function testDownloadPdf() {
  const url = 'https://www.camaracontenda.pr.gov.br/indexAjax.php?pag=T0RJPU9UVT1PVFE9T1dFPU9HVT1PV1E9T1RZPQ==';
  const formData = new URLSearchParams();
  formData.append('pag', 'T0RJPU9UVT1PVFE9T1dFPU9HVT1PV1E9T1RZPQ=');
  formData.append('nome_arquivo', 'arquivo_0520-2026.pdf');
  formData.append('nome_tabela', 'pdf_protocolo_dinamico_2');
  formData.append('id', '1371');
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

  const buffer = await resp.arrayBuffer();
  fs.writeFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/oficio_0520_2026.pdf', Buffer.from(buffer));
  console.log('Saved oficio_0520_2026.pdf, size:', buffer.byteLength);
}

testDownloadPdf().catch(console.error);

