import fs from 'fs';

async function testCamaraProposicoes() {
  const url = 'https://www.camaracontenda.pr.gov.br/?pag=T0RVPU9UST1PRFk9T1dFPU9UST1PR009T1RVPU9XUT1PVGc9T1dVPQ==&&tp=1';
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await resp.text();
  fs.writeFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/camara_indicacoes_sample.html', html);
  console.log('Saved html. Size:', html.length);

  // Search for forms, tables, pagination, inputs
  const forms = html.match(/<form[\s\S]*?<\/form>/gi) || [];
  console.log('Forms found:', forms.length);
  for (const f of forms) {
    console.log('Form action/method:', f.slice(0, 200));
  }

  // Look for records or table rows
  const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
  console.log('Tables found:', tables.length);

  // Look for text fragments like "Indicação", "Número", "Autor", "Situação"
  const snippets = html.match(/(?:indica[çc][ãa]o|requerimento|autor|situa[çc][ãa]o|ementa|protocolo|resposta)[^<]{0,100}/gi) || [];
  console.log('Sample matches:', snippets.slice(0, 15));
}

testCamaraProposicoes().catch(console.error);
