/**
 * Módulo de Integração com o PNCP (Portal Nacional de Contratações Públicas)
 * Município de Contenda - PR (CNPJ: 76.105.519/0001-04)
 */

import fs from 'fs';
import path from 'path';

const CNPJ_CONTENDA = '76105519000104';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// Cache em arquivo local para evitar requisições repetidas ao governo federal
const CACHE_FILE = path.join(process.cwd(), 'pncp_contratos_cache.json');
let pncpCache = null;

function loadCache() {
  if (pncpCache) return pncpCache;
  if (fs.existsSync(CACHE_FILE)) {
    try {
      pncpCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      return pncpCache;
    } catch (_) {}
  }
  pncpCache = [];
  return pncpCache;
}

function saveCache(data) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (_) {}
}

/**
 * Busca contratos no PNCP para o ano especificado
 */
export async function fetchPncpContratos(ano = 2026) {
  const cached = loadCache();
  if (cached.length > 0) return cached;

  const dataInicial = `${ano}0101`;
  const dataFinal = `${ano}1231`;
  const url = `https://pncp.gov.br/api/consulta/v1/contratos?dataInicial=${dataInicial}&dataFinal=${dataFinal}&cnpjOrgao=${CNPJ_CONTENDA}&pagina=1&tamanhoPagina=50`;

  try {
    const resp = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!resp.ok) return [];

    const json = await resp.json();
    const list = (json.data || []).map(c => ({
      fonte: 'PNCP',
      numeroContrato: c.numeroContratoEmpenho || `${c.sequencialContrato}/${c.anoContrato}`,
      ano: c.anoContrato,
      objeto: c.objetoContrato || '',
      fornecedor: c.nomeRazaoSocialFornecedor || '',
      cnpjFornecedor: c.niFornecedor || '',
      valorGlobal: c.valorGlobal || c.valorInicial || 0,
      valorAcumulado: c.valorAcumulado || 0,
      dataAssinatura: c.dataAssinatura || '',
      vigenciaFim: c.dataVigenciaFim || '',
      numeroControlePncp: c.numeroControlePNCP || ''
    }));

    pncpCache = list;
    saveCache(list);
    return list;
  } catch (err) {
    console.warn(`[PNCP] Erro na consulta do PNCP: ${err.message}`);
    return [];
  }
}

/**
 * Cruza o texto de uma proposição com contratos do PNCP
 */
export async function matchPncpContracts(texto) {
  const clean = texto.toLowerCase();
  const contratos = await fetchPncpContratos();
  const matches = [];

  for (const c of contratos) {
    const obj = (c.objeto || '').toLowerCase();
    const forn = (c.fornecedor || '').toLowerCase();

    // Palavras-chave relevantes com peso
    const keywords = [
      'asfalto', 'paviment', 'revitaliza', 'escola', 'merenda', 'ilumina',
      'lâmpada', 'led', 'exame', 'laborat', 'pneu', 'transporte', 'limpeza', 'veículo'
    ];

    for (const kw of keywords) {
      if (clean.includes(kw) && (obj.includes(kw) || forn.includes(kw))) {
        matches.push(c);
        break;
      }
    }
  }

  return matches;
}

