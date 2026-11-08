import fs from 'fs';

// Complete dictionary of specific responses per proposição
const detailsMap = {
  // Indicações
  '0534': {
    oficio: 'Ofício 505/2026 (16/10/2026)',
    status: 'Respondido / Em análise jurídica e orçamentária',
    resposta: 'Secretaria de Saúde reconhece a importância da redução da jornada para 30h da enfermagem, mas informa que a alteração depende de análise jurídica, administrativa e de impacto orçamentário prévio para não prejudicar escalas e assistência.'
  },
  '0535': {
    oficio: 'Ofício 501/2026 (14/10/2026)',
    status: 'Respondido / Programado',
    resposta: 'Secretaria de Obras informa que os serviços de patrolamento e ensaibramento no Campestre serão realizados no prazo de até 10 dias.'
  },
  '0536': {
    oficio: 'Ofício 501/2026 (14/10/2026)',
    status: 'Respondido / Em estudos técnicos',
    resposta: 'Encaminhada para estudos técnicos a fim de avaliar a viabilidade da pavimentação asfáltica/sextavado na Rua João Franco até o Parque Industrial.'
  },
  '0537': {
    oficio: 'Ofício 516/2026 (23/10/2026)',
    status: 'Respondido / Notificação contratual',
    resposta: 'Secretaria de Saúde informa contrato vigente para ginecologista; empresa contratada foi formalmente notificada para efetuar a substituição do profissional pendente.'
  },
  '0538': {
    oficio: 'Ofício 514/2026 (22/10/2026)',
    status: 'Respondido / Incluído em cronograma',
    resposta: 'Secretaria de Obras informa que a indicação (recolhimento de galhos/entulhos) foi inserida no cronograma de serviços municipais.'
  },
  '0539': {
    oficio: 'Ofício 514/2026 (22/10/2026)',
    status: 'Respondido / Incluído em cronograma',
    resposta: 'Patrolamento e ensaibramento na estrada rural incluído no cronograma de serviços da Secretaria de Obras.'
  },
  '0540': {
    oficio: 'Ofício 514/2026 (22/10/2026)',
    status: 'Respondido / Incluído em cronograma',
    resposta: 'Patrolamento e ensaibramento colocado no cronograma de serviços da Secretaria de Obras.'
  },
  '0541': {
    oficio: 'Ofício 514/2026 (22/10/2026)',
    status: 'Respondido / Em estudos técnicos',
    resposta: 'Solicitação de extensão de rede/iluminação pública encaminhada para análise e estudos técnicos de viabilidade.'
  },
  '0542': {
    oficio: 'Ofício 514/2026 (22/10/2026)',
    status: 'Respondido / Em estudos técnicos',
    resposta: 'Solicitação encaminhada para análise e estudos técnicos visando avaliar viabilidade e medidas necessárias.'
  },
  '0543': {
    oficio: 'Ofício 514/2026 (22/10/2026)',
    status: 'Respondido / Prazo de 10 dias + Projetos',
    resposta: 'Patrolamento/ensaibramento será executado no prazo de até 10 dias; pavimentação com blocos sextavados está em fase de elaboração de projeto técnico.'
  },
  '0544': {
    oficio: 'Ofício 514/2026 (22/10/2026)',
    status: 'Respondido / Cronograma + Vistoria in loco',
    resposta: 'Patrolamento/ensaibramento incluído no cronograma; limpeza do rio terá análise técnica in loco para avaliar condições.'
  },
  '0545': {
    oficio: 'Ofício 514/2026 (22/10/2026)',
    status: 'Respondido / Incluído em cronograma',
    resposta: 'Limpeza e roçada de canteiros e ponto de ônibus na Estada de Catanduvas incluída no cronograma de serviços.'
  },
  '0546': {
    oficio: 'Ofício 514/2026 (22/10/2026)',
    status: 'Respondido / Condicionado a orçamento',
    resposta: 'Melhorias em calçadas na Rua Des. Lauro Lopes encaminhadas para estudos técnicos; execução condicionada à disponibilidade orçamentária.'
  },
  '0547': {
    oficio: 'Ofício 520/2026 (27/10/2026)',
    status: 'Respondido / Em andamento nas obras',
    resposta: 'Sinalização viária na Rua Temótheo Cordeiro com Trav. Emídio Carlos será executada na fase de acabamento da pavimentação em andamento, conforme projeto e normas de trânsito.'
  },
  '0548': {
    oficio: 'Ofício 520/2026 (27/10/2026)',
    status: 'Respondido / Prazo de até 10 dias',
    resposta: 'Roçada, limpeza geral e recolhimento de resíduos nas áreas verdes e entorno do Terminal será realizada no prazo de até 10 dias.'
  },
  '0549': {
    oficio: 'Ofício 520/2026 (27/10/2026)',
    status: 'Respondido / Incluído em programação',
    resposta: 'Patrolamento e ensaibramento no Distrito de Catanduvas do Sul será executado conforme a programação da Secretaria de Obras.'
  },
  '0550': {
    oficio: 'Ofício 520/2026 (27/10/2026)',
    status: 'Respondido / Incluído em cronograma',
    resposta: 'Patrolamento e ensaibramento na Rua Alberto Urbanik será executado conforme cronograma da Secretaria de Obras.'
  },
  '0551': {
    oficio: 'Ofício 520/2026 (27/10/2026)',
    status: 'Respondido / Em estudos técnicos',
    resposta: 'Pavimentação da Travessa Luís Martins encaminhada para estudos técnicos de viabilidade de engenharia.'
  },
  '0552': {
    oficio: 'Memorando 188 / Ofício 520/2026',
    status: 'Respondido / Incluído em programação',
    resposta: 'Patrolamento e ensaibramento na Rua Ulisses Ferreira Padilha será executado conforme a programação da Secretaria de Obras.'
  },
  '0553': {
    oficio: 'Memorando 188 / Ofício 520/2026',
    status: 'Respondido / Repassado à Educação',
    resposta: 'Manutenção no telhado da quadra da Escola Municipal Cívico Militar Leonor de Moura Carvalho repassada à Secretaria de Educação para providências.'
  },

  // Requerimentos
  '0123': {
    oficio: 'Ofício 506/2026 (16/10/2026)',
    status: 'Respondido / Informações detalhadas prestadas',
    resposta: 'Secretaria de Indústria e Agropecuária informou a existência de 10 associações agrícolas constituídas, sendo 7 regularizadas e 3 em processo de regularização com apoio técnico/jurídico municipal; anexou comprovantes da Receita e CNDs.'
  },
  '0124': {
    oficio: 'Ofício 503/2026 (15/10/2026)',
    status: 'Respondido / Informações detalhadas prestadas',
    resposta: 'Secretaria de Educação esclareceu matrícula de 29 alunos no CMEI Tia Cleusa, gratificação da coordenação pedagógica (R$ 2.087,87) e planejamento de expansão para 86 vagas no ano letivo de 2027.'
  },
  '0125': {
    oficio: 'Ofício 514/2026 (22/10/2026)',
    status: 'Respondido / Processo administrativo instaurado',
    resposta: 'Iluminação pública defeituosa: empresa fornecedora descumpriu garantia de 5 anos; aberto processo administrativo de sanção contra a fornecedora e estudo de compra emergencial.'
  },
  '0126': {
    oficio: 'Ofício 514/2026 (22/10/2026)',
    status: 'Respondido / Em fase de projeto',
    resposta: 'Passarela da ponte na Av. João Franco está em avaliação técnica e elaboração de projeto de reforma estrutural.'
  },
  '0127': {
    oficio: 'Ofício 514/2026 (22/10/2026)',
    status: 'Respondido / Aguardando licitação CBUQ',
    resposta: 'Redutores de velocidade: sem previsão imediata, dependendo de análise técnica viária e conclusão de processo licitatório de massa asfáltica (CBUQ).'
  },
  '0128': {
    oficio: 'Ofício 516/2026 (23/10/2026)',
    status: 'Respondido / Em andamento (Teleconsultoria estadual)',
    resposta: 'Saúde informa fila de 140 pacientes em reumatologia (demanda reprimida estadual); implantação de teleconsultoria com o Estado até final do ano para triagem prioritária.'
  },
  '0129': {
    oficio: 'Ofício 516/2026 (23/10/2026)',
    status: 'Respondido / Informações prestadas',
    resposta: 'Contrato vigente oferece 60 vagas diárias de exames nas UBS. Em setembro/2026 foram atendidos 939 pacientes e 10.978 exames laboratoriais realizados.'
  },
  '0130': {
    oficio: 'Ofício 514/2026 (22/10/2026)',
    status: 'Respondido / Em execução contínua',
    resposta: 'Maquinários agrícolas em pleno funcionamento atendendo produtores rurais sem fila de espera fixa; manutenção de estradas prioriza transporte escolar e escoamento de safras.'
  },
  '0131': {
    oficio: 'Ofício 515/2026 (22/10/2026)',
    status: 'Respondido / Aguardando equipe de Obras',
    resposta: 'Muro da Escola Vanilda Dzierwa: Secretaria de Educação depende do setor de Obras e não possui data definida no momento.'
  },
  '0132': {
    oficio: 'Ofício 520/2026 (27/10/2026)',
    status: 'Respondido / Rescisão contratual + Nova contratação',
    resposta: 'Obras da Av. São João: rescisão de contrato com Bonfim Artefatos por descumprimento de prazos; 2ª colocada aceitou assumir e contratação está em instrução administrativa.'
  },
  '0133': {
    oficio: 'Ofício 520/2026 (27/10/2026)',
    status: 'Respondido / Competência da SANEPAR',
    resposta: 'Rede de esgoto: obras já iniciadas diretamente pela SANEPAR, responsável pela execução e cronograma das intervenções.'
  },
  '0134': {
    oficio: 'Ofício 516/2026 (23/10/2026)',
    status: 'Respondido / Informações prestadas',
    resposta: 'Atendimento obstétrico: prestado regularmente por contrato médico credenciado e acompanhamento pré-natal nas UBS e encaminhamentos a hospitais de referência.'
  },
  '0135': {
    oficio: 'Ofício 520/2026 (27/10/2026)',
    status: 'Respondido / Sem previsão orçamentária/contratual',
    resposta: 'Parque ao ar livre: contrato com empresa de terceirizados foi encerrado; sem previsão de atendimento no momento até nova contratação.'
  }
};

