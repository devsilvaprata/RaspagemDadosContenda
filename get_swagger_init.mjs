async function getSwaggerInit() {
  const base = 'https://contenda.oxy.elotech.com.br/portaltransparencia-api';
  const resp = await fetch(`${base}/swagger-initializer.js`);
  const text = await resp.text();
  console.log('swagger-initializer.js:');
  console.log(text);
}

getSwaggerInit().catch(console.error);

