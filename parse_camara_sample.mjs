import fs from 'fs';

const html = fs.readFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/camara_indicacoes_sample.html', 'utf8');

// Find all table elements or panels
const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
console.log(`Found ${tables.length} tables`);
tables.forEach((t, i) => {
  console.log(`--- Table ${i} (length: ${t.length}) ---`);
  // strip tags and print preview
  const clean = t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(clean.slice(0, 500));
});

// Let's also look for panel or card or list items
const panels = html.match(/class=["'][^"']*(?:panel|card|materia|proposicao|item|conteudo|resultado)[^"']*["']/gi) || [];
console.log('Class mentions:', panels.slice(0, 20));

