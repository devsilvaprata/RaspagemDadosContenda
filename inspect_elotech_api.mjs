async function inspectApi() {
  const base = 'https://contenda.oxy.elotech.com.br/portaltransparencia-api';

  console.log('Querying api/contratos...');
  const resp = await fetch(`${base}/api/contratos?pagina=1&quantidade=5`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  console.log('Status contratos:', resp.status);
  const data = await resp.json();
  console.log('Sample contratos response keys:', Object.keys(data));
  console.log('Sample item:', JSON.stringify(data).slice(0, 800));

  console.log('\nQuerying api/licitacoes...');
  const lResp = await fetch(`${base}/api/licitacoes?pagina=1&quantidade=5`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  console.log('Status licitacoes:', lResp.status);
  const lData = await lResp.json();
  console.log('Sample licitacoes response keys:', Object.keys(lData));
  console.log('Sample licitacao item:', JSON.stringify(lData).slice(0, 800));
}

inspectApi().catch(console.error);

