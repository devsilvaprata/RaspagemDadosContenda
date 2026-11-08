---
name: firecrawl-scraping
description: Use this skill when scraping, crawling, searching, or extracting structured data from websites and web pages using Firecrawl (MCP tools or API).
---

# Firecrawl Web Scraping & Crawling Guide

This skill provides standard operating procedures, best practices, and tool usage for scraping and parsing web data with Firecrawl.

---

## 1. Prerequisites & MCP Configuration

Firecrawl MCP is configured in `~/.gemini/config/mcp_config.json`:

```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "cmd.exe",
      "args": ["/c", "npx", "-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "fc-YOUR_API_KEY"
      }
    }
  }
}
```

> [!NOTE]
> Obtain an API key at [firecrawl.dev](https://www.firecrawl.dev). If using a self-hosted Firecrawl instance, also add `"FIRECRAWL_API_URL": "http://localhost:3002"` in the `env` block.

---

## 2. Choosing the Right Operation

Select the tool/method best suited for the task:

| Operation | Tool / Endpoint | When to Use |
| :--- | :--- | :--- |
| **Scrape Single Page** | `firecrawl_scrape` | Extract clean markdown, text, or HTML from a single specific URL. Removes clutter, popups, and scripts automatically. |
| **Extract Structured Data** | `firecrawl_extract` | Extract specific fields (e.g., product prices, dates, table records) according to a JSON schema or prompt directly from a page. |
| **Map Website** | `firecrawl_map` | Quickly discover all URLs and site architecture under a domain without downloading full page bodies. |
| **Crawl Entire Site/Subtree** | `firecrawl_crawl` | Recursively traverse multiple pages starting from a seed URL with depth and path filters. |
| **Web Search with Content** | `firecrawl_search` | Search for keywords and get the top relevant pages pre-scraped in clean markdown. |

---

## 3. Workflow Procedures

### Procedure A: Single Page Scraping (`firecrawl_scrape`)
1. **Identify the target URL**: Verify if the page requires authentication or is public.
2. **Set Formats**:
   - Default to `markdown` for clean text and LLM analysis.
   - Use `html` or `rawHtml` only when CSS selectors, tables, or complex DOM layouts must be preserved.
3. **Handle Dynamic Content**:
   - If content loads via client-side JavaScript, ensure `waitFor` or page actions are configured if available.
4. **Save Outputs**:
   - Save extracted markdown or data to `.md` or `.json` in the workspace directory.

### Procedure B: Site Crawling (`firecrawl_crawl`)
1. **Set strict bounds**:
   - Always define `limit` (e.g., 10 to 50 pages) to prevent runaway crawls and quota exhaustion.
   - Set `maxDepth` appropriately (typically 1 to 3 levels).
   - Use `includePaths` or `excludePaths` regex/patterns to ignore login pages, assets, or administrative URLs.
2. **Monitor Status**:
   - For asynchronous crawls, check the crawl job ID until completion.
3. **Consolidate Results**:
   - Aggregate crawled pages into a structured index or dataset (e.g. JSON/CSV).

### Procedure C: Structured Extraction (`firecrawl_extract`)
1. **Define Schema**: Provide a clear JSON schema describing the required entity structure (e.g., `title`, `date`, `amount`, `contractor`).
2. **Execute Extraction**: Pass the URLs and schema to extract structured JSON directly without writing manual regex/DOM parsers.

---

## 4. Troubleshooting & Fallbacks

- **Invalid API Key (401)**: Verify `FIRECRAWL_API_KEY` in `~/.gemini/config/mcp_config.json`.
- **Anti-Bot / Captcha Blocks**: Firecrawl handles standard anti-bot proxies by default; if blocked, inspect if target domain requires custom headers or residential proxies.
- **Node/npx Execution on Windows**: Ensure `cmd.exe /c npx -y firecrawl-mcp` is used in the MCP configuration to prevent Windows batch execution errors.

