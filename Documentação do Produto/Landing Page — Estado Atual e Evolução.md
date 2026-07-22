# Landing Page (tusab.solutions) — Estado Atual e Evolução

**Última auditoria do site ao vivo:** jul/2026
**Hospedagem:** externa, fora deste repositório (`https://tusab.solutions/`) — o Claude Code não tem acesso ao código-fonte, só pode ler a página publicada e propor copy/estrutura. Toda atualização listada aqui precisa ser aplicada manualmente por Augusto na ferramenta onde o site vive.

Este documento tem dois papéis:
1. **Snapshot fiel** do que está no ar hoje (texto literal, seção por seção) — para servir de baseline e evitar duplicar ou contradizer conteúdo já publicado.
2. **Lista viva de evolução** — o que falta, o que está desatualizado, e propostas de copy prontas para aplicar. Atualizar esta segunda parte a cada mudança relevante do produto (mesmo padrão já usado em `agents/_historia.md` para o código).

---

## 1. Snapshot do site — jul/2026 (texto literal)

### Headline
> Tusab — Indexe. Aprenda. Consulte.
> O conhecimento que você escolhe e que fala com você.
> INDEXE · APRENDA · CONSULTE

### Descrição das funcionalidades centrais (hero)
> Cole a URL de um canal do YouTube ou adicione PDFs, Word, planilhas, áudios e imagens. Indexado localmente em segundos.
>
> Busca Semântica Inteligente: Encontre a resposta exata em meio a diversas fontes de dados.
>
> Chat em linguagem natural com streaming. Cada resposta cita a fonte exata: vídeo, documento, timestamp.

### Seção "O que Tusab entrega" (5 promessas)
1. **Memória viva e ativa** — "Tudo que você assiste, lê ou anota — indexado, pesquisável, seu para sempre."
2. **Seu conhecimento, suas regras** — "Local, privado, sem servidor. Ninguém tem acesso ao que é seu."
3. **IA com a voz de quem você escolhe** — "IA que fala com a 'voz' de quem você escolheu ouvir."
4. **Acesso real à tecnologia** — "Funciona com modelos gratuitos, offline, no seu computador. Sem assinatura obrigatória."
5. **Você sabe de onde veio cada resposta** — "Todo trechos recuperados vem com fonte — vídeo, PDF ou documento. Sem caixa preta."

### Funcionalidades detalhadas (12 itens, texto completo)

| # | Título | Texto |
|---|--------|-------|
| 1 | Todo o conhecimento do YouTube, em texto | Transforme vídeos e canais inteiros em material pesquisável. O Tusab extrai tudo automaticamente para você consultar quando quiser. |
| 2 | Leitura inteligente de imagens | Fotos, gráficos e capturas de tela não são problema. O Tusab consegue extrair o texto dentro delas e até entender o contexto visual do que está sendo mostrado. |
| 3 | Respostas com provas reais | Converse com a IA de forma fluida. Ela responde suas dúvidas apontando exatamente de qual documento ou vídeo tirou aquela informação, eliminando invenções ("alucinações"). |
| 4 | Seus arquivos, suas regras | Faça upload de PDFs, documentos de texto, planilhas ou simplesmente cole informações direto na ferramenta. O Tusab entende e organiza praticamente tudo. |
| 5 | Transcrição de voz segura | Transforme áudios e gravações em texto diretamente na sua máquina. O processamento é rápido, garante sua privacidade e funciona totalmente sem internet. |
| 6 | No seu idioma e em segurança | Funciona em Português, Inglês e Espanhol. Se quiser proteção extra, salve uma cópia das suas bases de conhecimento direto no seu Google Drive. |
| 7 | Históricos sempre à mão | Importe conversas do WhatsApp ou transcrições de reuniões (Zoom, Teams) para encontrar rapidamente aquele acordo, link ou ideia importante do passado. |
| 8 | Trabalho no piloto automático | Quer baixar o conteúdo de vários canais ou dezenas de arquivos? Coloque tudo na fila e deixe o Tusab processando sozinho enquanto você foca em outras tarefas. |
| 9 | A Inteligência Artificial da sua escolha | Rode tudo de forma gratuita e offline, ou conecte as IAs mais poderosas do mercado (como ChatGPT e Gemini) se preferir. Você está no controle. |
| 10 | Um assistente com a sua cara | Quer respostas diretas, bem técnicas ou com jeito de professor? Escolha o tom da conversa ou crie uma personalidade única para te ajudar. |
| 11 | Foco total no que importa | Use o "@" para dizer à IA exatamente quais documentos ela deve consultar para responder uma pergunta, evitando misturar assuntos de projetos diferentes. |
| 12 | ❇️ 100% Local e Gratuito | Usando o motor padrão (Ollama), o Tusab funciona no seu computador com total privacidade. Sem precisar de internet, sem criar contas e sem assinaturas. |

### Seção de Diferenciais/Privacidade
> Seus dados não saem da sua máquina.
>
> 🔏 Local-first: Tudo processado no seu PC.
> 🎲 Sem servidor central: Zero dados nos nossos sistemas.
> 🛜 Funciona offline: Extração e chat sem internet
>
> Conformidade com LGPD

### Perfis de usuário (4 cards)
| Perfil | Texto |
|--------|-------|
| 🎓 Estudantes e pesquisadores | Transforme cursos, aulas, palestras e artigos na sua base de estudo pessoal. Pergunte, revise e conecte conteúdos — sem depender de memória ou caderno. |
| 🎙️ Criadores de conteúdo | Indexe seu próprio canal e documentado tudo o que já produziu. Consulte ideias antigas, encontre trechos específicos e reconstrua em cima do que já existe. |
| 💼 Profissionais e consultores | Transforme reuniões gravadas, documentos internos e materiais sigilosos de cliente em base consultável. Menos tempo procurando, mais tempo entregando. |
| 🏢 Times, empresas e instituições | Base de conhecimento privada e local — sem expor documentos a APIs externas. Ideal para hospitais que cruzam dados sensíveis, equipes jurídicas com contratos sigilosos ou empresas com acervos internos. |

