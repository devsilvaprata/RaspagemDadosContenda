async function exploreElotech() {
  const url = 'https://contenda.oxy.elotech.com.br/portaltransparencia/1/';
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await resp.text();
  console.log('Elotech home size:', html.length);

  // Look for links to licitacao, contrato, despesa, empenho
  const links = html.match(/href=["']([^"']*(?:licita|contrat|despes|empenh|compr)[^"']*)["']/gi) || [];
  console.log('Relevant Elotech links:', links);
}

exploreElotech().catch(console.error);

