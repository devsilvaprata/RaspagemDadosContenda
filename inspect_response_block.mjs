import fs from 'fs';

// Let's fetch the detail page of Indicação 0551-2026 or parse its full HTML
async function inspectResponseBlock() {
  const data = JSON.parse(fs.readFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/camara_outubro_2026_enriched.json', 'utf8'));
  const item = data.find(x => x.numero.includes('0551'));
  const url = 'https://www.camaracontenda.pr.gov.br/' + item.detailLink;
  const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await resp.text();

  // Find where "Resposta" or "Respostas" appears
  const idx = html.indexOf('Respostas');
  if (idx !== -1) {
    console.log('--- RESPONSE SECTION IN HTML ---');
    console.log(html.slice(idx - 200, idx + 1500));
  } else {
    console.log('No "Respostas" string found');
  }
}

inspectResponseBlock().catch(console.error);