### CTA final
> Pronto para ter seu especialista particular?
> Gratuito. Local. Seu.

### Download
> Baixar para Windows
> Windows 10/11 · Requer ~500 MB · Ollama opcional para modo 100% local

### Rodapé
> Augusto Alves Brasil — tusab@tusab.solution
> © 2026 CriAugu — CNPJ 65.131.075/0001-57 — Desenvolvido por Augusto Brasil

---

## 2. Lacunas identificadas (jul/2026)

Comparando o snapshot acima com o que já existe no produto (`CHANGELOG.md`, `agents/_historia.md`):

| Lacuna | Onde entraria | Status |
|--------|---------------|--------|
| **arXiv** (busca acadêmica, perfil Pesquisador, desde v1.0.36) | Item 13 na lista de funcionalidades; reforço no card "Estudantes e pesquisadores" | Copy pronta, não aplicada |
| **FHIR/ResearchStudy** (busca de estudos clínicos, perfil Pesquisador, desde v1.0.37) | Item 14 na lista de funcionalidades; reforço no card "Estudantes e pesquisadores" | Copy pronta, não aplicada |
| **TTS local no Modo Estudo** (build Beta/Enterprise, v1.0.36) | Nenhuma — não incluir ainda | Deliberadamente fora de escopo (ver nota abaixo) |
| **Versão/link de download desatualizado** | Rodapé de download não menciona versão — não é lacuna real, mas vale conferir periodicamente se o botão aponta para `releases/latest` (sempre correto) e não uma tag fixa |

**Por que TTS fica de fora:** é feature Beta/Enterprise, não vem no instalador padrão que a landing distribui. Anunciar geraria expectativa de algo que quem baixa não consegue usar — mesmo raciocínio já aplicado ao planejar o post de LinkedIn desta rodada.

---

## 3. Copy pronta para aplicar (arXiv + FHIR)

### 3.1 Novos itens na lista de "Funcionalidades" (13º e 14º)

> **Busca acadêmica no arXiv** — encontre e indexe artigos científicos por tema, direto do app
>
> **Busca de estudos clínicos (FHIR)** — pesquise estudos científicos em padrão internacional de dados de saúde, sem sair do Tusab

Nota: evitar detalhar "só ResearchStudy, nunca Patient" aqui — é argumento técnico/de confiança para quem já usa, não hook de aquisição. Cabe melhor em FAQ/blog (ver seção 4).

### 3.2 Reforço no card "🎓 Estudantes e pesquisadores"

Texto atual: *"Transforme cursos, aulas, palestras e artigos na sua base de estudo pessoal. Pergunte, revise e conecte conteúdos — sem depender de memória ou caderno."*

Proposta de expansão (mantendo o tom do card):
> Transforme cursos, aulas, palestras e artigos na sua base de estudo pessoal — e agora também busque direto no arXiv e em bases de estudos científicos (FHIR), sem sair do app. Pergunte, revise e conecte conteúdos — sem depender de memória ou caderno.

### 3.3 Reforço opcional na seção de Diferenciais/Privacidade

Frase curta, capitaliza o mesmo argumento usado no post de LinkedIn desta rodada:
> Mesmo em fontes de pesquisa acadêmica e dados científicos de saúde, a regra não muda: nada sai da sua máquina.

---

## 4. Backlog de evolução (para além do que já está pronto)

Ideias para quando o produto avançar — não implementar sem gatilho real:

- **Página de FAQ/blog** com o detalhamento técnico que não cabe na home (ex: por que FHIR é restrito a `ResearchStudy`, o que é local-first de fato, comparativo vs. NotebookLM/AnythingLLM). Hoje a landing não tem espaço para isso e forçar detalhe técnico na home dilui a conversão.
- **Seção de preços/planos**: hoje só existe "gratuito" — quando P5 (sistema de licença, ver `Roadmap.md`) sair do papel, a landing precisa de uma seção de tiers.
- **Prova social / cases**: não há depoimentos nem métricas de uso hoje. Avaliar quando houver caso documentado real (regra já usada para B2B: caso documentado → landing → venda).
- **Menção ao MCP Server**: diferencial técnico único (`agents/produto.md`), hoje ausente da landing — público-alvo é developer/comunidade técnica, pode virar seção própria ou nota no rodapé com link para documentação.
- **Vídeo/GIF demonstrando o timestamp clicável (▶ MM:SS)**: diferencial #1 do produto segundo `agents/produto.md`, mas a landing hoje é só texto — maior alavancagem de conversão citada nas táticas de marketing já registradas (`agents/marketing.md`, seção "Conteúdo").

---

## Como manter este documento vivo

- Sempre que uma feature nova sair do papel e tiver potencial de aquisição (não toda feature — critério é o mesmo do popup de novidades: "algo grandioso"), adicionar à seção 2 (Lacunas) e preparar a copy na seção 3.
- Depois que Augusto aplicar uma atualização na landing real, mover o item de "copy pronta" para o snapshot da seção 1 e atualizar a data da auditoria no topo.
- Revisitar a página ao vivo (`WebFetch`) antes de propor qualquer copy nova — nunca assumir que o snapshot salvo aqui ainda reflete o site publicado, ele pode ter sido atualizado manualmente sem passar por esta documentação.
