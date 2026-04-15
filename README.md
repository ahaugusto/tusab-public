# 🧠 Brain'IAc — Intelligence Engine

> **Motor de extração de conhecimento para YouTube** — transforme qualquer canal público em uma base de dados estruturada, pronta para ser ingerida por ferramentas de IA como NotebookLM e Gemini.

Desenvolvido por **Augusto Brasil** · [CriAugu](https://criaugu.com.br)

---

## 🎯 O que é o Brain'IAc?

O **Brain'IAc** é uma ferramenta desktop Python que automatiza a construção de uma base de conhecimento corporativa ou de estudos a partir do conteúdo de qualquer canal público do YouTube.

Você informa a URL. O motor varre tudo (Vídeos, Shorts, Podcasts, Lives, Cursos e Playlists), extrai as legendas baseadas em tempo, limpa o texto e o particiona em blocos otimizados para sistemas de IA com **arquitetura RAG (Retrieval-Augmented Generation)**. Tudo de forma inteligente, iterativa (nunca extrai duas vezes) e sincronizada na nuvem.

**Características:**
* **Extração textual apenas:** Não baixa os arquivos pesados de vídeo/áudio, extraindo apenas os arquivos das legendas (VTT).
* **Chunking Vetorial:** Divide automaticamente o conteúdo em blocos de até 40.000 palavras para evitar limite de tokens e prevenir o Erro 500 em LLMs.
* **Smart Sync (Google Drive):** Sincroniza relatórios, banco SQL (em CSV) e metadados diretamente para o Google Docs no seu Drive pessoal.
* **Graceful Shutdown:** Permite pausar e cancelar. Ao cancelar, o sistema sinaliza fim do laço, salva último estado e sobe os relatórios ao Drive em base limpa.

---

## 📐 Duas Arquiteturas no Projeto

Pensado para flexibilidade, este repositório possui dois motores independentes:

1. **`motor_brainiac.py` + `app_brainiac.py` (Oficial & Atual)**
   - Versão completa com painel de Telemetria Dinâmico (Logs codificados por cores, timestamps).
   - Integração completa via API OAuth2 com o Google Drive para auto-salvamento em nuvem.
   - Possui Pausa Dinâmica e Graceful Shutdown.
   
2. **`engine_brainiac.py` (Motor Standalone offline)**
   - Versão simplificada que faz a inteligência de baixar, ripar o VTT e salvar em `brainiac_txt/` somente localmente.
   - Ideal para automações futuras, testes rápidos ou setups sem conexão com API do Google Drive.

---

## ⚙️ Pipeline de Execução (Modo Oficial)

1. **Mapeamento:** `yt-dlp` varre as seções do canal montando lista com UUIDs, Data, Views e Título. Compara com CSV de estados anteriores.
2. **Extração Local:** Para o delta inédito, baixa metadados (`.vtt`), recorta tags e gera chunks semânticos (`.txt`).
3. **Controle:** Audita estado, views e sucessos em `base.csv`. 
4. **Sync Drive:** Envia os Docs vetoriais, os relatórios e CSVs para `/Gestao_Metadados` através da REST do Google Drive.

---

## 🚀 Guia de Instalação e Uso

### 1. Preparação Local

Clone o repositório e instale as dependências:
```bash
git clone https://github.com/AHAugusto/brainiac.git
cd brainiac
pip install -r requirements.txt
```

> **Aviso:** O utilitário `yt-dlp` precisa estar executável. Você pode instalá-lo via pacote master, brew, ou winget se necessário: `python -m pip install -U yt-dlp`.

### 2. Configurando a API do Google Drive (Uma Única Vez)

O BrainIAc cria Google Docs programaticamente. Você precisa prover uma chave `credentials.json` para gerar seu Token pessoal local (que jamais sobe para o Git).
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um projeto e habilite a **Google Drive API**.
3. Crie credenciais do tipo **OAuth 2.0 (Aplicativo Desktop)** e baixe o arquivo json.
4. Renomeie para `credentials.json` e coloque na pasta raiz local do projeto.
5. Ao executar pela 1ª vez, o app abrirá o Chrome pedindo sua autorização. Após aceite, o OAuth cria um arquivo de renovação (`token.json`).

### 3. Executando o Sistema

```bash
python app_brainiac.py
```
Cole a URL (`https://www.youtube.com/@CanalX`) e aperte **Ligar Motor**. A telemetria iniciará.

---

## 📦 Compilando Executável nativo

Use a especificação preparada do PyInstaller para build local do app fechado:
```bash
pyinstaller brainiac.spec --noconfirm
```
O `.exe` portátil aparecerá em `/dist/BrainIAc_Engine.exe`. *(Mantenha o exe próximo do token.json/credentials.json para funcionar o sync nuvem).*

---

## 📁 Estrutura de Arquivos

```
BrainIAc/
├── app_brainiac.py        # Interface principal CustomTkinter
├── motor_brainiac.py      # Core RAG e GDrive API
├── engine_brainiac.py     # Engine Standalone (Extração Offline)
├── brainiac.spec          # Config de compilação
├── logo.png / .ico        # Identidade visual corporativa
├── requirements.txt       # Libs a rodar
└── _backup_local/         # (Ignorado no Git) Backups antigos e assets UI
```

---

## 🧠 Ingestão RAG (IA) do Produto Final

* **Google NotebookLM (Recomendado):** Vá em notebooklm.google.com, puxe a aba Google Drive importando a subpasta gerada `Cerebro_Docs`. Você tem agora o Q&A indexado e alucinação zero de todo o Cérebro do canal.
* **Google AI Studio / Gemini:** Usando a interface do AI Studio, anexe os txts para uso com Gemini 1.5 PRO (2 Milhões contexto massivo gratuito) criando agentes profundos.

---

## 🔒 Privacidade e Segurança
* `.gitignore` garante o isolamento bloqueando envios da `token.json`, base de dados sensíveis e credenciais API à nuvem aberta.
* Permissões limitadas e locais sem espelhamento reverso de IP. 

---
**Brain'IAc — Intelligence Engine** · MIT License
