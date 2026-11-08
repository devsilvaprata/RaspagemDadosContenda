import fs from 'fs';

function parseProposicoes(html, tipoNome) {
  // Check pagination
  const paginationMatch = html.match(/class=["'][^"']*pagination[^"']*["'][\s\S]*?<\/ul>/i);
  if (paginationMatch) {
    console.log(`Pagination found for ${tipoNome}:`, paginationMatch[0]);
  } else {
    console.log(`No pagination for ${tipoNome} (or single page).`);
  }

  // Each item is in a table row: <tr> <td> <div class='row'> ... <h4>Indicação Nº ...</h4> ...
  // Let's extract each row inside tbody
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/gi);
  if (!tbodyMatch || tbodyMatch.length < 3) {
    console.log(`No table body found for ${tipoNome}`);
    return [];
  }

  // Table 2 (index 2) is the main data table
  const mainTable = tbodyMatch[2];
  const rows = mainTable.split(/<tr>\s*<td>/gi).slice(1);
  console.log(`Total rows in ${tipoNome}: ${rows.length}`);

  const items = [];
  for (const row of rows) {
    // Number / Title
    const titleMatch = row.match(/<h4>([^<]+N&ordm[^<]+)<\/h4>/i) || row.match(/<h4>([^<]+)<\/h4>/i);
    const numero = titleMatch ? titleMatch[1].replace(/&ordm;?/g, 'º').replace(/&ccedil;/g, 'ç').replace(/&atilde;/g, 'ã').trim() : '';

    // Data
    const dataMatch = row.match(/<h4>Data Inicial:<\/h4>\s*([^<]+)/i) || row.match(/(\d{2}\/\d{2}\/\d{4})/);
    const data = dataMatch ? dataMatch[1].trim() : '';

    // Situação
    const sitMatch = row.match(/<h4>Situa&ccedil;&atilde;o<\/h4>\s*([^<]+)/i);
    const situacao = sitMatch ? sitMatch[1].replace(/&ccedil;/g, 'ç').replace(/&atilde;/g, 'ã').trim() : '';

    // Autor
    const autorMatch = row.match(/<h4>Autor:<\/h4>\s*([^<]+)/i);
    const autor = autorMatch ? autorMatch[1].trim() : '';

    // Ementa
    const ementaMatch = row.match(/<h4>Ementa:<\/h4>\s*([\s\S]*?)(?:<\/div>|<hr)/i);
    const ementa = ementaMatch ? ementaMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    // Detail link
    const detailMatch = row.match(/href="([^"]*id=\d+[^"]*)"/i);
    const detailLink = detailMatch ? detailMatch[1].replace(/&amp;/g, '&') : '';

    // PDF ID
    const pdfMatch = row.match(/name="id"\s+value="(\d+)"/i);
    const pdfId = pdfMatch ? pdfMatch[1] : '';

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

  return items;
}

const indHtml = fs.readFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/camara_ind_2026.html', 'utf8');
const reqHtml = fs.readFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/camara_req_2026.html', 'utf8');

const indicacoes = parseProposicoes(indHtml, 'Indicação');
const requerimentos = parseProposicoes(reqHtml, 'Requerimento');

console.log('\n--- INDICAÇÕES OUTUBRO 2026 ---');
const indOut2026 = indicacoes.filter(x => x.data.includes('/10/2026'));
console.log(`Found ${indOut2026.length} indicações in 10/2026:`);
indOut2026.forEach(x => console.log(`- ${x.numero} | Data: ${x.data} | Situação: ${x.situacao} | Autor: ${x.autor}\n  Ementa: ${x.ementa.slice(0, 100)}...`));

console.log('\n--- REQUERIMENTOS OUTUBRO 2026 ---');
const reqOut2026 = requerimentos.filter(x => x.data.includes('/10/2026'));
console.log(`Found ${reqOut2026.length} requerimentos in 10/2026:`);
reqOut2026.forEach(x => console.log(`- ${x.numero} | Data: ${x.data} | Situação: ${x.situacao} | Autor: ${x.autor}\n  Ementa: ${x.ementa.slice(0, 100)}...`));

// Also let's inspect all dates present in 2026 to see date distribution
console.log('\nAll dates in Indicações 2026:', [...new Set(indicacoes.map(x => x.data))]);
console.log('All dates in Requerimentos 2026:', [...new Set(requerimentos.map(x => x.data))]);

