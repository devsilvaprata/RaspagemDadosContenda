async function testPncp() {
  const cnpj = '76105519000104';
  // Let's test PNCP public endpoints
  const endpoints = [
    `https://pncp.gov.br/api/consulta/v1/contratos?cnpjOrgao=${cnpj}&pagina=1&tamanhoPagina=10`,
    `https://pncp.gov.br/api/pncp/v1/orgaos/${cnpj}/contratos?pagina=1&tamanhoPagina=10`,
    `https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao?dataInicial=20240101&dataFinal=20261102&cnpjOrgao=${cnpj}&pagina=1&tamanhoPagina=10`
  ];

  for (const ep of endpoints) {
    console.log(`Trying ${ep}...`);
    try {
      const resp = await fetch(ep, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`Status: ${resp.status}`);
      if (resp.ok) {
        const data = await resp.json();
        console.log('Result sample:', JSON.stringify(data).slice(0, 500));
        return data;
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

testPncp().catch(console.error);

