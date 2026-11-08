async function testElotechApi() {
  const base = 'https://contenda.oxy.elotech.com.br/portaltransparencia-api';
  const endpoints = [
    `${base}/swagger-ui.html`,
    `${base}/swagger-ui/index.html`,
    `${base}/api/licitacoes`,
    `${base}/api/contratos`,
    `${base}/api/despesas`,
    `${base}/api/licitacao/pesquisa`,
    `${base}/api/contrato/pesquisa`
  ];

  for (const ep of endpoints) {
    try {
      const resp = await fetch(ep, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`[${resp.status}] ${ep}`);
    } catch (e) {
      console.log(`[ERROR] ${ep}: ${e.message}`);
    }
  }
}

testElotechApi().catch(console.error);

