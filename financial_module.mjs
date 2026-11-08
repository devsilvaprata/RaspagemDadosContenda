/**
 * Módulo Financeiro e de Licitações - Portal da Transparência de Contenda (PR)
 * Conecta demandas legislativas e respostas com os contratos e valores reais (R$)
 */

const BASE_ELOTECH_API = 'https://contenda.oxy.elotech.com.br/portaltransparencia-api';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Cache em memória para evitar requisições repetidas
const contractsCache = new Map();

/**
 * Consulta a API de Contratos do Portal da Transparência da Prefeitura
 */
export async function searchContracts(query) {
  if (!query || query.trim().length < 3) return [];
  const cleanQ = query.trim().toUpperCase();

  if (contractsCache.has(cleanQ)) {
    return contractsCache.get(cleanQ);
  }

  const url = `${BASE_ELOTECH_API}/api/contratos?nome=${encodeURIComponent(cleanQ)}&pagina=1&quantidade=10`;
  try {
    const resp = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!resp.ok) return [];
    const data = await resp.json();
    const results = (data.content || []).map(c => ({
      displayContrato: c.displayContrato || `${c.numeroContrato}/${c.exercicio}`,
      numeroContrato: c.numeroContrato,
      exercicio: c.exercicio,
      fornecedor: c.nome,
      cnpjCpf: c.cnpjCpf,
      valorContratado: c.valorContratado || 0,
      valorAditivo: c.valorAditivo || 0,
      valorTotal: (c.valorContratado || 0) + (c.valorAditivo || 0),
      situacao: c.situacao,
      modalidadeLicitacao: c.descricaoTipoLicitacao || 'Não informada',
      displayLicitacao: c.displayLicitacao || (c.numeroLicitacao ? `${c.numeroLicitacao}/${c.exercicioLicitacao}` : '-'),
      objeto: c.objeto || '',
      vigencia: c.vigencia || c.terminoVigencia || '-'
    }));

    contractsCache.set(cleanQ, results);
    return results;
  } catch (err) {
    console.error(`Erro ao consultar contratos para "${cleanQ}": ${err.message}`);
    return [];
  }
}

/**
 * Analisa o texto do pedido e da resposta para identificar contratos públicos relevantes
 */
export async function matchFinancialData(item) {
  const fullText = `${item.numero} ${item.ementa} ${item.respostasExecutivo.map(r => r.assuntoOficio).join(' ')}`.toLowerCase();
  
  const matches = [];

  // Regras de detecção inteligentes baseadas nos fornecedores e temas de Contenda
  const searchRules = [
    { trigger: ['bonfim', 'são joão', 'artefatos de cimento'], query: 'BONFIM' },
    { trigger: ['iluminação', 'lâmpada', 'luminária', 'led'], query: 'ILUMINACAO' },
    { trigger: ['laboratório', 'exame', 'sangue'], query: 'LABORATORIO' },
    { trigger: ['livro', 'biblioteca'], query: 'LIVROS' },
    { trigger: ['pneu'], query: 'PNEUS' },
    { trigger: ['ônibus', 'transporte escolar'], query: 'TRANSPORTE' },
    { trigger: ['terceiriz'], query: 'TERCEIRIZACAO' }
  ];

  for (const rule of searchRules) {
    const triggered = rule.trigger.some(w => fullText.includes(w));
    if (triggered) {
      const found = await searchContracts(rule.query);
      
      // Filtrar contratos mais pertinentes ao objeto
      for (const c of found) {
        const cText = `${c.fornecedor} ${c.objeto}`.toLowerCase();
        
        if (rule.query === 'BONFIM' && (cText.includes('são joão') || cText.includes('artefatos'))) {
          matches.push(c);
        } else if (rule.query === 'ILUMINACAO' && (cText.includes('luminárias') || cText.includes('manutenção') || cText.includes('led'))) {
          matches.push(c);
        } else if (rule.query === 'LABORATORIO' && cText.includes('exames')) {
          matches.push(c);
        }
      }
    }
  }

  // Deduplicar contratos encontrados pelo displayContrato
  const unique = [];
  const seen = new Set();
  for (const m of matches) {
    if (!seen.has(m.displayContrato)) {
      seen.add(m.displayContrato);
      unique.push(m);
    }
  }

  return unique;
}

export function formatMoedaBRL(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

