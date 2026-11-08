async function getContractDetails() {
  const base = 'https://contenda.oxy.elotech.com.br/portaltransparencia-api';
  const resp = await fetch(`${base}/api/contratos?nome=BONFIM`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const text = await resp.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.log('Failed to parse:', text.slice(0, 300));
    return;
  }
  const c21 = json.content.find(x => x.numeroContrato === 21 && x.exercicio === 2026);
  console.log('Contract 21/2026:', JSON.stringify(c21, null, 2));

  // Check if there are endpoints like /api/contratos/{idOxy} or /api/contratos/{idOxy}/execucao or /empenhos
  const id = c21.idOxy;
  const subEndpoints = [
    `${base}/api/contratos/${id}`,
    `${base}/api/contratos/${id}/empenhos`,
    `${base}/api/contratos/${id}/pagamentos`,
    `${base}/api/contratos/${id}/aditivos`,
    `${base}/api/contratos/${id}/itens`
  ];

  for (const ep of subEndpoints) {
    try {
      const r = await fetch(ep);
      console.log(`[${r.status}] ${ep}`);
      if (r.ok) {
        const d = await r.json();
        console.log(`Data from ${ep}:`, JSON.stringify(d).slice(0, 500));
      }
    } catch (e) {
      console.log(`Error on ${ep}:`, e.message);
    }
  }
}

getContractDetails().catch(console.error);
