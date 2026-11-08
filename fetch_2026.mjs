import fs from 'fs';

async function fetch2026() {
  console.log('Fetching Indicações 2026...');
  const indUrl = 'https://www.camaracontenda.pr.gov.br/?pag=T0RVPU9UST1PRFk9T1dFPU9UST1PR009T1RVPU9XUT1PVGc9T1dVPQ==&tp=1&subtipo=&ano=2026&notid=&notIn=&tc=&tcNot=&sit=';
  const indResp = await fetch(indUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const indHtml = await indResp.text();
  fs.writeFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/camara_ind_2026.html', indHtml);
  console.log('Indicações 2026 saved, size:', indHtml.length);

  console.log('Fetching Requerimentos 2026...');
  const reqUrl = 'https://www.camaracontenda.pr.gov.br/?pag=T0RVPU9UST1PRFk9T1dFPU9UST1PR009T1RVPU9XUT1PVGc9T1dVPQ==&tp=3&subtipo=&ano=2026&notid=&notIn=&tc=&tcNot=&sit=';
  const reqResp = await fetch(reqUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const reqHtml = await reqResp.text();
  fs.writeFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/camara_req_2026.html', reqHtml);
  console.log('Requerimentos 2026 saved, size:', reqHtml.length);
}

fetch2026().catch(console.error);

