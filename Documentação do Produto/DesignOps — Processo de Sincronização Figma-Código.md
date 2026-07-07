# DesignOps — Processo de Sincronização Figma ↔ Doc ↔ Código
**Status:** Processo ativo — jul/2026
**Origem:** Consolidação de decisão após atualização real da biblioteca Figma (feature de busca arXiv) e avaliação conjunta de `/design-system`, `/ui`, `/ux`, `/product-designer`

---

## Por que este documento existe

O Tusab não tem squad de design — é um projeto solo (Augusto Brasil) operado com agentes especializados via Claude Code. Isso significa que não existem os checkpoints naturais de um time (PM cobra, designer entrega, dev implementa, QA valida). Sem ritualizar o processo, qualquer coisa desenhada fora do código — no Figma, em pesquisa de usuário, ou futuramente em ferramentas generativas como o Claude Design — vira **artefato órfão**: existe, mas nunca vira produto.

Este documento formaliza o processo que evitou isso na prática (feature de busca arXiv, jul/2026) para que se repita por hábito, não por sorte.

---

## 1. Hierarquia de verdade — nunca ambígua

```
Código em produção (web_interface/src/)
        ↓ é a fonte
Documentação do Design System
  (Design System — Tusab.md + Inventário de Componentes.md)
        ↓ documenta
Biblioteca Figma
  (https://www.figma.com/design/IEXW4hMNlGcNUarBaLy1pb)
        ↓ espelha
Ferramentas externas de exploração
  (Claude Design, testes de usabilidade, protótipos)
```

**Regra inegociável:** divergência entre qualquer camada é bug — corrige-se sempre na direção do código. O Figma nunca lidera uma decisão visual que o código não reflete; ferramentas externas de exploração nunca são citadas como "como o produto funciona" sem checar contra o código primeiro.

Ver `CLAUDE.md`, seção "Design System", para os links vivos desta hierarquia.

---

## 2. O gatilho de sincronização — por feature, não por calendário

Não existe cadência fixa (semanal/mensal) de revisão Figma↔código. Cadência fixa sem squad vira ritual sem conteúdo real na maioria dos ciclos.

**O gatilho é a própria feature.** Toda vez que uma feature nova toca um componente canônico (mesmo critério de "3+ usos reais" já usado pelo `/design-system` para propor token novo), o ciclo de sincronização roda como parte do trabalho, não como tarefa separada:

1. Feature implementada e testada (QA)
2. `/ui` e `/ux` avaliam achados de qualidade que impactam padrão visual/fluxo
3. `/design-system` decide: token novo, componente novo, ou reaproveitar existente — sempre com medição real (grep), nunca estimativa
4. Doc atualizado no mesmo ciclo (`Design System — Tusab.md` e/ou `Inventário de Componentes.md`)
5. Figma atualizado via MCP no mesmo ciclo — component set, variantes, descrição do componente
6. `/frontend` implementa (ou já implementou, se o ciclo começou por código)

**Precedente real (jul/2026):** feature de busca arXiv → QA encontrou 3 warnings de UX/UI → `/ui`+`/ux` propuseram toast `warning` + indicador persistente → `/design-system` formalizou como 4º tipo de `ProgressToast` e nomeou o padrão "Indicador de Operação em Background" → doc atualizado → Figma atualizado (novo variant `Type=Warning`, descrições de componente revisadas) → `/frontend` implementou. Nenhuma etapa ficou solta.

---

## 3. Quem audita

`/design-system` é o agente guardião — já descrito como "consultado ANTES de qualquer componente novo nascer". Não é um papel novo; é o hábito de efetivamente chamá-lo no fluxo, em vez de pular direto para código quando surge um padrão visual novo.

---

## 4. Critério de fechamento de ciclo para exploração fora do código

Ao abrir Figma, Claude Design, ou qualquer sessão de teste de usabilidade/prototipagem, definir **antes de começar**:
- Qual pergunta está sendo respondida (ex.: "essa jornada teria menos fricção com outro layout de modal?")
- O que conta como resposta suficiente para agir

**Toda sessão de exploração termina com uma decisão explícita**, uma das duas:
- Implementar agora (segue o gatilho da seção 2)
- Registrar como adiado, com motivo, em `agents/_historia.md` (seção "Benchmark" ou equivalente)

Nunca "ficou interessante, ver depois" sem registro — isso é o que gera artefato órfão.

`/product-designer` é o agente que arbitra essa decisão quando não é óbvia (ver seção 5 do seu framework: Job to be Done + Coerência UX/UI + Viabilidade e impacto).

---

## 5. Caso resolvido nesta sessão — lacuna de light mode no Figma

**Situação encontrada:** a biblioteca Figma tinha todos os componentes construídos (`ProgressToast`, `NavItem`, `Card`, `Toggle`, `Badge`, `InlineFeedback`) apenas em dark mode. Os tokens de cor já tinham variável Light/Dark vinculada (collection `Color`, ex. `color/primary` L #1558B0 / D #4B9FE8) — só os componentes nunca usaram essa segunda dimensão.

**Decisão (convergência dos 4 agentes consultados):**

| Eixo | Veredito |
|---|---|
| É dívida real? | Sim — "dark-first" (princípio de produto) não justifica ausência total de light no Figma (ferramenta de handoff); são coisas diferentes |
| É urgente? | Não — o código funciona perfeitamente em light mode; a lacuna afeta só a capacidade de prototipar no Figma, não a experiência do usuário final |
| Mecânica técnica correta | Figma Variables com modo Light/Dark (já existe na collection `Color`) — **nunca** duplicar `COMPONENT` com propriedade `Theme=Dark/Light`, que dobraria a manutenção e divergiria do padrão do código (classe condicional `dark:`, não duplicação de JSX) |
| Quando implementar | Oportunisticamente, componente por componente, só quando a próxima feature já for tocar aquele componente — nunca como sprint dedicada |
| Prioridade vs. roadmap de produto | Não entra no roadmap agora — custo de oportunidade real frente à janela estratégica de 12–18 meses (NotebookLM/AnythingLLM). É manutenção de infraestrutura de design, não trabalho que move ativação ou diferencial percebido |

**Onde isso vive no roadmap:** dentro do DS-4 já existente (`Design System — Tusab.md`, seção 12 — "biblioteca Figma via MCP sincronizada com os tokens"), como responsabilidade contínua, não uma fase numerada nova.

---

## 6. Sobre ferramentas de exploração generativa (Claude Design e futuras)

O repositório já está preparado para import externo (ver `CLAUDE.md`, seção "Design System"): hierarquia de verdade declarada, docs linkados, biblioteca Figma linkada com o que existe e o que falta (light mode incluso, como nota factual).

Qualquer resultado gerado por uma ferramenta externa (protótipo, jornada nova, teste de usabilidade) entra no mesmo funil da seção 4 — não ganha tratamento especial só por vir de uma ferramenta nova. A pergunta é sempre a mesma: isso implementa agora, ou registra como adiado?
