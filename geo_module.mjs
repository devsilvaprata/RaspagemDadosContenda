/**
 * Módulo de Georreferenciamento e Classificação Temática
 * Município de Contenda - PR
 */

export const LOCALIDADES_CONTENDA = [
  { nome: 'Catanduvas do Sul', lat: -25.7483, lng: -49.5982, aliases: ['catanduvas do sul', 'catanduvas', 'distrito de catanduvas'] },
  { nome: 'Serrinha', lat: -25.6420, lng: -49.5100, aliases: ['serrinha'] },
  { nome: 'Campestre dos Paula', lat: -25.6980, lng: -49.5600, aliases: ['campestre dos paula', 'campestre'] },
  { nome: 'Pocinho', lat: -25.7100, lng: -49.5200, aliases: ['pocinho'] },
  { nome: 'Pepira', lat: -25.6850, lng: -49.5400, aliases: ['pepira'] },
  { nome: 'Centro', lat: -25.6765, lng: -49.5342, aliases: ['centro', 'av. são joão', 'avenida são joão', 'praça'] },
  { nome: 'Habitar Brasil', lat: -25.6720, lng: -49.5310, aliases: ['habitar brasil', 'conjunto habitar'] },
  { nome: 'Vila Nova', lat: -25.6790, lng: -49.5280, aliases: ['vila nova'] },
  { nome: 'Mato Escuro', lat: -25.7200, lng: -49.5800, aliases: ['mato escuro'] },
  { nome: 'Lagoa das Almas', lat: -25.7600, lng: -49.5500, aliases: ['lagoa das almas'] },
  { nome: 'Terra Boa', lat: -25.6550, lng: -49.5450, aliases: ['terra boa'] },
  { nome: 'Passo do Meio', lat: -25.7300, lng: -49.5100, aliases: ['passo do meio'] },
  { nome: 'Rio Abaixo', lat: -25.7150, lng: -49.5050, aliases: ['rio abaixo'] },
  { nome: 'Capivara dos Manfron', lat: -25.6300, lng: -49.4950, aliases: ['capivara dos manfron', 'capivara'] },
  { nome: 'Valadão', lat: -25.6900, lng: -49.5700, aliases: ['valadão', 'valadao'] }
];

export const TEMAS = [
  {
    tema: 'Obras e Pavimentação',
    cor: '#2563eb',
    keywords: ['asfalto', 'paviment', 'patrolamento', 'ensaibramento', 'bloco', 'sextavado', 'ponte', 'bueiro', 'escoamento', 'revitalização', 'rua', 'estrada']
  },
  {
    tema: 'Saúde Pública',
    cor: '#dc2626',
    keywords: ['saúde', 'exame', 'laboratório', 'médico', 'remédio', 'medicamento', 'posto de saúde', 'ubs', 'ambulância', 'consulta']
  },
  {
    tema: 'Iluminação Pública',
    cor: '#eab308',
    keywords: ['iluminação', 'lâmpada', 'luminária', 'led', 'poste', 'posteamento', 'luz']
  },
  {
    tema: 'Educação',
    cor: '#16a34a',
    keywords: ['escola', 'creche', 'cmei', 'merenda', 'aluno', 'professor', 'quadra escolar', 'transporte escolar', 'sala de aula']
  },
  {
    tema: 'Limpeza e Meio Ambiente',
    cor: '#0d9488',
    keywords: ['roçada', 'limpeza', 'lixo', 'entulho', 'resíduos', 'poda', 'terreno', 'cemitério', 'praça']
  },
  {
    tema: 'Trânsito e Mobilidade',
    cor: '#9333ea',
    keywords: ['trânsito', 'redutor', 'lombada', 'placa', 'sinalização', 'faixa', 'ponto de ônibus', 'terminal rodoviário']
  },
  {
    tema: 'Agricultura e Fomento',
    cor: '#ca8a04',
    keywords: ['agricultura', 'produtor rural', 'trator', 'calcário', 'máquina agrícola', 'pecuária']
  }
];

/**
 * Identifica a localidade no texto da proposição
 */
export function detectLocalidade(texto) {
  const clean = texto.toLowerCase();

  for (const loc of LOCALIDADES_CONTENDA) {
    for (const alias of loc.aliases) {
      if (clean.includes(alias)) {
        return {
          nome: loc.nome,
          lat: loc.lat,
          lng: loc.lng
        };
      }
    }
  }

  // Padrão: Centro de Contenda
  return {
    nome: 'Contenda (Geral / Centro)',
    lat: -25.6765,
    lng: -49.5342
  };
}

/**
 * Identifica o tema principal da proposição
 */
export function detectTema(texto) {
  const clean = texto.toLowerCase();

  for (const t of TEMAS) {
    if (t.keywords.some(kw => clean.includes(kw))) {
      return {
        tema: t.tema,
        cor: t.cor
      };
    }
  }

  return {
    tema: 'Administração Geral',
    cor: '#64748b'
  };
}

