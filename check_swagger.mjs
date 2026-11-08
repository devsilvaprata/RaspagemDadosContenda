async function checkSwaggerDocs() {
  const base = 'https://contenda.oxy.elotech.com.br/portaltransparencia-api';
  const urls = [
    `${base}/v2/api-docs`,
    `${base}/v3/api-docs`
  ];

  for (const u of urls) {
    try {
      const resp = await fetch(u);
      if (resp.ok) {
        const json = await resp.json();
        console.log(`Success on ${u}!`);
        // Find /api/contratos parameters
        const paths = json.paths || {};
        if (paths['/api/contratos']) {
          console.log('Parameters for /api/contratos:');
          console.log(JSON.stringify(paths['/api/contratos'], null, 2).slice(0, 2000));
        }
        return;
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

checkSwaggerDocs().catch(console.error);

