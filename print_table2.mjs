import fs from 'fs';

const html = fs.readFileSync('C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/camara_indicacoes_sample.html', 'utf8');
const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
console.log(tables[2]);

