async function findApiRoutes() {
  const url = 'https://contenda.oxy.elotech.com.br/portaltransparencia/static/js/main.0d4cf918.chunk.js';
  const resp = await fetch(url);
  const text = await resp.text();
  console.log('main.chunk size:', text.length);

  // Search for api endpoints, like "/api/" or "licitac" or "contrat" or "empenh"
  const matches = text.match(/(?:\/api\/|\/portaltransparencia\/api\/)[a-zA-Z0-9_\-\/]+/g) || [];
  console.log('API routes found:', [...new Set(matches)]);

  const otherRoutes = text.match(/\/transparencia\/[a-zA-Z0-9_\-\/]+/g) || [];
  console.log('Other routes:', [...new Set(otherRoutes)].slice(0, 20));
}

findApiRoutes().catch(console.error);

