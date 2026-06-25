# Tusab

**INDEX · AUGMENT · CONVERSE**

Seu especialista particular. Aponte o que quer aprender — um canal do YouTube, um PDF, um documento — o Tusab absorve tudo e responde suas perguntas citando a fonte exata. Roda na sua máquina, funciona offline, zero custo com Ollama.

Desenvolvido por **Augusto Brasil** · [CriAugu](https://linkedin.com/in/augustoalvesbrasil) · [tusab.solutions](https://tusab.solutions)

---

## Download

**[⬇ Tusab Setup 1.0.4.exe](https://github.com/ahaugusto/tusab-public/releases/download/v1.0.4/Tusab.Setup.1.0.4.exe)** — Windows 10/11 x64 · ~210 MB · inclui Python e yt-dlp embutidos

> Não requer instalação de Python, Ollama ou qualquer dependência adicional. O instalador cuida de tudo.

---

## O que é

Tusab é um sistema de gestão de conhecimento pessoal (PKM) com IA local. Você decide o que o especialista aprende — vídeos, documentos, anotações — e consulta por chat em linguagem natural. Ele só responde com o que você indexou, sempre citando a fonte exata de onde o trecho foi recuperado.

| Letra | Etapa | O que faz |
|-------|-------|-----------|
| **I** | Index | Extração e indexação de YouTube, PDFs, DOCX, Markdown, texto livre |
| **A** | Augment | RAG com BM25 + CrossEncoder entrega os trechos mais relevantes ao modelo |
| **C** | Converse | Chat com streaming, citação de fonte verificável e histórico de conversa |

---

## Funcionalidades

- Extração automática de canais inteiros do YouTube (legendas + metadados)
- Upload de PDFs, DOCX, Markdown, CSV e TXT
- Parser automático de conversas WhatsApp e transcrições de reuniões (Zoom, Teams, Otter)
- Colar texto diretamente pela interface
- Agente RAG local: BM25 + CrossEncoder (ms-marco-MiniLM-L-6-v2) + anti-alucinação
- Busca Restrita (rápida, ~1 ms) e Busca Ampla (semântica, ~250 ms)
- Chat com streaming de resposta e citação verificável da fonte
- Multi-base: consulta simultânea em múltiplas bases de conhecimento
- Seletor de modelos Ollama e provedores externos (Groq, OpenAI, Anthropic, Google)
- Backup opcional para Google Drive (escopo mínimo `drive.file`)
- Export da base como `.tusab` (portabilidade entre máquinas)
- Relatório de extração por canal com estatísticas e tabela de vídeos
- Auto-update via GitHub Releases
- Internacionalização: Português, Inglês, Espanhol

---

## Provedores de IA suportados

| Provedor | Custo | Requer conexão |
|----------|-------|----------------|
| **Ollama** (padrão) | Gratuito | Não — 100% local |
| Groq | Free tier | Sim |
| OpenAI | Pago | Sim |
| Anthropic | Pago | Sim |
| Google Gemini | Pago | Sim |

O Ollama é configurado na primeira execução via wizard embutido. Para provedores externos, a chave é testada antes de ser salva e armazenada com criptografia DPAPI (Windows).

---

## Stack

**Backend:** Python 3.12 + FastAPI — API REST local em `localhost:8001`  
**Agente RAG:** BM25Okapi + CrossEncoder (sentence-transformers) + Ollama / provedores externos  
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

## Como funciona (visão geral)

```
YouTube / PDF / DOCX / TXT
        ↓
   Extração local
   (yt-dlp, pdfplumber)
        ↓
   Indexação BM25
   (rank-bm25, sentence-transformers)
        ↓
   Pergunta do usuário
        ↓
   Recuperação de trechos relevantes
   (BM25 + CrossEncoder reranking)
        ↓
   LLM local (Ollama) ou externo
        ↓
   Resposta com citação de fonte
```

---

## Perguntas frequentes

**O Tusab acessa meus arquivos sem eu pedir?**  
Não. Ele só lê os arquivos que você explicitamente adiciona na aba Repositório ou extrai via URL do YouTube.

**Funciona sem internet?**  
Sim, com Ollama. A extração do YouTube requer conexão (para baixar as legendas). Provedores externos como OpenAI ou Gemini também precisam de internet.

**Meus dados vão para a nuvem?**  
Não, a menos que você ative o Google Drive (opcional) ou use um provedor de IA externo — nesse caso, as perguntas e os trechos de contexto são enviados ao provedor escolhido.

**É gratuito?**  
A versão atual é gratuita. Funcionalidades avançadas (exportação em DOCX/PDF, fila ilimitada) serão parte de um plano Pro em versão futura.

**O código-fonte está disponível?**  
O Tusab é software proprietário. O código-fonte não é público, mas a arquitetura, a stack e o funcionamento estão documentados aqui e em [tusab.solutions](https://tusab.solutions).

---

## Suporte e contato

- **Bugs e sugestões:** [abra uma issue](https://github.com/ahaugusto/tusab-public/issues)
- **E-mail:** tusab@tusab.solutions
- **Site:** [tusab.solutions](https://tusab.solutions)

---

## Changelog

### [1.0.4] — 2026-06-25

- Tela de loading em preto e branco (identidade da marca)
- Instalador oferece instalar o Ollama automaticamente durante o setup
- Botão de download direto do Ollama no app (sempre versão mais recente)
- Alerta visual claro quando Ollama não está instalado (amber, não verde)
- Chip "ativo" corrigido — não aparecia quando Ollama não estava rodando
- Estimativa de tempo restante durante download de modelos

### [1.0.3] — 2026-06-24

- Fix crítico: crash imediato do backend em instalações novas (ModuleNotFoundError: motor_tusab)
- Tela de loading alinhada visualmente com a landing: pulsos animados no grid, glow azul/violeta

### [1.0.2] — 2026-06-24

- Fix: timeout do backend aumentado para 90 segundos — resolve erro "Timeout aguardando backend" na primeira execução em máquinas novas
- Feedback progressivo na tela de loading durante a inicialização dos modelos de IA
- Log do Python exibido no diálogo de erro para facilitar diagnóstico

### [1.0.1] — 2026-06-24

- Acordo de licença do instalador corrigido (referência ao produto anterior removida)
- E-mail de contato unificado para tusab@tusab.solutions
- Base selecionada no chat persiste entre recarregamentos da página
- Alerta ao tentar extrair canal já indexado — evita extração duplicada acidental
- Modal de projeto: input oculto ao selecionar projeto existente; card de confirmação com botão Trocar
- Seletor de projeto com feedback visual claro (fundo sólido + check + escala)
- Chips viram select quando há mais de 4 projetos (evita overflow do modal)
- Atalho para pasta local de cada base no Repositório
- Tooltip no botão de chat (hover e teclado)
- Link de download direto do .exe (sem necessidade de login no GitHub)
- Dependências Python documentadas com versões mínimas pinadas por seção
- Tela de loading atualizada com novo visual (alinhada ao design atual)
- Correção crítica: python não era encontrado ao instalar em outro PC (caminho errado no empacotador)

### [1.0.0] — 2026-06-20

Lançamento inicial. Extração de YouTube, RAG local com BM25 + CrossEncoder, chat com streaming e citação de fonte, multi-base, perfis de usuário, onboarding, i18n PT/EN/ES, Google Drive, exportação de base `.tusab`, auto-update.

---

## Licença

Copyright © 2026 CriAugu — CNPJ 65.131.075/0001-57  
Todos os direitos reservados. Lei nº 9.609/1998 (Lei do Software).  
Proibida reprodução sem autorização expressa.
