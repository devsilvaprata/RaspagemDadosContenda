async function testKeywordSearch() {
  const base = 'https://contenda.oxy.elotech.com.br/portaltransparencia-api';

  const keywords = ['BONFIM', 'ILUMINACAO', 'LABORATORIO', 'MEDICO', 'OBRAS', 'CREDENCIAMENTO', 'TERCEIRIZACAO'];

  for (const kw of keywords) {
    try {
      // test searching via nome or termo
      const resp = await fetch(`${base}/api/contratos?nome=${encodeURIComponent(kw)}&pagina=1&quantidade=5`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const data = await resp.json();
      console.log(`Keyword [${kw}]: ${data.totalElements} contratos encontrados.`);
      if (data.content && data.content.length > 0) {
        for (const c of data.content.slice(0, 2)) {
          console.log(`   - Contrato ${c.numeroContrato}/${c.exercicio}: ${c.nome} | R$ ${c.valorContratado} | Objeto: ${c.objeto ? c.objeto.slice(0, 80) : ''}...`);
        }
      }
    } catch (e) {
      console.log(`Error on ${kw}:`, e.message);
    }
  }
}

testKeywordSearch().catch(console.error);

