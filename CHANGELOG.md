# Changelog — BrainIAc Engine
© 2026 CriAugu — CNPJ 65.131.075/0001-57

Todas as mudanças relevantes do projeto são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com).
Versionamento via [Semantic Versioning](https://semver.org).

---

## [Unreleased]
### Planned
- Auto-update do yt-dlp (verifica nova versão no startup)
- Fila de extração com retry e backoff exponencial
- Whisper como fallback para vídeos sem legenda
- Telemetria opt-in via Posthog
- Sistema de licença via Lemon Squeezy

---

## [0.3.1] — 2026-06-02
### Fixed
- Status "Interrompido" agora auto-reseta para "Ocioso" após 15s
- Indexação BM25 não exige mais chave de API (era local desde sempre)
- `configured: true` retornado quando Ollama disponível sem config salvo
- Chave de API não pré-carregada no campo ao abrir o app

### Added
- Notificação nativa do OS ao concluir extração
- Histórico de canais extraídos na aba Extração (lê CSVs de gestão)
- Endpoint `GET /history` com resumo por canal
- Ollama como provedor padrão sem necessidade de configuração
- Toggle "Usar minha chave de API" para provedores externos
- Botão "Limpar" para remover chave salva do disco

### Docs
- Porquê, alvos e proposta de valor refinados com origin story real (AUVP)
- Análise estratégica de gargalos: usuário, PO, CEO, investidor
- Próximos passos atualizados com decisões tomadas

---

## [0.3.0] — 2026-05-29
### Added
- Agente RAG local com BM25 (rank_bm25) — sem embeddings, sem API externa
- Indexação instantânea em JSON local, cache em memória
- Query expansion: LLM gera variações da pergunta, scores combinados
- Streaming de respostas via ReadableStream com cursor piscante
- Histórico de conversa (últimas 6 trocas no contexto do LLM)
- Multi-canal: indexar e buscar em N canais simultaneamente
- Ollama (llama3.2:1b) como provedor padrão gratuito e offline
- Provedores externos opcionais: Gemini, OpenAI, Anthropic (BYOK)
- Electron 34 com Python embeddable bundled
- Auto-update via electron-updater + GitHub Releases
- Ollama baixado automaticamente na primeira execução (Win/macOS/Linux)
- Detecção de OS para download correto do instalador Ollama
- Loading screen com status em tempo real durante setup
- Coleta de hashtags e descrições dos vídeos via yt-dlp
- Metadados do canal (nome, handle, inscritos) salvos em JSON
- Cabeçalho de atribuição ao criador em cada arquivo .txt
- Internacionalização PT/EN/ES com react-i18next
- Tema automático via prefers-color-scheme com persistência
- Accordions animados na aba Agente
- Card de canal com metadados na aba Agente
- NSIS installer com license.txt informando downloads adicionais
- Copyright © 2026 CriAugu em todos os arquivos principais

### Changed
- ChromaDB e embeddings substituídos por BM25 local
- Sub-langs fixo 'pt' (elimina 429 por detecção dinâmica)
- yt-dlp: dois subprocessos separados (fix bug simulação 2026)
- Dados em `%AppData%\BrainIAc\data\` (separado do diretório do app)

### Fixed
- 429 rate limit por --list-subs retornando 60+ idiomas
- google-genai SDK incompatível com text-embedding-004
- Botão "Configurado" aparecia antes de chave ser inserida

---

## [0.2.0] — 2026-05-01
### Added
- Interface web React 19 + Vite + Tailwind CSS 3
- FastAPI backend (localhost:8001)
- Google Drive sync opcional (OAuth2, escopo drive)
- Seletor de tipos de conteúdo (vídeos/shorts/lives/podcasts/cursos/playlists)
- Delta inteligente — não reextrai vídeos já processados
- Log em tempo real
- Barra de progresso com percentual
- Internacionalização básica

---

## [0.1.0] — 2025-12-01
### Added
- Extração básica de legendas via yt-dlp
- Interface CustomTkinter (desktop GUI)
- Upload para Google Drive
- Chunking em partes (MAX_WORDS_PER_FILE)
- CSV de gestão de metadados
- Suporte inicial ao canal @InvestidorSardinha (AUVP)
