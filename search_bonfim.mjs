async function searchBonfim() {
  const base = 'https://contenda.oxy.elotech.com.br/portaltransparencia-api';

  const queries = [
    `${base}/api/contratos?cnpjCpf=10689326000121`,
    `${base}/api/contratos?nome=BONFIM`,
    `${base}/api/contratos?credor=BONFIM`,
    `${base}/api/contratos?objeto=S%C3%A3o%20Jo%C3%A3o`,
    `${base}/api/contratos?termo=BONFIM`,
    `${base}/api/contratos?exercicio=2024`,
    `${base}/api/contratos?exercicio=2025`
  ];

  for (const q of queries) {
    try {
      const resp = await fetch(q, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const json = await resp.json();
      console.log(`Query: ${q} -> TotalElements: ${json.totalElements}`);
      if (json.content && json.content.length > 0) {
        for (const c of json.content) {
          console.log(`   - Contrato Nº ${c.numeroContrato}/${c.exercicio}: ${c.nome} | R$ ${c.valorContratado} | Situação: ${c.situacao}\n     Objeto: ${c.objeto ? c.objeto.slice(0, 100) : ''}`);
        }
      }
    } catch (e) {
      console.log(`Query error ${q}: ${e.message}`);
    }
  }
}

searchBonfim().catch(console.error);

