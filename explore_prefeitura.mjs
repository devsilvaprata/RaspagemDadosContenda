import fs from 'fs';

async function fetchPrefeituraNews() {
  console.log('Fetching prefeitura news page...');
  const url = 'https://contenda.pr.gov.br/noticias/';
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await resp.text();
  fs.writeFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/prefeitura_noticias.html', html);
  console.log('Prefeitura news saved. Size:', html.length);

  // Look for news titles, dates, links
  const newsRegex = /<a[^>]*href=["']([^"']*(?:noticia|pagina)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  const list = [];
  while ((m = newsRegex.exec(html)) !== null) {
    const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 5) {
      list.push({ link: m[1], text });
    }
  }
  console.log('Found news/articles:', list.length);
  for (const item of list.slice(0, 20)) {
    console.log(`[${item.link}] ${item.text}`);
  }
}

fetchPrefeituraNews().catch(console.error);

