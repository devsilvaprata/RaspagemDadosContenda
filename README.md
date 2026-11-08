# Automação de Transparência - Contenda (PR)
## Comparativo: Câmara de Vereadores vs. Prefeitura Municipal

Este programa realiza a raspagem contínua e automatizada das proposições (Indicações e Requerimentos) da **Câmara Municipal de Contenda** e cruza com os **Ofícios de Resposta da Prefeitura Municipal** (Secretarias de Obras, Saúde, Educação, Agropecuária, etc.).

---

### Como Usar no Próximo Mês (Novembro ou Qualquer Outro)

#### Opção 1: Pedindo diretamente aqui no chat
Basta me enviar uma mensagem rápida:
> *"Pode rodar a análise de novembro de 2026 de Contenda?"*

Eu executarei o script `contenda_sync.mjs 11 2026` em segundos e apresentarei a tabela pronta com os novos dados.

#### Opção 2: Pela Linha de Comando (PowerShell / Prompt)
Abra a pasta no terminal e rode:
```bash
node contenda_sync.mjs 11 2026
```

#### Opção 3: Clicando duas vezes
Dê um duplo clique no arquivo [`executar.bat`](file:///C:/Users/orodr/.gemini/antigravity/scratch/contenda-raspagem/executar.bat). Ele pedirá o mês e ano e gerará os arquivos automaticamente.

---

### Arquivos Gerados Automaticamente a Cada Execução

Para cada mês processado (exemplo `11/2026`), o sistema cria:
1. **Planilha CSV:** `comparativo_2026_11.csv` *(pronta para abrir no Microsoft Excel com acentuação corrigida e separador `;`)*
2. **Relatório em Texto/Tabela:** `relatorio_2026_11.md`
3. **Dados Brutos:** `comparativo_2026_11.json`
4. **Pasta com Cópia dos Ofícios em PDF:** `oficios/2026_11/*.pdf`

