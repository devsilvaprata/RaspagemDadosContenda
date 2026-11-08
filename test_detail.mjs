async function testDetails() {
  const url = 'https://www.camaracontenda.pr.gov.br/?pag=T0RVPU9UST1PRFk9T1dFPU9UST1PR009T1RVPU9XUT1PVGc9T1dVPU9HRT1PVFk9T1dJPU9UTT0=&id=3389&tpBusca=indicacao';
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await resp.text();
  console.log('Detail HTML size:', html.length);

  // Look for headings, tables, or sections in the detail page
  const clean = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                    .replace(/<style[\s\S]*?<\/style>/gi, '');
  
  // Find where the id=conteudo or main content starts
  const mainPart = clean.split('id="conteudo"')[1] || clean;
  console.log('--- Detail Main Content Preview ---');
  console.log(mainPart.slice(0, 4000).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
}

testDetails().catch(console.error);

