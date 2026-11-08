import fs from 'fs';

async function fetchPage(url) {
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  return await resp.text();
}

function parseItems(html, tipoNome) {
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/gi);
  if (!tbodyMatch || tbodyMatch.length < 3) return [];
  const mainTable = tbodyMatch[2];
  const rows = mainTable.split(/<tr>\s*<td>/gi).slice(1);

  const items = [];
  for (const row of rows) {
    const titleMatch = row.match(/<h4>([^<]+N&ordm[^<]+)<\/h4>/i) || row.match(/<h4>([^<]+)<\/h4>/i);
    const numero = titleMatch ? titleMatch[1].replace(/&ordm;?/g, 'º').replace(/&ccedil;/g, 'ç').replace(/&atilde;/g, 'ã').trim() : '';

    const dataMatch = row.match(/<h4>Data Inicial:<\/h4>\s*([^<]+)/i) || row.match(/(\d{2}\/\d{2}\/\d{4})/);
    const data = dataMatch ? dataMatch[1].trim() : '';

    const sitMatch = row.match(/<h4>Situa&ccedil;&atilde;o<\/h4>\s*([^<]+)/i);
    const situacao = sitMatch ? sitMatch[1].replace(/&ccedil;/g, 'ç').replace(/&atilde;/g, 'ã').trim() : '';

    const autorMatch = row.match(/<h4>Autor:<\/h4>\s*([^<]+)/i);
    const autor = autorMatch ? autorMatch[1].trim() : '';

    const ementaMatch = row.match(/<h4>Ementa:<\/h4>\s*([\s\S]*?)(?:<\/div>|<hr)/i);
    const ementa = ementaMatch ? ementaMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    const detailMatch = row.match(/href="([^"]*id=\d+[^"]*)"/i);
    const detailLink = detailMatch ? detailMatch[1].replace(/&amp;/g, '&') : '';

    const pdfMatch = row.match(/name="id"\s+value="(\d+)"/i);
    const pdfId = pdfMatch ? pdfMatch[1] : '';

    if (numero && data) {
      items.push({
        tipo: tipoNome,
        numero,
        data,
        situacao,
        autor,
        ementa,
        detailLink,
        pdfId
      });
    }
  }
  return items;
}

function parseDate(dStr) {
  const parts = dStr.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return null;
}

async function scrapeAllOctober(tp, tipoNome) {
  const results = [];
  let pg = 1;
  let keepGoing = true;

  while (keepGoing) {
    const url = `https://www.camaracontenda.pr.gov.br/?pag=T0RVPU9UST1PRFk9T1dFPU9UST1PR009T1RVPU9XUT1PVGc9T1dVPQ==&&ano=2026&&tp=${tp}&codAutor=&numFom=&ementaForm=&subtipo=&pg=${pg}`;
    console.log(`Fetching ${tipoNome} pg ${pg}...`);
    const html = await fetchPage(url);
    const items = parseItems(html, tipoNome);

    if (items.length === 0) {
      console.log(`No items found on pg ${pg}. Ending.`);
      break;
    }

    for (const item of items) {
      const dt = parseDate(item.data);
      if (!dt) continue;

      // October 2026: month is 9 (0-indexed) and year is 2026
      if (dt.getFullYear() === 2026 && dt.getMonth() === 9) {
        results.push(item);
      } else if (dt.getFullYear() < 2026 || (dt.getFullYear() === 2026 && dt.getMonth() < 9)) {
        // Items are in descending order; if we see September 2026 or earlier, we can stop
        console.log(`Found item before Oct 2026 (${item.data}). Stopping pagination.`);
        keepGoing = false;
        break;
      }
    }

    pg++;
    // Safety limit
    if (pg > 30) break;
  }

  return results;
}

async function main() {
  const indicacoesOct = await scrapeAllOctober(1, 'Indicação');
  console.log(`\nTotal Indicações in October 2026: ${indicacoesOct.length}`);

  const requerimentosOct = await scrapeAllOctober(3, 'Requerimento');
  console.log(`\nTotal Requerimentos in October 2026: ${requerimentosOct.length}`);

  fs.writeFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/camara_outubro_2026.json', JSON.stringify({
    indicacoes: indicacoesOct,
    requerimentos: requerimentosOct
  }, null, 2));

  console.log('Saved to camara_outubro_2026.json');
}

main().catch(console.error);

