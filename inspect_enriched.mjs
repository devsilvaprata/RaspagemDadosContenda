import fs from 'fs';

const data = JSON.parse(fs.readFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/camara_outubro_2026_enriched.json', 'utf8'));

console.log('Sample item files and detailSnippets:');
for (const item of data.slice(0, 5)) {
  console.log(`\n=== ${item.numero} (${item.tipo}) ===`);
  console.log('Situacao:', item.situacao);
  console.log('Autor:', item.autor);
  console.log('Files:', item.files);
  console.log('Snippets:', item.detailSnippets);
}

