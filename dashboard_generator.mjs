/**
 * Gerador de Dashboard Web Interativo Local
 * Cria um painel HTML completo com Tailwind, Chart.js e Leaflet
 */

import fs from 'fs';
import path from 'path';

export function generateDashboardHtml(data, outputPath = 'dashboard.html') {
  const jsonPayload = JSON.stringify(data);

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transparência Contenda - Câmara vs. Prefeitura</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    #map { height: 420px; border-radius: 0.75rem; }
    .badge { display: inline-flex; align-items: center; padding: 0.15rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col">

  <!-- TOPO / CABEÇALHO -->
  <header class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
          <i class="fa-solid fa-landmark text-xl text-blue-300"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight">Transparência & Fiscalização Pública</h1>
          <p class="text-xs text-blue-200">Município de Contenda (PR) • Câmara Municipal vs. Prefeitura</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span id="dataAtualizacao" class="text-xs bg-blue-800/60 border border-blue-400/20 px-3 py-1.5 rounded-full text-blue-200">
          <i class="fa-regular fa-clock mr-1"></i> Atualizado em <span id="lblDataSync">Hoje</span>
        </span>
        <button onclick="exportarCSV()" class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3.5 py-1.5 rounded-lg shadow transition flex items-center gap-1.5">
          <i class="fa-solid fa-file-excel"></i> Exportar Dados
        </button>
      </div>
    </div>
  </header>

  <!-- CONTEÚDO PRINCIPAL -->
  <main class="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">

    <!-- CARDS DE MÉTRICAS RÁPIDAS (KPIS) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Demandas Legislativas</p>
          <p id="kpiTotal" class="text-2xl font-bold text-slate-800 mt-1">0</p>
          <p id="kpiTipos" class="text-xs text-slate-400 mt-0.5">0 Indicações | 0 Requerimentos</p>
        </div>
        <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-xl">
          <i class="fa-solid fa-scroll"></i>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Índice de Resposta</p>
          <p id="kpiResposta" class="text-2xl font-bold text-emerald-600 mt-1">0%</p>
          <p id="kpiPendentes" class="text-xs text-slate-400 mt-0.5">0 aguardando retorno</p>
        </div>
        <div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 text-xl">
          <i class="fa-solid fa-check-double"></i>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contratos Vinculados (R$)</p>
          <p id="kpiValor" class="text-2xl font-bold text-indigo-600 mt-1">R$ 0</p>
          <p id="kpiQtdContratos" class="text-xs text-slate-400 mt-0.5">0 contratos mapeados</p>
        </div>
        <div class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-xl">
          <i class="fa-solid fa-file-invoice-dollar"></i>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compromissos / Prazos</p>
          <p id="kpiPrazos" class="text-2xl font-bold text-amber-600 mt-1">0</p>
          <p class="text-xs text-slate-400 mt-0.5">com prazos oficiais da Prefeitura</p>
        </div>
        <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 text-xl">
          <i class="fa-solid fa-stopwatch"></i>
        </div>
      </div>
    </div>

    <!-- FILTROS DINÂMICOS -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div class="flex flex-col md:flex-row gap-3">
        <div class="flex-1 relative">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400"></i>
          <input type="text" id="filtroTexto" placeholder="Pesquisar por rua, assunto, empresa, palavra-chave..." 
                 class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                 oninput="aplicarFiltros()">
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <select id="filtroAutor" class="border border-slate-300 rounded-lg px-2.5 py-2 text-sm bg-white" onchange="aplicarFiltros()">
            <option value="">Todos os Vereadores</option>
          </select>
          <select id="filtroStatus" class="border border-slate-300 rounded-lg px-2.5 py-2 text-sm bg-white" onchange="aplicarFiltros()">
            <option value="">Todos os Status</option>
            <option value="Respondido">Respondido</option>
            <option value="Pendente">Aguardando Resposta</option>
          </select>
          <select id="filtroTema" class="border border-slate-300 rounded-lg px-2.5 py-2 text-sm bg-white" onchange="aplicarFiltros()">
            <option value="">Todos os Temas</option>
          </select>
          <select id="filtroLocalidade" class="border border-slate-300 rounded-lg px-2.5 py-2 text-sm bg-white" onchange="aplicarFiltros()">
            <option value="">Todas as Regiões</option>
          </select>
        </div>
      </div>
    </div>

    <!-- SEÇÃO MAPA E GRÁFICOS -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- MAPA LEAFLET -->
      <div class="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-bold text-slate-700 flex items-center gap-2">
            <i class="fa-solid fa-map-location-dot text-blue-600"></i> Mapa de Demandas em Contenda
          </h2>
          <span class="text-xs text-slate-400">Clique nos pontos para ver os pedidos</span>
        </div>
        <div id="map" class="flex-1 min-h-[360px]"></div>
      </div>

      <!-- GRÁFICOS CHART.JS -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <h2 class="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-chart-pie text-indigo-600"></i> Distribuição por Tema
          </h2>
          <div class="h-44 relative">
            <canvas id="chartTemas"></canvas>
          </div>
        </div>
        <div class="pt-2 border-t border-slate-100">
          <h2 class="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-chart-bar text-emerald-600"></i> Top Vereadores por Demandas
          </h2>
          <div class="h-44 relative">
            <canvas id="chartVereadores"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- TABELA COMPLETA COM MODAL -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-list-check text-blue-600"></i> Proposições e Despachos do Executivo
        </h2>
        <span id="lblTotalTabela" class="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full">
          Mostrando 0 registros
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="bg-slate-100/70 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <th class="py-3 px-4">Proposição</th>
              <th class="py-3 px-4">Local / Tema</th>
              <th class="py-3 px-4">Autor</th>
              <th class="py-3 px-4">Resumo do Pedido</th>
              <th class="py-3 px-4">Resposta Prefeitura</th>
              <th class="py-3 px-4">Prazo / Despacho</th>
              <th class="py-3 px-4">Contratos / R$</th>
              <th class="py-3 px-4 text-center">Ação</th>
            </tr>
          </thead>
          <tbody id="tabelaBody" class="divide-y divide-slate-100">
            <!-- Linhas geradas via JavaScript -->
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- MODAL DE DETALHES COMPLETOS -->
  <div id="modalDetalhes" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      <div class="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
        <div>
          <span id="modalTipo" class="text-xs uppercase tracking-wider font-semibold bg-white/20 px-2 py-0.5 rounded">Indicação</span>
          <h3 id="modalNumero" class="text-lg font-bold mt-1">Nº 0000-2026</h3>
        </div>
        <button onclick="fecharModal()" class="text-white/80 hover:text-white text-xl p-1">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="p-6 overflow-y-auto space-y-5 text-sm">
        <div>
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Demanda do Vereador</h4>
          <p id="modalAutor" class="font-medium text-slate-700 mt-0.5">Autor</p>
          <p id="modalEmenta" class="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 mt-2 leading-relaxed"></p>
        </div>

        <div>
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Resposta Oficial da Prefeitura (Extraído do Ofício)</h4>
          <div id="modalBoxResposta" class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mt-2 space-y-2">
            <div class="flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <span id="modalOficioNum"><i class="fa-solid fa-file-pdf mr-1"></i> Ofício 000/2026</span>
              <span id="modalSecretaria" class="bg-emerald-200/60 px-2 py-0.5 rounded">Secretaria</span>
            </div>
            <p id="modalDespachoTexto" class="text-slate-700 text-sm leading-relaxed"></p>
            <div id="modalPrazoBox" class="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 pt-1">
              <i class="fa-solid fa-stopwatch"></i> Previsão assumida: <span id="modalPrazoTexto">-</span>
            </div>
          </div>
        </div>

        <div id="modalSecaoContratos">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Contratos & Licitações Relacionados (Elotech / PNCP)</h4>
          <div id="modalContratosList" class="space-y-2 mt-2">
            <!-- Contratos inseridos via JS -->
          </div>
        </div>
      </div>

      <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
        <a id="modalLinkCamara" href="#" target="_blank" class="px-4 py-2 text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg flex items-center gap-1.5">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir na Câmara
        </a>
        <button onclick="fecharModal()" class="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg">
          Fechar
        </button>
      </div>
    </div>
  </div>

  <!-- SCRIPT DE INTERATIVIDADE -->
  <script>
    const DADOS = ${jsonPayload};
    let itensFiltrados = [...DADOS];
    let mapInstance = null;
    let markersLayer = null;
    let chartTemasInstance = null;
    let chartVereadoresInstance = null;

    function formatMoeda(val) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
    }

    function init() {
      popularFiltrosSelects();
      initMap();
      aplicarFiltros();
    }

    function popularFiltrosSelects() {
      const autores = [...new Set(DADOS.map(d => d.autor).filter(Boolean))].sort();
      const temas = [...new Set(DADOS.map(d => d.tema).filter(Boolean))].sort();
      const localidades = [...new Set(DADOS.map(d => d.localidade).filter(Boolean))].sort();

      const selAutor = document.getElementById('filtroAutor');
      autores.forEach(a => selAutor.add(new Option(a, a)));

      const selTema = document.getElementById('filtroTema');
      temas.forEach(t => selTema.add(new Option(t, t)));

      const selLoc = document.getElementById('filtroLocalidade');
      localidades.forEach(l => selLoc.add(new Option(l, l)));
    }

    function initMap() {
      mapInstance = L.map('map').setView([-25.6765, -49.5342], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstance);
      markersLayer = L.layerGroup().addTo(mapInstance);
    }

    function aplicarFiltros() {
      const q = (document.getElementById('filtroTexto').value || '').toLowerCase();
      const fAutor = document.getElementById('filtroAutor').value;
      const fStatus = document.getElementById('filtroStatus').value;
      const fTema = document.getElementById('filtroTema').value;
      const fLoc = document.getElementById('filtroLocalidade').value;

      itensFiltrados = DADOS.filter(item => {
        const full = (item.numero + ' ' + item.ementa + ' ' + (item.autor || '') + ' ' + (item.localidade || '') + ' ' + (item.respostaResumo || '') + ' ' + (item.contratos || []).map(c => c.fornecedor + ' ' + c.objeto).join(' ')).toLowerCase();
        if (q && !full.includes(q)) return false;
        if (fAutor && item.autor !== fAutor) return false;
        if (fStatus && (item.statusPrefeitura !== fStatus)) return false;
        if (fTema && item.tema !== fTema) return false;
        if (fLoc && item.localidade !== fLoc) return false;
        return true;
      });

      renderTabela();
      renderKpis();
      renderMapMarkers();
      renderGraficos();
    }

    function renderKpis() {
      const total = itensFiltrados.length;
      const respondidos = itensFiltrados.filter(i => i.statusPrefeitura === 'Respondido').length;
      const pendentes = total - respondidos;
      const pct = total > 0 ? ((respondidos / total) * 100).toFixed(1) : 0;

      let somaContratos = 0;
      let qtdContratos = 0;
      let comPrazo = 0;

      itensFiltrados.forEach(i => {
        if (i.previsaoPrazo && i.previsaoPrazo !== 'Sem prazo explícito') comPrazo++;
        (i.contratos || []).forEach(c => {
          somaContratos += (c.valorTotal || c.valorContratado || 0);
          qtdContratos++;
        });
      });

      const inds = itensFiltrados.filter(i => (i.tipo || '').toLowerCase().includes('ind')).length;
      const reqs = itensFiltrados.filter(i => (i.tipo || '').toLowerCase().includes('req')).length;

      document.getElementById('kpiTotal').innerText = total;
      document.getElementById('kpiTipos').innerText = \`\${inds} Indicações | \${reqs} Requerimentos\`;
      document.getElementById('kpiResposta').innerText = \`\${pct}%\`;
      document.getElementById('kpiPendentes').innerText = \`\${pendentes} aguardando retorno\`;
      document.getElementById('kpiValor').innerText = formatMoeda(somaContratos);
      document.getElementById('kpiQtdContratos').innerText = \`\${qtdContratos} contratos mapeados\`;
      document.getElementById('kpiPrazos').innerText = comPrazo;
      document.getElementById('lblTotalTabela').innerText = \`Mostrando \${total} registros\`;
    }

    function renderTabela() {
      const tbody = document.getElementById('tabelaBody');
      tbody.innerHTML = '';

      if (itensFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-slate-400">Nenhum registro encontrado com os filtros selecionados.</td></tr>';
        return;
      }

      itensFiltrados.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-blue-50/50 transition cursor-pointer';
        tr.onclick = (e) => {
          if (!e.target.closest('a')) abrirModal(item);
        };

        const badgeStatus = item.statusPrefeitura === 'Respondido'
          ? '<span class="badge bg-emerald-100 text-emerald-800"><i class="fa-solid fa-check mr-1"></i> Respondido</span>'
          : '<span class="badge bg-amber-100 text-amber-800"><i class="fa-regular fa-clock mr-1"></i> Pendente</span>';

        const corTema = item.temaCor || '#2563eb';
        const badgeTema = \`<span class="badge" style="background-color: \${corTema}15; color: \${corTema}">\${item.tema || 'Geral'}</span>\`;

        let contratosTxt = '<span class="text-slate-400">-</span>';
        if (item.contratos && item.contratos.length > 0) {
          const c = item.contratos[0];
          contratosTxt = \`<div class="font-semibold text-indigo-700 text-xs">\${formatMoeda(c.valorTotal || c.valorContratado)}</div>
                          <div class="text-[11px] text-slate-500 truncate max-w-[150px]">\${c.fornecedor}</div>\`;
        }

        const prazoTxt = item.previsaoPrazo && item.previsaoPrazo !== 'Sem prazo explícito'
          ? \`<span class="text-xs font-semibold text-emerald-700"><i class="fa-solid fa-stopwatch mr-1"></i>\${item.previsaoPrazo}</span>\`
          : '<span class="text-xs text-slate-400">Não informado</span>';

        tr.innerHTML = \`
          <td class="py-3 px-4 font-semibold text-blue-900 whitespace-nowrap">
            \${item.numero}
            <div class="text-xs text-slate-400 font-normal">\${item.data || ''}</div>
          </td>
          <td class="py-3 px-4 whitespace-nowrap">
            <div class="font-medium text-slate-700">\${item.localidade || 'Contenda'}</div>
            \${badgeTema}
          </td>
          <td class="py-3 px-4 text-slate-700 whitespace-nowrap">\${item.autor || '-'}</td>
          <td class="py-3 px-4 text-slate-600 max-w-xs truncate" title="\${item.ementa}">\${item.ementa}</td>
          <td class="py-3 px-4 whitespace-nowrap">\${badgeStatus}</td>
          <td class="py-3 px-4 whitespace-nowrap">\${prazoTxt}</td>
          <td class="py-3 px-4 whitespace-nowrap">\${contratosTxt}</td>
          <td class="py-3 px-4 text-center whitespace-nowrap">
            <button onclick="abrirModalPorIndice(\${idx})" class="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg">
              <i class="fa-solid fa-eye"></i>
            </button>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function renderMapMarkers() {
      markersLayer.clearLayers();
      const grouped = {};

      itensFiltrados.forEach(item => {
        const key = \`\${item.lat}_\${item.lng}\`;
        if (!grouped[key]) {
          grouped[key] = {
            lat: item.lat || -25.6765,
            lng: item.lng || -49.5342,
            localidade: item.localidade,
            items: []
          };
        }
        grouped[key].items.push(item);
      });

      Object.values(grouped).forEach(g => {
        const count = g.items.length;
        const marker = L.circleMarker([g.lat, g.lng], {
          radius: Math.min(22, 8 + count * 2),
          fillColor: '#2563eb',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85
        });

        const popupContent = \`
          <div class="p-1">
            <h4 class="font-bold text-sm text-slate-800">\${g.localidade}</h4>
            <p class="text-xs text-slate-500 mb-2">\${count} pedido(s) registrado(s)</p>
            <ul class="text-xs space-y-1 max-h-36 overflow-y-auto">
              \${g.items.slice(0, 5).map(it => \`<li><strong>\${it.numero}:</strong> \${it.ementa.slice(0, 60)}...</li>\`).join('')}
            </ul>
          </div>
        \`;
        marker.bindPopup(popupContent);
        markersLayer.addLayer(marker);
      });
    }

    function renderGraficos() {
      // Temas
      const temasCount = {};
      itensFiltrados.forEach(i => {
        temasCount[i.tema || 'Geral'] = (temasCount[i.tema || 'Geral'] || 0) + 1;
      });

      if (chartTemasInstance) chartTemasInstance.destroy();
      const ctxT = document.getElementById('chartTemas').getContext('2d');
      chartTemasInstance = new Chart(ctxT, {
        type: 'doughnut',
        data: {
          labels: Object.keys(temasCount),
          datasets: [{
            data: Object.values(temasCount),
            backgroundColor: ['#2563eb', '#dc2626', '#eab308', '#16a34a', '#0d9488', '#9333ea', '#64748b']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
        }
      });

      // Vereadores
      const verCount = {};
      itensFiltrados.forEach(i => {
        if (i.autor) {
          const primeiroNome = i.autor.split(' ')[0] + ' ' + (i.autor.split(' ')[1] || '');
          verCount[primeiroNome] = (verCount[primeiroNome] || 0) + 1;
        }
      });

      const topVer = Object.entries(verCount).sort((a,b) => b[1] - a[1]).slice(0, 5);

      if (chartVereadoresInstance) chartVereadoresInstance.destroy();
      const ctxV = document.getElementById('chartVereadores').getContext('2d');
      chartVereadoresInstance = new Chart(ctxV, {
        type: 'bar',
        data: {
          labels: topVer.map(v => v[0]),
          datasets: [{
            label: 'Pedidos',
            data: topVer.map(v => v[1]),
            backgroundColor: '#059669',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
          plugins: { legend: { display: false } }
        }
      });
    }

    function abrirModalPorIndice(idx) {
      abrirModal(itensFiltrados[idx]);
    }

    function abrirModal(item) {
      document.getElementById('modalTipo').innerText = item.tipo || 'Proposição';
      document.getElementById('modalNumero').innerText = item.numero;
      document.getElementById('modalAutor').innerText = item.autor ? \`Por: \${item.autor} (\${item.data || ''})\` : '';
      document.getElementById('modalEmenta').innerText = item.ementa;
      document.getElementById('modalLinkCamara').href = item.url || '#';

      // Resposta
      const ofNum = item.oficioNumero ? \`Ofício nº \${item.oficioNumero} (\${item.oficioData || ''})\` : 'Ofício de Resposta';
      document.getElementById('modalOficioNum').innerHTML = \`<i class="fa-solid fa-file-pdf mr-1"></i> \${ofNum}\`;
      document.getElementById('modalSecretaria').innerText = item.secretariaResponsavel || 'Gabinete / Secretaria';

      const respTxt = item.oficioOcrTexto || item.respostaResumo || 'Sem resposta cadastrada pela Prefeitura até o momento.';
      document.getElementById('modalDespachoTexto').innerText = respTxt;
      document.getElementById('modalPrazoTexto').innerText = item.previsaoPrazo || 'Não informado';

      // Contratos
      const cList = document.getElementById('modalContratosList');
      cList.innerHTML = '';
      if (item.contratos && item.contratos.length > 0) {
        document.getElementById('modalSecaoContratos').classList.remove('hidden');
        item.contratos.forEach(c => {
          const div = document.createElement('div');
          div.className = 'p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1';
          div.innerHTML = \`
            <div class="flex justify-between font-bold text-slate-800">
              <span>\${c.displayContrato || c.numeroContrato} - \${c.fornecedor}</span>
              <span class="text-indigo-600">\${formatMoeda(c.valorTotal || c.valorContratado)}</span>
            </div>
            <p class="text-slate-600">\${c.objeto || ''}</p>
            <div class="text-[11px] text-slate-400 flex gap-3">
              <span>Modalidade: \${c.modalidade || c.modalidadeLicitacao || 'Licitatório'}</span>
              <span>Vigência: \${c.vigencia || '-'}</span>
              <span class="text-emerald-700 font-semibold">\${c.situacao || 'Vigente'}</span>
            </div>
          \`;
          cList.appendChild(div);
        });
      } else {
        document.getElementById('modalSecaoContratos').classList.add('hidden');
      }

      document.getElementById('modalDetalhes').classList.remove('hidden');
    }

    function fecharModal() {
      document.getElementById('modalDetalhes').classList.add('hidden');
    }

    function exportarCSV() {
      if (itensFiltrados.length === 0) return alert('Nenhum dado para exportar.');
      let csv = 'Numero;Tipo;Data;Autor;Localidade;Tema;Status;Ementa;Oficio;Prazo;ValorContratos\\n';
      itensFiltrados.forEach(i => {
        const val = (i.contratos || []).reduce((acc, c) => acc + (c.valorTotal || c.valorContratado || 0), 0);
        csv += \`"\${i.numero}";"\${i.tipo}";"\${i.data}";"\${i.autor}";"\${i.localidade}";"\${i.tema}";"\${i.statusPrefeitura}";"\${(i.ementa||'').replace(/"/g, '""')}";"\${i.oficioNumero||''}";"\${i.previsaoPrazo||''}";"\${val}"\\n\`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contenda_fiscalizacao_filtrada.csv';
      a.click();
    }

    window.onload = init;
  </script>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf8');
}

