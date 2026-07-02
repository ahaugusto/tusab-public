# Tusab

**INDEX · AUGMENT · CONVERSE**

Seu especialista particular. Aponte o que quer aprender — um canal do YouTube, um PDF, um documento — o Tusab absorve tudo e responde suas perguntas citando a fonte exata. Roda na sua máquina, funciona offline, zero custo com Ollama.

Desenvolvido por **Augusto Brasil** · [CriAugu](https://linkedin.com/in/augustoalvesbrasil) · [tusab.solutions](https://tusab.solutions)

---

## Download

**[⬇ Tusab Setup 1.0.31.exe](https://github.com/ahaugusto/tusab-public/releases/download/v1.0.31/Tusab%20Setup%201.0.31.exe)** — Windows 10/11 x64 · ~223 MB · inclui Python e yt-dlp embutidos

> Não requer instalação de Python, Ollama ou qualquer dependência adicional. O instalador cuida de tudo.

---

## O que é

Tusab é um sistema de gestão de conhecimento pessoal (PKM) com IA local. Você decide o que o especialista aprende — vídeos, documentos, anotações — e consulta por chat em linguagem natural. Ele só responde com o que você indexou, sempre citando a fonte exata de onde o trecho foi recuperado.

| Letra | Etapa | O que faz |
|-------|-------|-----------|
| **I** | Index | Extração e indexação de YouTube, PDFs, DOCX, Markdown, texto livre |
| **A** | Augment | RAG com BM25 + FTS5 + CrossEncoder entrega os trechos mais relevantes ao modelo |
| **C** | Converse | Chat com streaming, citação de fonte verificável e histórico de conversa |

---

## Funcionalidades

### Extração e indexação
- Extração automática de canais inteiros do YouTube (legendas + metadados)
- Chunking temporal por janela para vídeos sem capítulos (trechos de 2 min com overlap)
- Upload de PDFs, DOCX, Markdown, CSV e TXT
- Parser automático de conversas WhatsApp e transcrições de reuniões (Zoom, Teams, Otter)
- Colar texto diretamente pela interface

### Chat e RAG
- **BM25 + FTS5 + CrossEncoder** — três camadas de recuperação: BM25 para relevância, SQLite FTS5 para matches exatos, CrossEncoder (ms-marco-MiniLM-L-6-v2) para reranqueamento semântico
- **Busca Restrita** (rápida, ~1 ms) e **Busca Ampla** (semântica com CrossEncoder, ~250 ms)
- **Classificador de intenção** — distingue BUSCA / CONTEXTO / CONVERSA; follow-ups como "traduza isso" operam sobre a resposta anterior sem re-buscar
- **`@arquivo` no chat** — digitar `@` abre dropdown com todos os arquivos do projeto; selecionar fixa o arquivo como filtro BM25
- **`@@busca` no chat** — digitar `@@termo` executa busca BM25 real na base e retorna trechos com destaque; o trecho selecionado é injetado diretamente no contexto do LLM
- **Chips de contexto** — arquivos e trechos fixados via `@`/`@@` aparecem como chips visuais na bolha da mensagem, tornando o contexto referenciado visível
- Enriquecimento silencioso do corpus BM25 com palavras-chave via KeyBERT
- Sumarização LLM por vídeo ("Aprofundar base") — resumo estruturado injetado antes dos chunks
- Multi-base: consulta simultânea em múltiplas bases de conhecimento
- Histórico de conversa persistente com retomada de sessões anteriores
- Fila de mensagens — envie a próxima pergunta enquanto a resposta ainda está chegando
- Feedback de resposta (👍 salva o par pergunta/resposta na base para melhorar recall futuro)

### Repositório
- Listagem e gerenciamento de documentos, textos e vídeos indexados por projeto
- Busca com highlight de termos dentro dos trechos encontrados
- Botão `+ Arquivo` adiciona o arquivo diretamente como chip de contexto no chat
- Busca federada de trechos (`ReferenciarModal`) — busca em múltiplas bases e injeta trechos no chat

### Organização
- **Projetos** — cada base de conhecimento vive em um projeto separado; um canal pode ser importado para qualquer projeto
- **Perfis de usuário** — Estudante, Especialista, Pesquisador, Professor — adaptam a navegação e os perfis de resposta
- **Tom/Persona** — Objetivo, Técnico, Didático, Descontraído, Socrático

### Providers de IA
| Provedor | Custo | Requer conexão |
|----------|-------|----------------|
| **Ollama** (padrão) | Gratuito | Não — 100% local |
| Groq | Free tier | Sim |
| OpenAI | Pago | Sim |
| Anthropic | Pago | Sim |
| Google Gemini | Pago | Sim |

### Outros
- Backup opcional para Google Drive (escopo mínimo `drive.file`)
- Auto-update do app via GitHub Releases (banner + botão "Instalar e reiniciar")
- Auto-update da base — verificação automática de novos vídeos por canal (diário, semanal, mensal)
- Export de relatório por canal (tabela de vídeos + stats)
- Janela de ajuda nativa (F1) — FAQ PT/EN/ES, atalhos de teclado
- Internacionalização: Português, Inglês, Espanhol

---

## Stack

**Backend:** Python 3.12 + FastAPI — API REST local em `localhost:8001`  
**Agente RAG:** BM25Okapi + SQLite FTS5 + CrossEncoder (sentence-transformers) + KeyBERT  
**Frontend:** React 19 + Vite + Tailwind CSS  
**Desktop:** Electron 34 + instalador NSIS  
**Extração:** yt-dlp + pdfplumber + python-docx

---

## Privacidade e segurança

O Tusab é **local-first**: seus dados ficam na sua máquina. A CriAugu não tem servidores que armazenam seu conteúdo, suas conversas ou suas bases de conhecimento.

- Transcrições, documentos e textos ficam em `%AppData%\Tusab\data\neural\`
- Nenhum conteúdo da base é enviado a servidores da CriAugu
- A telemetria de uso é **opt-in** — você escolhe na primeira execução e pode revogar a qualquer momento
- Ao usar provedores externos (OpenAI, Gemini etc.), o conteúdo das consultas vai para os servidores desses provedores — o Tusab exibe aviso explícito ao configurar
- Chaves de API armazenadas localmente via DPAPI (Windows) — nunca transmitidas à CriAugu
- CORS restrito a `localhost`, Electron com sandbox ativo, yt-dlp executado sem `shell=True`

Política de privacidade completa: **[tusab.solutions/privacidade](https://tusab.solutions/privacidade)**

---

## Como funciona

```
YouTube / PDF / DOCX / TXT / WhatsApp / Reunião
        ↓
   Extração local
   (yt-dlp, pdfplumber, parser especial)
        ↓
   Chunking + Enriquecimento KeyBERT
   + Sumarização LLM (opcional)
        ↓
   Indexação BM25 + FTS5 SQLite
        ↓
   Pergunta do usuário
   + @arquivo / @@trecho (contexto fixado)
        ↓
   Classificador de intenção (BUSCA / CONTEXTO / CONVERSA)
        ↓
   Recuperação BM25 + FTS5 exact-match
   + CrossEncoder reranking (Busca Ampla)
        ↓
   LLM local (Ollama) ou externo
        ↓
   Resposta com citação de fonte verificável
```

---

## Perguntas frequentes

**O Tusab acessa meus arquivos sem eu pedir?**  
Não. Ele só lê os arquivos que você explicitamente adiciona no Repositório ou extrai via URL do YouTube.

**Funciona sem internet?**  
Sim, com Ollama. A extração do YouTube requer conexão (para baixar as legendas). Provedores externos como OpenAI ou Gemini também precisam de internet.

**Meus dados vão para a nuvem?**  
Nunca para a CriAugu. Se você usar um provider externo (OpenAI, Gemini etc.), as perguntas e trechos vão para os servidores desse provider — o Tusab avisa explicitamente antes.

**Posso usar sem o Ollama?**  
Sim. Configure qualquer provider externo na aba Agente → Configurações. Groq tem um free tier generoso.

**O chat responde coisas fora da minha base?**  
Não. O Tusab só usa o conteúdo que você indexou. Se não encontrar nada relevante, informa explicitamente e oferece opção de indexar.

---

## Changelog

Histórico completo em [CHANGELOG.md](CHANGELOG.md).

### v1.0.31 — 2026-07-01
- **[CRÍTICO]** Fix do preload do Electron no app instalado — v1.0.30 ficava inoperante (sem indexação, sem chat) em máquinas de usuários por bloqueio de CORS em cascata

### v1.0.30 — 2026-07-01
- `@@trecho` injeta contexto diretamente no LLM — sem re-processar pelo BM25
- Banner de atualização do app com botão "Instalar e reiniciar" e link de download manual

### v1.0.28–1.0.27 — 2026-07-01
- Menção `@arquivo` e `@@busca` no chat com chips visuais e highlight de termos
- Botão `+ Arquivo` no Repositório adiciona como chip de contexto (não injeta texto)

### v1.0.26 — 2026-06-30
- FTS5 (SQLite) como terceira camada de busca exata
- Renderização Markdown no chat (listas, negrito, tabelas)

### v1.0.25 — 2026-06-30
- Classificador de intenção BUSCA / CONTEXTO / CONVERSA
- Follow-ups operam sobre resposta anterior sem re-buscar BM25

### v1.0.23 — 2026-06-30
- Chunking temporal por janela para vídeos sem capítulos
- Enriquecimento BM25 com KeyBERT
- "Aprofundar base" — sumarização LLM por vídeo

---

## Licença

Copyright © 2026 CriAugu — CNPJ 65.131.075/0001-57  
Todos os direitos reservados. Lei nº 9.609/1998 (Lei do Software).  
Proibida reprodução sem autorização expressa.
