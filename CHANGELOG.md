# Changelog — Tusab
© 2026 CriAugu — CNPJ 65.131.075/0001-57

---

## [1.0.30] — 2026-07-01
### Adicionado
- **`@@trecho` injeta contexto diretamente no LLM** — trechos selecionados via `@@busca` no chat são enviados como contexto fixo, sem re-processar pelo BM25. O LLM vê exatamente o trecho que você selecionou.

### Corrigido
- **Banner de atualização do app** — ao detectar nova versão, mostra progresso do download + link "Baixar manualmente" como fallback. Quando o download termina, botão muda para "Instalar e reiniciar". Removida mensagem contraditória anterior.

---

## [1.0.28] — 2026-07-01
### Corrigido
- **`+ Arquivo` no Repositório vira chip no chat** — botão adiciona o arquivo como chip de contexto fixado (mesmo comportamento do `@` no chat), em vez de injetar o conteúdo completo no input.

---

## [1.0.27] — 2026-07-01
### Adicionado
- **Menção `@arquivo` no chat** — digitar `@` abre dropdown com todos os arquivos do projeto; selecionar fixa o arquivo como filtro BM25
- **Menção `@@busca` no chat** — digitar `@@termo` executa busca BM25 real na base; resultados aparecem com o termo destacado em âmbar
- **Chips de contexto na bolha da mensagem** — arquivos/trechos fixados via `@`/`@@` aparecem como chips coloridos na bolha do usuário
- **Highlight de termos no Repositório** — termo buscado aparece destacado com fundo âmbar nos trechos encontrados

### Corrigido
- Resposta na fila aparecia na mensagem errada (`streamId` único por envio corrige identidade)
- Saudações ("Oi", "Hi", "Hola") traziam fontes irrelevantes — forçado modo CONVERSA
- Fontes exibidas mesmo quando `sem_contexto: true`
- `/agent/arquivos` retornava vazio em projetos com subdiretórios de `youtube/`
- `NameError` no fallback multi-projeto (`cached` não definido no caminho merged)
- `AttributeError` em `_meta.json` com schema inesperado

---

## [1.0.26] — 2026-06-30
### Adicionado
- **FTS5 (SQLite) como camada de busca exata** — em paralelo ao BM25; garante recall de termos literalmente presentes (nomes próprios, siglas, termos técnicos)
- **Renderização Markdown no chat** — listas, negrito, tabelas e quebras de linha renderizam corretamente
- Botão flutuante de chat redesenhado com glow pulsante e badge de status
- Toast de citação desloca-se com o drawer do chat (não sobrepõe)

### Corrigido
- 4 fixes de recall BM25 (scoring, agregação multi-query, threshold, deduplicação FTS5)
- Path traversal em `fts.py` — `_sanitizar_prefixo()` bloqueia caracteres especiais
- Modal de bases: desmarcar todas exibe aviso e desabilita "Confirmar"

---

## [1.0.25] — 2026-06-30
### Adicionado
- **Classificador de intenção BUSCA / CONTEXTO / CONVERSA** — follow-ups como "traduza isso" operam sobre a resposta anterior sem re-buscar; saudações respondem sem busca. Roda em paralelo ao BM25 — sem latência extra.
- Dicas de uso nas frases de loading do chat
- Placeholder agnóstico no chat

### Corrigido
- [CRÍTICO] Stream de chat nunca acumulava chunks de texto (except: pass descartava tudo)
- Fallback CONTEXTO→BUSCA quando não há resposta anterior
- Stop token `'.'` removido do Ollama (truncava a classificação)

---

## [1.0.24] — 2026-06-30
### Corrigido
- Aba Ferramentas ocultada temporariamente (backend assíncrono não pronto; evita timeout de 300s)
- initialSubTab inválido ao navegar para aba Agente pela Home

---

