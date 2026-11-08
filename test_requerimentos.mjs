async function testRequerimentos() {
  const url = 'https://www.camaracontenda.pr.gov.br/?pag=T0RVPU9UST1PRFk9T1dFPU9UST1PR009T1RVPU9XUT1PVGc9T1dVPQ==&tp=3&subtipo=&ano=2024&notid=&notIn=&tc=&tcNot=&sit=';
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await resp.text();
  console.log('Requerimentos 2024 HTML size:', html.length);

  // Look for records
  const matches = html.match(/Requerimento N&ordm[^<]*/gi) || [];
  console.log('Found requerimentos:', matches.slice(0, 10));

  // Let's find situations
  const sits = html.match(/<h4>Situa&ccedil;&atilde;o<\/h4>([^<]*)/gi) || [];
  console.log('Sample situations:', sits.slice(0, 10));

  // Let's get the first detail link for a Requerimento
  const detailLink = html.match(/\?pag=T0RVPU9UST1PRFk9T1dFPU9UST1PR009T1RVPU9XUT1PVGc9T1dVPU9HRT1PVFk9T1dJPU9UTT0=&id=\d+&tpBusca=requerimento/i);
  if (detailLink) {
    console.log('Detail link for requerimento:', detailLink[0]);
    const dResp = await fetch('https://www.camaracontenda.pr.gov.br/' + detailLink[0], {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const dHtml = await dResp.text();
    const dClean = dHtml.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
    const dMain = dClean.split('id="conteudo"')[1] || dClean;
    console.log('--- Detail Requerimento Preview ---');
    console.log(dMain.slice(0, 2500).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
  }
}

testRequerimentos().catch(console.error);

