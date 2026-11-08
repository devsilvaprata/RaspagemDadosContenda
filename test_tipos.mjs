async function testTipos() {
  // Let's test tp=1,2,3,4,5,6,7,8,9,10,11,12...
  // In Webline Sistemas, tp usually corresponds to:
  // 1: Indicação
  // 2: Moção?
  // 3: Requerimento
  // 4: Projeto de Lei Ordinária?
  // 5: Projeto de Lei Complementar?
  // 6: Projeto de Decreto Legislativo?
  // ...
  // Let's test what tp values return a valid heading!
  for (let tp = 1; tp <= 15; tp++) {
    const url = `https://www.camaracontenda.pr.gov.br/?pag=T0RVPU9UST1PRFk9T1dFPU9UST1PR009T1RVPU9XUT1PVGc9T1dVPQ==&tp=${tp}`;
    try {
      const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await resp.text();
      // Look for title/breadcrumb
      const m = html.match(/<ol class="breadcrumb">([\s\S]*?)<\/ol>/i);
      const breadcrumb = m ? m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : 'none';
      
      // Also look for page title or header
      const titleMatch = html.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi) || [];
      const titles = titleMatch.map(t => t.replace(/<[^>]+>/g, '').trim()).filter(t => t.length > 2 && !t.includes('Buscar') && !t.includes('Redes') && !t.includes('Acessibilidade')).slice(0, 3);
      
      console.log(`tp=${tp}: Breadcrumb=[${breadcrumb}] Titles=[${titles.join(' | ')}]`);
    } catch (e) {
      console.log(`tp=${tp} error:`, e.message);
    }
  }
}

testTipos().catch(console.error);

