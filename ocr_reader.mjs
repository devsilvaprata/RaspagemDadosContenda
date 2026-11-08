/**
 * Módulo de Leitura e OCR Inteligente dos Ofícios da Prefeitura de Contenda
 * Extrai texto mesmo de PDFs escaneados (imagens) e analisa os memorandos internos
 */

import fs from 'fs';
import path from 'path';

let tesseractWorker = null;

/**
 * Inicializa ou reaproveita o worker do Tesseract em português
 */
async function getWorker() {
  if (!tesseractWorker) {
    const { createWorker } = await import('tesseract.js');
    tesseractWorker = await createWorker('por');
  }
  return tesseractWorker;
}

/**
 * Encerra o worker para liberar memória
 */
export async function closeOcrWorker() {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
}

/**
 * Extrai imagens JPEG embutidas no PDF escaneado (fluxos DCTDecode)
 */
function extractJpegStreams(pdfBuffer) {
  const images = [];
  let pos = 0;
  const soi = Buffer.from([0xFF, 0xD8, 0xFF]);
  const eoi = Buffer.from([0xFF, 0xD9]);

  while ((pos = pdfBuffer.indexOf(soi, pos)) !== -1) {
    const end = pdfBuffer.indexOf(eoi, pos);
    if (end !== -1) {
      const imgBuf = pdfBuffer.subarray(pos, end + 2);
      // Ignorar miniaturas/thumbnails muito pequenas (< 5KB)
      if (imgBuf.length > 5000) {
        images.push(imgBuf);
      }
      pos = end + 2;
    } else {
      pos += 3;
    }
  }
  return images;
}

/**
 * Processa um arquivo PDF: se já tiver cache em .ocr.json usa o cache,
 * senão faz a extração e OCR página a página.
 */
export async function extractOficioText(pdfPath) {
  if (!fs.existsSync(pdfPath)) return null;

  const cachePath = pdfPath.replace(/\.pdf$/i, '.ocr.json');
  if (fs.existsSync(cachePath)) {
    try {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch (_) {}
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const images = extractJpegStreams(pdfBuffer);

  let fullText = '';
  const pagesText = [];

  if (images.length > 0) {
    const worker = await getWorker();
    for (let i = 0; i < images.length; i++) {
      try {
        const ret = await worker.recognize(images[i]);
        const clean = (ret.data?.text || '').trim();
        pagesText.push(clean);
        fullText += `\n--- PÁGINA ${i + 1} ---\n` + clean;
      } catch (err) {
        console.warn(`[OCR] Falha na página ${i + 1} de ${path.basename(pdfPath)}: ${err.message}`);
      }
    }
  }

  // Tentar identificar secretarias, memorandos e despachos no texto
  const parsed = parseOficioContent(fullText);
  const result = {
    pdfFile: path.basename(pdfPath),
    totalPaginas: images.length,
    fullText,
    pagesText,
    secretarias: parsed.secretarias,
    memorandos: parsed.memorandos,
    respostasPorItem: parsed.respostasPorItem
  };

  // Salva cache para execuções instantâneas posteriores
  try {
    fs.writeFileSync(cachePath, JSON.stringify(result, null, 2), 'utf8');
  } catch (_) {}

  return result;
}

/**
 * Analisa as respostas individuais de cada indicação ou requerimento no texto do ofício
 */
function parseOficioContent(text) {
  const secretarias = new Set();
  const memorandos = [];
  const respostasPorItem = {};

  // Detecção de Secretarias
  const secRegex = /Secretaria\s+Municipal\s+de\s+([A-Za-zÀ-ú\s,]+?)(?=\n|\.|,|De:)/gi;
  let sMatch;
  while ((sMatch = secRegex.exec(text)) !== null) {
    const name = sMatch[1].replace(/[\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
    if (name.length > 3 && name.length < 60) {
      secretarias.add(`Secretaria Municipal de ${name}`);
    }
  }

  // Detecção de Memorandos
  const memRegex = /MEMORANDO\s+[Nº°\s]*([\d\/]+)/gi;
  let mMatch;
  while ((mMatch = memRegex.exec(text)) !== null) {
    memorandos.push(mMatch[1].trim());
  }

  // Segmentação por INDICAÇÃO Nº XXX ou REQUERIMENTO Nº YYY
  const itemRegex = /(INDICA[ÇC][ÃA]O|REQUERIMENTO)\s+[Nº°\s]*([\d]+)/gi;
  const matches = [];
  let itMatch;
  while ((itMatch = itemRegex.exec(text)) !== null) {
    matches.push({
      tipo: itMatch[1].toUpperCase().includes('IND') ? 'IND' : 'REQ',
      numero: itMatch[2].padStart(4, '0'),
      index: itMatch.index
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const curr = matches[i];
    const nextIndex = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const itemBlock = text.slice(curr.index, nextIndex).trim();

    // Extrair o miolo da resposta
    const linhas = itemBlock.split('\n').map(l => l.trim()).filter(Boolean);
    const respostaTexto = linhas.slice(1).join(' ');

    // Classificar intenção/prazo
    let previsaoPrazo = 'Sem prazo explícito';
    const prazoMatch = respostaTexto.match(/prazo\s+de\s+(?:at[ée]\s+)?(\d+\s*\([^\)]+\)\s*dias|\d+\s*dias)/i);
    if (prazoMatch) {
      previsaoPrazo = prazoMatch[0];
    } else if (/fase\s+de\s+elabora[çc][ãa]o/i.test(respostaTexto)) {
      previsaoPrazo = 'Em elaboração de projeto';
    } else if (/inclu[íi]d[ao]\s+no\s+cronograma/i.test(respostaTexto)) {
      previsaoPrazo = 'Incluído no cronograma';
    } else if (/realizad[ao]|conclu[íi]d[ao]/i.test(respostaTexto)) {
      previsaoPrazo = 'Serviço concluído/atendido';
    }

    respostasPorItem[`${curr.tipo}_${curr.numero}`] = {
      tipo: curr.tipo,
      numero: curr.numero,
      textoBruto: respostaTexto.slice(0, 800),
      previsaoPrazo
    };
  }

  return {
    secretarias: Array.from(secretarias),
    memorandos,
    respostasPorItem
  };
}

