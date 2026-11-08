import fs from 'fs';

async function parseAllDetailResponses() {
  const data = JSON.parse(fs.readFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/camara_outubro_2026_enriched.json', 'utf8'));
  console.log(`Analyzing responses for ${data.length} items...`);

  const fullReport = [];

  for (const item of data) {
    const fullUrl = 'https://www.camaracontenda.pr.gov.br/' + item.detailLink;
    let respTableFound = false;
    let responses = [];

    try {
      const resp = await fetch(fullUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await resp.text();

      // Look for Respostas section
      const rIdx = html.indexOf('<h3 class="tituloPagina">Respostas</h3>');
      if (rIdx !== -1) {
        respTableFound = true;
        const sub = html.slice(rIdx, rIdx + 3000);
        const tMatch = sub.match(/<table[\s\S]*?<\/table>/i);
        if (tMatch) {
          const tRows = tMatch[0].match(/<tr>([\s\S]*?)<\/tr>/gi) || [];
          for (const tr of tRows.slice(1)) { // skip header
            const tds = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
            if (tds.length >= 3) {
              const numOficio = tds[0].replace(/<[^>]+>/g, '').trim();
              const dataOficio = tds[1].replace(/<[^>]+>/g, '').trim();
              const assuntoOficio = tds[2].replace(/<[^>]+>/g, '').trim();
              
              // PDF file link / id if any
              const fMatch = tr.match(/name="nome_arquivo"\s+value="([^"]+)"/i);
              const filePdf = fMatch ? fMatch[1] : '';

              const idMatch = tr.match(/name="id"\s+value="(\d+)"/i);
              const fileId = idMatch ? idMatch[1] : '';

              responses.push({
                numOficio,
                dataOficio,
                assuntoOficio,
                filePdf,
                fileId
              });
            }
          }
        }
      }

      // Also check status
      let statusPrefeitura = '';
      if (responses.length > 0) {
        statusPrefeitura = 'Respondido pela Prefeitura';
      } else {
        statusPrefeitura = 'Sem resposta registrada (Aguardando / Não respondido)';
      }

      fullReport.push({
        tipo: item.tipo,
        numero: item.numero,
        dataApresentacao: item.data,
        autor: item.autor,
        ementa: item.ementa,
        situacaoCamara: item.situacao,
        statusPrefeitura,
        respostasExecutivo: responses
      });

    } catch (e) {
      console.error(`Error on ${item.numero}:`, e);
    }
  }

  fs.writeFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/relatorio_comparacao_outubro_2026.json', JSON.stringify(fullReport, null, 2));
  console.log('Saved relatorio_comparacao_outubro_2026.json');
}

parseAllDetailResponses().catch(console.error);

