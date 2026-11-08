async function getSwaggerSpec() {
  const base = 'https://contenda.oxy.elotech.com.br/portaltransparencia-api';
  const resp = await fetch(`${base}/swagger-ui.html`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await resp.text();
  console.log('Swagger HTML size:', html.length);
  console.log(html);
}

getSwaggerSpec().catch(console.error);

