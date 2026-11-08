/**
 * Módulo de Banco de Dados Analítico Local (SQLite Nativo)
 * Armazena e cruza o histórico de Contenda (PR)
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'contenda_transparencia.sqlite');

let dbInstance = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS proposicoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mes_ref TEXT,
      tipo TEXT,
      numero TEXT,
      ano INTEGER,
      data TEXT,
      autor TEXT,
      ementa TEXT,
      url TEXT,
      localidade TEXT,
      lat REAL,
      lng REAL,
      tema TEXT,
      tema_cor TEXT,
      status_prefeitura TEXT,
      resposta_resumo TEXT,
      oficio_numero TEXT,
      oficio_data TEXT,
      oficio_pdf_path TEXT,
      oficio_ocr_texto TEXT,
      secretaria_responsavel TEXT,
      previsao_prazo TEXT,
      reincidencia_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      UNIQUE(numero, ano)
    );

    CREATE TABLE IF NOT EXISTS contratos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      proposicao_numero TEXT,
      ano_ref INTEGER,
      display_contrato TEXT,
      fornecedor TEXT,
      cnpj TEXT,
      valor_contratado REAL,
      valor_total REAL,
      situacao TEXT,
      modalidade TEXT,
      objeto TEXT,
      vigencia TEXT,
      fonte TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_prop_mes_ano ON proposicoes(mes_ref);
    CREATE INDEX IF NOT EXISTS idx_prop_autor ON proposicoes(autor);
    CREATE INDEX IF NOT EXISTS idx_prop_tema ON proposicoes(tema);
    CREATE INDEX IF NOT EXISTS idx_contratos_prop ON contratos(proposicao_numero);
  `);
}

export function saveBatchToDb(items, mes, ano) {
  const db = getDb();
  const mesRef = `${ano}-${String(mes).padStart(2, '0')}`;

  const insertProp = db.prepare(`
    INSERT INTO proposicoes (
      mes_ref, tipo, numero, ano, data, autor, ementa, url,
      localidade, lat, lng, tema, tema_cor,
      status_prefeitura, resposta_resumo, oficio_numero, oficio_data,
      oficio_pdf_path, oficio_ocr_texto, secretaria_responsavel, previsao_prazo
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?
    )
    ON CONFLICT(numero, ano) DO UPDATE SET
      mes_ref = excluded.mes_ref,
      status_prefeitura = excluded.status_prefeitura,
      resposta_resumo = excluded.resposta_resumo,
      oficio_numero = excluded.oficio_numero,
      oficio_data = excluded.oficio_data,
      oficio_pdf_path = excluded.oficio_pdf_path,
      oficio_ocr_texto = excluded.oficio_ocr_texto,
      secretaria_responsavel = excluded.secretaria_responsavel,
      previsao_prazo = excluded.previsao_prazo,
      localidade = excluded.localidade,
      tema = excluded.tema,
      tema_cor = excluded.tema_cor
  `);

  const deleteOldContratos = db.prepare(`DELETE FROM contratos WHERE proposicao_numero = ? AND ano_ref = ?`);
  const insertContrato = db.prepare(`
    INSERT INTO contratos (
      proposicao_numero, ano_ref, display_contrato, fornecedor, cnpj,
      valor_contratado, valor_total, situacao, modalidade, objeto, vigencia, fonte
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of items) {
    const ofResp = (item.respostasExecutivo && item.respostasExecutivo[0]) || {};
    
    insertProp.run(
      mesRef,
      item.tipo || '',
      item.numero || '',
      ano,
      item.data || '',
      item.autor || '',
      item.ementa || '',
      item.url || '',
      item.localidade || 'Contenda (Centro)',
      item.lat || -25.6765,
      item.lng || -49.5342,
      item.tema || 'Geral',
      item.temaCor || '#64748b',
      item.temResposta ? 'Respondido' : 'Pendente',
      item.temResposta ? `${ofResp.assuntoOficio || ''}` : 'Sem resposta registrada',
      ofResp.numeroOficio || '',
      ofResp.dataOficio || '',
      ofResp.pdfLocalPath || '',
      item.ocrTextoCompleto || '',
      item.secretariaResponsavel || ofResp.secretaria || '',
      item.previsaoPrazo || 'Sem prazo explícito'
    );

    // Salvar contratos associados
    deleteOldContratos.run(item.numero, ano);
    if (item.contratos && item.contratos.length > 0) {
      for (const c of item.contratos) {
        insertContrato.run(
          item.numero,
          ano,
          c.displayContrato || c.numeroContrato || '',
          c.fornecedor || '',
          c.cnpjCpf || c.cnpjFornecedor || '',
          c.valorContratado || c.valorGlobal || 0,
          c.valorTotal || c.valorAcumulado || c.valorGlobal || 0,
          c.situacao || 'Vigente',
          c.modalidadeLicitacao || 'Concorrência',
          c.objeto || '',
          c.vigencia || c.vigenciaFim || '',
          c.fonte || 'Elotech'
        );
      }
    }
  }

  // Atualizar contagem de reincidência por similaridade de ementa
  detectReincidencias(db);
}

function detectReincidencias(db) {
  const props = db.prepare(`SELECT id, ementa, autor FROM proposicoes`).all();
  const updateReinc = db.prepare(`UPDATE proposicoes SET reincidencia_count = ? WHERE id = ?`);

  for (const p of props) {
    const palavras = (p.ementa || '').toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4 && !['sobre', 'para', 'pela', 'como', 'onde', 'nesta', 'este', 'esta'].includes(w));
    
    if (palavras.length === 0) continue;

    let matches = 0;
    for (const other of props) {
      if (other.id === p.id) continue;
      const otherEmenta = (other.ementa || '').toLowerCase();
      const matchWords = palavras.filter(w => otherEmenta.includes(w));
      if (matchWords.length >= 3) {
        matches++;
      }
    }

    updateReinc.run(matches, p.id);
  }
}

export function getAllProposicoesWithContratos() {
  const db = getDb();
  const props = db.prepare(`SELECT * FROM proposicoes ORDER BY ano DESC, mes_ref DESC, numero DESC`).all();
  const getContratos = db.prepare(`SELECT * FROM contratos WHERE proposicao_numero = ?`);

  return props.map(p => ({
    ...p,
    contratos: getContratos.all(p.numero)
  }));
}

