/**
 * Automação de Raspagem e Auditoria Integrada:
 * Câmara Municipal vs. Prefeitura de Contenda (PR)
 * 
 * Funcionalidades Integradas:
 * 1. Raspagem de Indicações e Requerimentos da Câmara
 * 2. Download e Leitura OCR Profunda de Ofícios da Prefeitura (PDFs escaneados)
 * 3. Cruzamento com Portal da Transparência (Elotech) e PNCP Federal
 * 4. Georreferenciamento de Localidades de Contenda e Classificação Temática
 * 5. Armazenamento em Banco de Dados Analítico Local (SQLite)
 * 6. Geração de Planilha CSV (Excel), Relatório Markdown e Dashboard Web Interativo
 * 
 * Uso:
 *   node contenda_sync.mjs [mes] [ano]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchFinancialData, formatMoedaBRL } from './financial_module.mjs';
import { matchPncpContracts } from './pncp_module.mjs';
import { extractOficioText, closeOcrWorker } from './ocr_reader.mjs';
import { detectLocalidade, detectTema } from './geo_module.mjs';
import { saveBatchToDb } from './db_storage.mjs';
import { generateDashboardHtml } from './dashboard_generator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obter argumentos de linha de comando ou definir padrões
const args = process.argv.slice(2);
const now = new Date();
const targetMonth = args[0] ? parseInt(args[0], 10) : (now.getDate() < 5 ? (now.getMonth() === 0 ? 12 : now.getMonth()) : (now.getMonth() + 1));
const targetYear = args[1] ? parseInt(args[1], 10) : (now.getMonth() === 0 && now.getDate() < 5 ? now.getFullYear() - 1 : now.getFullYear());

const monthPadded = String(targetMonth).padStart(2, '0');

console.log(`====================================================`);
console.log(`   SISTEMA DE AUDITORIA E TRANSPARÊNCIA INTEGRADA`);
console.log(`     Câmara Municipal vs. Prefeitura de Contenda`);
console.log(`   Período Alvo: ${monthPadded}/${targetYear}`);
console.log(`====================================================\n`);

const BASE_URL = 'https://www.camaracontenda.pr.gov.br';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const oficiosDir = path.join(__dirname, 'oficios', `${targetYear}_${monthPadded}`);
if (!fs.existsSync(oficiosDir)) {
  fs.mkdirSync(oficiosDir, { recursive: true });
}

async function fetchHtml(url) {
  const resp = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} em ${url}`);
  return await resp.text();
}

function parseItems(html, tipoNome) {
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/gi);
  if (!tbodyMatch || tbodyMatch.length < 3) return [];
  const mainTable = tbodyMatch[2];
  const rows = mainTable.split(/<tr>\s*<td>/gi).slice(1);

  const items = [];
  for (const row of rows) {
    const titleMatch = row.match(/<h4>([^<]+N&ordm[^<]+)<\/h4>/i) || row.match(/<h4>([^<]+)<\/h4>/i);
    const numero = titleMatch ? titleMatch[1].replace(/&ordm;?/g, 'º').replace(/&ccedil;/g, 'ç').replace(/&atilde;/g, 'ã').trim() : '';

    const dataMatch = row.match(/<h4>Data Inicial:<\/h4>\s*([^<]+)/i) || row.match(/(\d{2}\/\d{2}\/\d{4})/);
    const data = dataMatch ? dataMatch[1].trim() : '';

    const sitMatch = row.match(/<h4>Situa&ccedil;&atilde;o<\/h4>\s*([^<]+)/i);
    const situacao = sitMatch ? sitMatch[1].replace(/&ccedil;/g, 'ç').replace(/&atilde;/g, 'ã').trim() : '';

    const autorMatch = row.match(/<h4>Autor:<\/h4>\s*([^<]+)/i);
    const autor = autorMatch ? autorMatch[1].trim() : '';

    const ementaMatch = row.match(/<h4>Ementa:<\/h4>\s*([\s\S]*?)(?:<\/div>|<hr)/i);
    const ementa = ementaMatch ? ementaMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    const detailMatch = row.match(/href="([^"]*id=\d+[^"]*)"/i);
    const detailLink = detailMatch ? detailMatch[1].replace(/&amp;/g, '&') : '';

    const pdfMatch = row.match(/name="id"\s+value="(\d+)"/i);
    const pdfId = pdfMatch ? pdfMatch[1] : '';

    if (numero && data) {
      items.push({
        tipo: tipoNome,
        numero,
        data,
        situacao,
        autor,
        ementa,
        detailLink,
        pdfId
      });
    }
  }
  return items;
}

function parseDate(dStr) {
  const parts = dStr.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return null;
}

async function scrapeTipo(tp, tipoNome) {
  const results = [];
  let pg = 1;
  let keepGoing = true;

  while (keepGoing) {
    const url = `${BASE_URL}/?pag=T0RVPU9UST1PRFk9T1dFPU9UST1PR009T1RVPU9XUT1PVGc9T1dVPQ==&&ano=${targetYear}&&tp=${tp}&codAutor=&numFom=&ementaForm=&subtipo=&pg=${pg}`;
    process.stdout.write(`-> Coletando ${tipoNome} (página ${pg})...\r`);
    
    let html = '';
    try {
      html = await fetchHtml(url);
    } catch (err) {
      console.error(`\nErro na página ${pg}: ${err.message}`);
      break;
    }

    const items = parseItems(html, tipoNome);
    if (items.length === 0) break;

    for (const item of items) {
      const dt = parseDate(item.data);
      if (!dt) continue;

      if (dt.getFullYear() === targetYear && dt.getMonth() === (targetMonth - 1)) {
        results.push(item);
      } else if (dt.getFullYear() < targetYear || (dt.getFullYear() === targetYear && dt.getMonth() < (targetMonth - 1))) {
        keepGoing = false;
        break;
      }
    }

    pg++;
    if (pg > 50) break;
  }

  console.log(`\n✔ ${tipoNome}: ${results.length} registros encontrados em ${monthPadded}/${targetYear}.`);
  return results;
}

async function downloadOficioPdf(nomeArquivo, fileId, numStr) {
  const safeName = `oficio_${numStr.replace(/[^0-9a-zA-Z_-]/g, '_')}.pdf`;
  const destPath = path.join(oficiosDir, safeName);
  if (fs.existsSync(destPath)) return destPath;

  const url = `${BASE_URL}/indexAjax.php?pag=T0RJPU9UVT1PVFE9T1dFPU9HVT1PV1E9T1RZPQ==`;
  const formData = new URLSearchParams();
  formData.append('pag', 'T0RJPU9UVT1PVFE9T1dFPU9HVT1PV1E9T1RZPQ=');
  formData.append('nome_arquivo', nomeArquivo);
  formData.append('nome_tabela', 'pdf_protocolo_dinamico_2');
  formData.append('id', fileId);
  formData.append('idtipolei', '');
  formData.append('mostraDataCodigoIndividial', 'false');
  formData.append('descricao', '.pdf');
  formData.append('download', '');

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
    const text = await resp.text();
    const m = text.match(/location\.href=['"]\.\/temp\/([^'"]+)['"]/);
    if (m) {
      const pdfResp = await fetch(`${BASE_URL}/temp/${m[1]}`, { headers: { 'User-Agent': USER_AGENT } });
      const buf = await pdfResp.arrayBuffer();
      fs.writeFileSync(destPath, Buffer.from(buf));
      return destPath;
    }
  } catch (err) {
    // Ignora falha de download
  }
  return null;
}

async function enrichWithResponsesAndFinance(items) {
  console.log(`\n-> Cruzando dados, extraindo OCR de ofícios e consultando contratos...`);
  const enriched = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    process.stdout.write(`   [${i + 1}/${items.length}] Auditando ${item.numero}...\r`);

    let responses = [];
    if (item.detailLink) {
      try {
        const fullUrl = `${BASE_URL}/${item.detailLink}`;
        const html = await fetchHtml(fullUrl);

        const rIdx = html.indexOf('<h3 class="tituloPagina">Respostas</h3>');
        if (rIdx !== -1) {
          const sub = html.slice(rIdx, rIdx + 3000);
          const tMatch = sub.match(/<table[\s\S]*?<\/table>/i);
          if (tMatch) {
            const tRows = tMatch[0].match(/<tr>([\s\S]*?)<\/tr>/gi) || [];
            for (const tr of tRows.slice(1)) {
              const tds = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
              if (tds.length >= 3) {
                const numOficio = tds[0].replace(/<[^>]+>/g, '').trim();
                const dataOficio = tds[1].replace(/<[^>]+>/g, '').trim();
                const assuntoOficio = tds[2].replace(/<[^>]+>/g, '').trim();

                const fMatch = tr.match(/name="nome_arquivo"\s+value="([^"]+)"/i);
                const filePdf = fMatch ? fMatch[1] : '';

                const idMatch = tr.match(/name="id"\s+value="(\d+)"/i);
                const fileId = idMatch ? idMatch[1] : '';

                let localPdf = null;
                if (filePdf && fileId) {
                  localPdf = await downloadOficioPdf(filePdf, fileId, numOficio);
                }

                responses.push({
                  numOficio,
                  dataOficio,
                  assuntoOficio,
                  filePdf,
                  localPdf: localPdf ? path.basename(localPdf) : null,
                  localPdfFullPath: localPdf
                });
              }
            }
          }
        }
      } catch (err) {}
    }

    // Georreferenciamento e Tema
    const loc = detectLocalidade(item.ementa);
    const tema = detectTema(item.ementa);

    // Leitura OCR detalhada do primeiro ofício vinculado se houver
    let ocrInfo = null;
    let despachoTexto = '';
    let previsaoPrazo = 'Sem prazo explícito';
    let secretariaResponsavel = '';

    if (responses.length > 0 && responses[0].localPdfFullPath) {
      ocrInfo = await extractOficioText(responses[0].localPdfFullPath);
      if (ocrInfo) {
        secretariaResponsavel = (ocrInfo.secretarias && ocrInfo.secretarias[0]) || '';
        
        // Buscar se o item tem resposta específica identificada no OCR
        const numDigitos = (item.numero.match(/\d+/) || [''])[0].padStart(4, '0');
        const prefixo = item.tipo === 'Indicação' ? 'IND' : 'REQ';
        const itemKey = `${prefixo}_${numDigitos}`;

        if (ocrInfo.respostasPorItem && ocrInfo.respostasPorItem[itemKey]) {
          const respItem = ocrInfo.respostasPorItem[itemKey];
          despachoTexto = respItem.textoBruto;
          previsaoPrazo = respItem.previsaoPrazo;
        } else {
          despachoTexto = ocrInfo.fullText.slice(0, 500);
        }
      }
    }

    const respondido = responses.length > 0;
    const itemBase = {
      ...item,
      temResposta: respondido,
      statusGeral: respondido ? 'Respondido' : 'Pendente',
      respostasExecutivo: responses,
      localidade: loc.nome,
      lat: loc.lat,
      lng: loc.lng,
      tema: tema.tema,
      temaCor: tema.cor,
      secretariaResponsavel,
      previsaoPrazo,
      ocrTextoCompleto: despachoTexto
    };

    // Cruzamento financeiro duplo: Elotech (Municipal) + PNCP (Federal)
    const contratosElotech = await matchFinancialData(itemBase);
    const contratosPncp = await matchPncpContracts(itemBase.ementa);

    // Unificar contratos evitando duplicados
    const contratosUnificados = [...contratosElotech];
    for (const cp of contratosPncp) {
      if (!contratosUnificados.some(c => (c.fornecedor || '').toLowerCase() === (cp.fornecedor || '').toLowerCase())) {
        contratosUnificados.push({
          displayContrato: cp.numeroContrato,
          fornecedor: cp.fornecedor,
          cnpjCpf: cp.cnpjFornecedor,
          valorTotal: cp.valorGlobal,
          valorContratado: cp.valorGlobal,
          situacao: 'Publicado no PNCP',
          modalidadeLicitacao: 'Contratação Pública',
          displayLicitacao: cp.numeroControlePncp || '-',
          objeto: cp.objeto,
          vigencia: cp.vigenciaFim || '-',
          fonte: 'PNCP'
        });
      }
    }

    enriched.push({
      ...itemBase,
      contratos: contratosUnificados,
      contratosVinculados: contratosUnificados
    });
  }

  await closeOcrWorker();
  console.log(`\n✔ Processamento analítico, OCR e cruzamento finalizados com sucesso!`);
  return enriched;
}

async function exportOutputs(data) {
  const jsonPath = path.join(__dirname, `comparativo_${targetYear}_${monthPadded}.json`);
  const csvPath = path.join(__dirname, `comparativo_${targetYear}_${monthPadded}.csv`);
  const mdPath = path.join(__dirname, `relatorio_${targetYear}_${monthPadded}.md`);
  const dashboardPath = path.join(__dirname, `dashboard_${targetYear}_${monthPadded}.html`);
  const mainDashboardPath = path.join(__dirname, `dashboard.html`);

  // 1. Salvar no Banco de Dados SQLite Local
  saveBatchToDb(data, targetMonth, targetYear);

  // 2. JSON
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

  // 3. CSV
  let csv = 'Tipo;Número;Data Proposição;Autor;Localidade;Tema;Ementa;Status Prefeitura;Ofício de Resposta;Data da Resposta;Secretaria;Prazo Oficial;Contrato Licitação;Fornecedor;Valor Contratado (R$);Arquivo PDF\n';
  const escapeCsv = (s) => `"${(s || '').toString().replace(/"/g, '""').replace(/\r?\n|\r/g, ' ')}"`;

  for (const item of data) {
    const contratosStr = item.contratos.map(c => `Contrato ${c.displayContrato}`).join(' | ') || '-';
    const fornecedoresStr = item.contratos.map(c => `${c.fornecedor} (CNPJ: ${c.cnpjCpf})`).join(' | ') || '-';
    const valoresStr = item.contratos.map(c => formatMoedaBRL(c.valorTotal)).join(' | ') || '-';

    if (item.respostasExecutivo.length > 0) {
      for (const r of item.respostasExecutivo) {
        csv += [
          escapeCsv(item.tipo),
          escapeCsv(item.numero),
          escapeCsv(item.data),
          escapeCsv(item.autor),
          escapeCsv(item.localidade),
          escapeCsv(item.tema),
          escapeCsv(item.ementa),
          escapeCsv(item.statusGeral),
          escapeCsv(r.numOficio),
          escapeCsv(r.dataOficio),
          escapeCsv(item.secretariaResponsavel || '-'),
          escapeCsv(item.previsaoPrazo || '-'),
          escapeCsv(contratosStr),
          escapeCsv(fornecedoresStr),
          escapeCsv(valoresStr),
          escapeCsv(r.localPdf || r.filePdf)
        ].join(';') + '\n';
      }
    } else {
      csv += [
        escapeCsv(item.tipo),
        escapeCsv(item.numero),
        escapeCsv(item.data),
        escapeCsv(item.autor),
        escapeCsv(item.localidade),
        escapeCsv(item.tema),
        escapeCsv(item.ementa),
        escapeCsv(item.statusGeral),
        escapeCsv('-'),
        escapeCsv('-'),
        escapeCsv('-'),
        escapeCsv('-'),
        escapeCsv(contratosStr),
        escapeCsv(fornecedoresStr),
        escapeCsv(valoresStr),
        escapeCsv('-')
      ].join(';') + '\n';
    }
  }
  fs.writeFileSync(csvPath, '\uFEFF' + csv, 'utf8');

  // 4. Relatório Markdown Detalhado
  const respondidosCount = data.filter(x => x.statusGeral === 'Respondido').length;
  const pendentesCount = data.length - respondidosCount;
  const comContrato = data.filter(x => x.contratos.length > 0);
  const comPrazoOficial = data.filter(x => x.previsaoPrazo && x.previsaoPrazo !== 'Sem prazo explícito').length;

  let md = `# Relatório Comparativo de Transparência e Auditoria Pública
### Câmara Municipal vs. Prefeitura de Contenda (PR)
**Mês de Referência:** ${monthPadded}/${targetYear}  
**Data da Auditoria:** ${new Date().toLocaleDateString('pt-BR')}  

---

### Resumo Executivo
- **Total de Pedidos Coletados:** ${data.length} proposições
- **Taxa de Atendimento:** ${respondidosCount} respondidas (${data.length > 0 ? ((respondidosCount / data.length) * 100).toFixed(1) : 0}%)
- **Pedidos Aguardando Resposta:** ${pendentesCount}
- **Compromissos com Prazos Oficiais da Prefeitura:** ${comPrazoOficial}
- **Contratos e Licitações Auditadas:** ${comContrato.length}

---

## Destaque: Contratações Públicas e Licitações Fiscalizadas (Valores em R$)

| Proposição | Objeto Fiscalizado | Contrato / Licitação | Fornecedor / Vencedor | Valor Contratado (R$) | Fonte |
| :--- | :--- | :--- | :--- | :---: | :---: |
`;

  for (const item of comContrato) {
    for (const c of item.contratos) {
      md += `| **${item.numero}** | ${item.ementa.slice(0, 80)}... | Contrato nº **${c.displayContrato}** | **${c.fornecedor}**<br>CNPJ: \`${c.cnpjCpf}\` | **${formatMoedaBRL(c.valorTotal)}** | ${c.fonte || 'Elotech'} |\n`;
    }
  }

  md += `\n---

## Tabela Completa de Fiscalização das Proposições

| Proposição | Localidade / Tema | Autor | Resumo do Pedido | Status | Prazo / Despacho | Contrato / Valor (R$) |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
`;

  for (const item of data) {
    const oficiosStr = item.respostasExecutivo.length > 0
      ? item.respostasExecutivo.map(r => `**Ofício ${r.numOficio}**: ${r.assuntoOficio}`).join('<br>')
      : '*Sem resposta registrada*';
    
    const valorResumo = item.contratos.length > 0
      ? item.contratos.map(c => `${formatMoedaBRL(c.valorTotal)} (${c.fornecedor})`).join('<br>')
      : '-';

    const despachoInfo = item.previsaoPrazo && item.previsaoPrazo !== 'Sem prazo explícito'
      ? `**Compromisso:** ${item.previsaoPrazo}<br>${oficiosStr}`
      : oficiosStr;

    md += `| **${item.numero}** | ${item.localidade}<br>*${item.tema}* | ${item.autor} | ${item.ementa.slice(0, 100)}... | **${item.statusGeral}** | ${despachoInfo} | ${valorResumo} |\n`;
  }

  fs.writeFileSync(mdPath, md, 'utf8');

  // 5. Dashboard HTML Interativo (salva versão do mês e versão principal)
  generateDashboardHtml(data, dashboardPath);
  generateDashboardHtml(data, mainDashboardPath);

  console.log(`\n====================================================`);
  console.log(`✔ Ecossistema de Transparência Atualizado:`);
  console.log(`   - 🌐 Dashboard Web Interativo: ${mainDashboardPath}`);
  console.log(`   - 📊 Banco SQLite Local: contenda_transparencia.sqlite`);
  console.log(`   - 📗 Planilha Excel (CSV): ${csvPath}`);
  console.log(`   - 📝 Relatório Detalhado: ${mdPath}`);
  console.log(`   - 📂 Ofícios e Textos OCR: oficios/${targetYear}_${monthPadded}/`);
  console.log(`====================================================\n`);
}

async function main() {
  const indicacoes = await scrapeTipo(1, 'Indicação');
  const requerimentos = await scrapeTipo(3, 'Requerimento');
  const todos = [...indicacoes, ...requerimentos];

  if (todos.length === 0) {
    console.log(`\nNenhuma proposição encontrada para o período ${monthPadded}/${targetYear}.`);
    return;
  }

  const enriquecidos = await enrichWithResponsesAndFinance(todos);
  await exportOutputs(enriquecidos);
}

main().catch(console.error);