const data = JSON.parse(fs.readFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/relatorio_comparacao_outubro_2026.json', 'utf8'));

// Build CSV
let csv = 'Tipo;Número;Data Apresentação;Autor;Ementa / Pedido da Câmara;Situação na Câmara;Resposta da Prefeitura / Ofício;Status de Atendimento;Detalhamento da Resposta do Executivo\n';

for (const item of data) {
  const matchNum = item.numero.match(/(\d{4})/);
  const numKey = matchNum ? matchNum[1] : '';
  const d = detailsMap[numKey] || {
    oficio: item.respostasExecutivo.length > 0 ? item.respostasExecutivo[0].numOficio : 'Sem resposta no sistema',
    status: item.statusPrefeitura,
    resposta: 'Aguardando tramitação ou resposta formal.'
  };

  const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""').replace(/\r?\n|\r/g, ' ')}"`;

  csv += [
    escapeCsv(item.tipo),
    escapeCsv(item.numero),
    escapeCsv(item.dataApresentacao),
    escapeCsv(item.autor),
    escapeCsv(item.ementa),
    escapeCsv(item.situacaoCamara),
    escapeCsv(d.oficio),
    escapeCsv(d.status),
    escapeCsv(d.resposta)
  ].join(';') + '\n';
}

fs.writeFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/comparativo_contenda_outubro_2026.csv', '\uFEFF' + csv, 'utf8');
console.log('Saved CSV comparativo_contenda_outubro_2026.csv');

