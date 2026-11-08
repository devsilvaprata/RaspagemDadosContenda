import fs from 'fs';

async function fetchPage(url) {
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  return await resp.text();
}

async function run() {
  console.log('Fetching camara...');
  const camaraHtml = await fetchPage('https://www.camaracontenda.pr.gov.br/');
  
  // Extract all <a ... href="...">...</a>
  const regex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
  let match;
  const camaraLinks = [];
  while ((match = regex.exec(camaraHtml)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    if (text) {
      camaraLinks.push({ text, href });
    }
  }
  
  console.log('--- CAMARA LINKS ---');
  for (const l of camaraLinks) {
    if (l.text.toLowerCase().includes('processo') || 
        l.text.toLowerCase().includes('indica') || 
        l.text.toLowerCase().includes('requer') || 
        l.text.toLowerCase().includes('legisla') || 
        l.text.toLowerCase().includes('sess') || 
        l.text.toLowerCase().includes('ofício') ||
        l.text.toLowerCase().includes('oficio') ||
        l.text.toLowerCase().includes('tramita') ||
        l.text.toLowerCase().includes('proposi')) {
      console.log(`[${l.text}] -> ${l.href}`);
    }
  }

  console.log('\nFetching prefeitura...');
  const prefHtml = await fetchPage('https://contenda.pr.gov.br/');
  const prefLinks = [];
  while ((match = regex.exec(prefHtml)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    if (text) {
      prefLinks.push({ text, href });
    }
  }

  console.log('--- PREFEITURA LINKS ---');
  for (const l of prefLinks) {
    if (l.text.toLowerCase().includes('camara') || 
        l.text.toLowerCase().includes('câmara') || 
        l.text.toLowerCase().includes('indica') || 
        l.text.toLowerCase().includes('requer') || 
        l.text.toLowerCase().includes('legisla') || 
        l.text.toLowerCase().includes('ofício') ||
        l.text.toLowerCase().includes('oficio') ||
        l.text.toLowerCase().includes('diário') ||
        l.text.toLowerCase().includes('diario') ||
        l.text.toLowerCase().includes('transpar') ||
        l.text.toLowerCase().includes('e-sic') ||
        l.text.toLowerCase().includes('sic')) {
      console.log(`[${l.text}] -> ${l.href}`);
    }
  }
}

run().catch(console.error);

