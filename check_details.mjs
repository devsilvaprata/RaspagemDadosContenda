import fs from 'fs';

async function checkDetails() {
  const data = JSON.parse(fs.readFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/camara_outubro_2026.json', 'utf8'));
  const all = [...data.indicacoes, ...data.requerimentos];
  console.log(`Checking detail pages for ${all.length} items...`);

  const enriched = [];

  for (const item of all) {
    if (!item.detailLink) {
      enriched.push(item);
      continue;
    }
    const fullUrl = 'https://www.camaracontenda.pr.gov.br/' + item.detailLink;
    try {
      const resp = await fetch(fullUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await resp.text();

      // Look for Tramitação, Ofício, Resposta, Anexos, etc.
      // Let's extract any mention of Ofício or Resposta or Arquivos
      const oficios = html.match(/(?:of[ií]cio|resposta|tramita[çc][ãa]o|devolu[çc][ãa]o|atendimento|conclu[ií]d)[^<]*/gi) || [];
      const files = html.match(/name="nome_arquivo"\s+value="([^"]+)"/gi) || [];

      // Check if there are other fields in detail
      const sessaoMatch = html.match(/<h4>Sess&atilde;o Apresenta&ccedil;&atilde;o<\/h4>\s*([^<]+)/i);
      const sessao = sessaoMatch ? sessaoMatch[1].trim() : '';

      const tipoDetalheMatch = html.match(/<h4>Tipo Indica&ccedil;&atilde;o<\/h4>\s*([^<]+)/i) || html.match(/<h4>Tipo Requerimento<\/h4>\s*([^<]+)/i);
      const subTipo = tipoDetalheMatch ? tipoDetalheMatch[1].trim() : '';

      enriched.push({
        ...item,
        sessao,
        subTipo,
        detailSnippets: oficios.map(s => s.trim()),
        files: files.map(f => f.replace(/.*value="/, '').replace('"', ''))
      });
      console.log(`Checked ${item.numero}: Sessao=${sessao} | Files=${files.length} | OficiosFound=${oficios.length}`);
    } catch (e) {
      console.log(`Error on ${item.numero}:`, e.message);
      enriched.push(item);
    }
  }

  fs.writeFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/camara_outubro_2026_enriched.json', JSON.stringify(enriched, null, 2));
  console.log('Saved enriched data.');
}

checkDetails().catch(console.error);

