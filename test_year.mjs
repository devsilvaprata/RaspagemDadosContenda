async function testYear() {
  const url = 'https://www.camaracontenda.pr.gov.br/?pag=T0RVPU9UST1PRFk9T1dFPU9UST1PR009T1RVPU9XUT1PVGc9T1dVPQ==&tp=1&subtipo=&ano=2024&notid=&notIn=&tc=&tcNot=&sit=';
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await resp.text();
  console.log('Fetched 2024. Size:', html.length);

  // Look for tables or items
  const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
  console.log('Tables found:', tables.length);
  if (tables.length > 2) {
    console.log('--- Table 2 preview ---');
    console.log(tables[2].slice(0, 3000));
  }
}

testYear().catch(console.error);

