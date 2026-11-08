async function testDespesasEndpoints() {
  const base = 'https://contenda.oxy.elotech.com.br/portaltransparencia-api';
  const candidates = [
    '/api/despesa',
    '/api/despesas',
    '/api/empenhos',
    '/api/empenho',
    '/api/pagamentos',
    '/api/pagamento',
    '/api/despesa/pesquisa',
    '/api/despesas/pesquisa',
    '/api/empenhos/pesquisa',
    '/api/liquidacoes'
  ];

  for (const c of candidates) {
    try {
      const resp = await fetch(`${base}${c}?pagina=1&quantidade=5`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`[${resp.status}] ${c}`);
      if (resp.status === 200) {
        const d = await resp.json();
        console.log(`  Keys for ${c}:`, Object.keys(d));
      }
    } catch (e) {
      console.log(`Error ${c}:`, e.message);
    }
  }
}

testDespesasEndpoints().catch(console.error);