## [1.0.23] — 2026-06-30
### Adicionado
- **Chunking temporal por janela** — vídeos sem capítulos geram chunks de 2 min com overlap de 15s; um vídeo de 12 min passa de 1 para ~7 chunks com timestamps distribuídos
- **Enriquecimento BM25 com KeyBERT** — palavras-chave extraídas de cada chunk e adicionadas ao corpus invisível; consultas por sinônimos funcionam sem correspondência literal
- **"Aprofundar base"** — sumarização LLM por vídeo (tema, subtemas, entidades, conclusão) injetada no prompt antes dos chunks
- Modal "Aprofundar base" com progresso em tempo real
- Onboarding interativo para configuração do Ollama com download de modelo embutido

### Corrigido
- [CRÍTICO] "Aprofundar base" nunca disparava (chave `'total'` vs `'pendentes'`)
- [CRÍTICO] Troca de modelo no onboarding apagava chave de API externa
- Chunk reduzido de 8.000 para 3.000 chars (melhor precisão BM25)

---

## [1.0.22] — 2026-06-29
### Corrigido
- Chat: base ativa agora pode ser desmarcada no modal de seleção
- "Tom" abre sub-aba Configurações corretamente
- Relatório com feedback visual durante extração em andamento
- Toggle do Drive volta ao estado neutro ao cancelar

---

## [1.0.21] — 2026-06-29
### Corrigido
- Crash ao clicar "Indexar base" no Repositório (erro React #299 — createPortal sem container DOM)

---

## [1.0.20] — 2026-06-29
### Corrigido
- [CRÍTICO] "Limpar base" apagava todos os projetos em vez do projeto selecionado
- [CRÍTICO] Troca de idioma zerando chave de API externa
- Extração sem canal configurado: modal agora inicia pelo step de URL
- Mensagem perdida silenciosamente quando fila cheia — input permanece preenchido
- Falha de export sem feedback — snackbar de erro em vermelho

---

## [1.0.17–1.0.19] — 2026-06-29
- Notificações do sistema (aba Admin) com controle e status em tempo real
- Atalho Shift+C para abrir o chat corrigido
- CORS no dev server corrigido
- `UpdateSuccessModal`: não abre com versão vazia; link aponta para a release correta

---

## [1.0.16] — 2026-06-28
### Adicionado
- **Janela de ajuda nativa (F1)** — FAQ PT/EN/ES, atalhos de teclado, contato e versão dinâmica
- **Confirmação pós-atualização** — app reabre exibindo nova versão e link para as novidades

### Corrigido
- App reabre automaticamente após instalar atualização
- `latest.yml` gerado com nome correto para o `electron-updater` localizar o instalador

---

## [1.0.15] — 2026-06-28
- Notificação de atualização disponível na tela de entrada com badge de versão e botão de instalação

---

## [1.0.14] — 2026-06-28
- Termos de licença do instalador NSIS traduzidos para PT-BR, EN e ES

---

## [1.0.13] — 2026-06-27
- Instalador NSIS multilíngue com detecção automática do idioma do sistema

---

## [1.0.12] — 2026-06-27
### Adicionado
- Mapa de cobertura pré-extração — visualizar quais vídeos já foram extraídos antes de iniciar
- Capítulos de vídeo como fronteiras de chunk BM25

---

## [1.0.0–1.0.11] — 2026-06-20 a 2026-06-27

Lançamento inicial e iterações de estabilização:
- Extração de YouTube, RAG local com BM25 + CrossEncoder, chat com streaming e citação de fonte
- Multi-base, perfis de usuário (Estudante, Especialista, Pesquisador, Professor)
- Onboarding interativo com i18n PT/EN/ES
- Google Drive (backup), exportação de base `.tusab`, auto-update via GitHub Releases
- Parser WhatsApp (Android + iOS) e transcrições de reunião (Zoom, Teams, Otter)
- Wizard de instalação do Ollama embutido no app
- Tela de loading, landing screen e CircuitBackground animado
- Sistema de agentes especialistas internos (QA, Frontend, Backend, Produto, UX, Inovação)
