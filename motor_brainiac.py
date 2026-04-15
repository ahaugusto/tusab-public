import os
import time
import subprocess
import re
import io
import threading
import pandas as pd
from datetime import datetime

# Google Drive
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseUpload

# ==========================================
# --- CONFIGURAÇÕES GLOBAIS ---
# ==========================================
SCOPES = ['https://www.googleapis.com/auth/drive']
LOCAL_TXT_DIR = 'cerebro_txt'
GESTAO_FOLDER = 'gestao_local'
MAX_WORDS_PER_FILE = 40000


# ==========================================
# --- UTILITÁRIOS ---
# ==========================================

def sanitizar_nome(nome):
    if not nome:
        return "Canal"
    return re.sub(r'[<>:"/\\|?*\s]', '_', str(nome)).strip('_')


def extrair_nome_canal(url):
    """Extrai o nome do canal a partir da URL do YouTube."""
    match = re.search(r'@([^/]+)', url)
    if match:
        return match.group(1)
    parts = url.rstrip('/').split('/')
    return parts[-1].lstrip('@') if parts else "Canal"


def formatar_data(data_str):
    if not data_str or data_str == 'NA':
        return ""
    try:
        return datetime.strptime(str(data_str), '%Y%m%d').strftime('%d/%m/%Y')
    except Exception:
        return data_str


def limpar_vtt(caminho_vtt):
    if not os.path.exists(caminho_vtt):
        return ""
    with open(caminho_vtt, 'r', encoding='utf-8', errors='replace') as f:
        linhas = f.readlines()
    texto_limpo = []
    for linha in linhas:
        if '-->' not in linha and not linha.strip().isdigit() and 'WEBVTT' not in linha:
            linha = re.sub(r'<[^>]*>', '', linha)
            if linha.strip():
                texto_limpo.append(linha.strip())
    resultado = []
    if texto_limpo:
        resultado.append(texto_limpo[0])
        for i in range(1, len(texto_limpo)):
            if texto_limpo[i] != texto_limpo[i - 1]:
                resultado.append(texto_limpo[i])
    return " ".join(resultado).strip()


def executar_comando(cmd):
    creationflags = getattr(subprocess, 'CREATE_NO_WINDOW', 0)
    result = subprocess.run(
        cmd, capture_output=True, text=False,
        check=False, creationflags=creationflags
    )
    return result.stdout.decode('utf-8', errors='replace')


def gerar_fontes(canal_url):
    """Gera as seções a varrer com base na URL base do canal."""
    base = canal_url.rstrip('/')
    return [
        {"aba": "Videos",    "url": f"{base}/videos",    "is_playlist": False},
        {"aba": "Shorts",    "url": f"{base}/shorts",    "is_playlist": False},
        {"aba": "Ao_Vivo",   "url": f"{base}/streams",   "is_playlist": False},
        {"aba": "Podcasts",  "url": f"{base}/podcasts",  "is_playlist": False},
        {"aba": "Cursos",    "url": f"{base}/courses",   "is_playlist": False},
        {"aba": "Playlists", "url": f"{base}/playlists", "is_playlist": True},
    ]


# ==========================================
# --- GOOGLE DRIVE ---
# ==========================================

def get_drive_service():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return build('drive', 'v3', credentials=creds)


def garantir_pasta_drive(service, nome, parent_id=None):
    if parent_id:
        query = (f"name = '{nome}' and '{parent_id}' in parents "
                 f"and mimeType = 'application/vnd.google-apps.folder' and trashed = false")
    else:
        query = (f"name = '{nome}' and 'root' in parents "
                 f"and mimeType = 'application/vnd.google-apps.folder' and trashed = false")

    res = service.files().list(q=query).execute().get('files', [])
    if res:
        return res[0]['id']

    meta = {'name': nome, 'mimeType': 'application/vnd.google-apps.folder'}
    if parent_id:
        meta['parents'] = [parent_id]
    return service.files().create(body=meta, fields='id').execute().get('id')


def _enviar_texto_gdoc(service, nome_arquivo, texto, drive_folder_id):
    file_metadata = {
        'name': nome_arquivo,
        'parents': [drive_folder_id],
        'mimeType': 'application/vnd.google-apps.document'
    }
    fh = io.BytesIO(texto.encode('utf-8'))
    media = MediaIoBaseUpload(fh, mimetype='text/plain', resumable=True)
    q = f"name = '{nome_arquivo}' and '{drive_folder_id}' in parents and trashed = false"
    res = service.files().list(q=q).execute().get('files', [])
    try:
        if res:
            service.files().update(fileId=res[0]['id'], media_body=media).execute()
            print(f"      🔄 Atualizado no Drive: {nome_arquivo}")
        else:
            service.files().create(body=file_metadata, media_body=media).execute()
            print(f"      ⬆️ Sincronizado: {nome_arquivo}")
    except Exception as e:
        print(f"      ❌ Erro ao subir {nome_arquivo}: {e}")


def upload_txt_como_gdoc_seguro(service, filepath, drive_folder_id):
    filename = os.path.basename(filepath)
    name_without_ext = os.path.splitext(filename)[0]
    tamanho_mb = os.path.getsize(filepath) / (1024 * 1024)

    with open(filepath, 'r', encoding='utf-8-sig', errors='ignore') as f:
        conteudo = f.read()

    if tamanho_mb > 0.4:
        print(f"      ⚠️ Arquivo grande ({tamanho_mb:.2f}MB). Fatiando {name_without_ext}...")
        blocos = conteudo.split('=' * 70)
        texto_temp = ""
        letra_parte = 65
        for bloco in blocos:
            if not bloco.strip():
                continue
            texto_temp += bloco + "\n" + "=" * 70 + "\n"
            if len(texto_temp) > 300000:
                sub_nome = f"{name_without_ext}_{chr(letra_parte)}"
                _enviar_texto_gdoc(service, sub_nome, texto_temp, drive_folder_id)
                letra_parte += 1
                texto_temp = ""
        if texto_temp.strip():
            sub_nome = f"{name_without_ext}_{chr(letra_parte)}"
            _enviar_texto_gdoc(service, sub_nome, texto_temp, drive_folder_id)
    else:
        _enviar_texto_gdoc(service, name_without_ext, conteudo, drive_folder_id)


def upload_arquivo_drive(service, filepath, drive_folder_id):
    filename = os.path.basename(filepath)
    media = MediaFileUpload(filepath, resumable=True)
    q = f"name = '{filename}' and '{drive_folder_id}' in parents and trashed = false"
    res = service.files().list(q=q).execute().get('files', [])
    if res:
        service.files().update(fileId=res[0]['id'], media_body=media).execute()
        print(f"      🔄 Atualizado no Drive: {filename}")
    else:
        service.files().create(
            body={'name': filename, 'parents': [drive_folder_id]},
            media_body=media
        ).execute()
        print(f"      ⬆️ Sincronizado: {filename}")


# ==========================================
# --- RELATÓRIO DE AUDITORIA ---
# ==========================================

def gerar_relatorio_checkup(canal_nome_safe, db_file):
    print("\n📊 [GERANDO RELATÓRIO DE AUDITORIA]...")
    caminho_relatorio = os.path.join(GESTAO_FOLDER, f'{canal_nome_safe}_relatorio.txt')

    if not os.path.exists(db_file):
        print("❌ CSV não encontrado. Impossível gerar relatório.")
        return caminho_relatorio

    df = pd.read_csv(db_file, encoding='utf-8-sig')
    col_cat = 'Aba' if 'Aba' in df.columns else None
    if not col_cat:
        print("❌ Coluna de categoria não encontrada no CSV.")
        return caminho_relatorio

    total = len(df)
    sucessos = len(df[df['Status'] == 'Sucesso'])
    falhas = total - sucessos

    stats = df.groupby(col_cat).agg(
        Total=('ID', 'count'),
        Sucesso=('Status', lambda x: (x == 'Sucesso').sum())
    )
    stats['Cobertura %'] = (stats['Sucesso'] / stats['Total'] * 100).round(1)

    with open(caminho_relatorio, 'w', encoding='utf-8') as f:
        f.write("-" * 50 + "\n")
        f.write("📊 RELATÓRIO DE COBERTURA — BrainIAc\n")
        f.write(f"Canal: {canal_nome_safe}\n")
        f.write("-" * 50 + "\n")
        f.write(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
        f.write(f"Total mapeado:   {total}\n")
        f.write(f"Extrações OK:    {sucessos} ({(sucessos / total) * 100:.1f}%)\n")
        f.write(f"Falhas/Sem sub:  {falhas}\n")
        f.write("-" * 50 + "\n")
        f.write("DETALHAMENTO POR SEÇÃO:\n")
        f.write(stats.to_string() + "\n")
        f.write("-" * 50 + "\n")
        f.write("Gerado por BrainIAc Intelligence Engine — CriAugu\n")

    print(f"      ✅ Relatório gerado: {caminho_relatorio}")
    return caminho_relatorio


# ==========================================
# --- ENGINE PRINCIPAL ---
# ==========================================

def brainiac_engine(canal_url, evento_pausa=None, evento_cancelar=None):
    """
    Motor principal do BrainIAc.

    Args:
        canal_url:        URL base do canal YouTube (ex: https://www.youtube.com/@NomeCanal)
        evento_pausa:     threading.Event para controle de pausa
        evento_cancelar:  threading.Event para cancelamento seguro
    """
    canal_nome_raw = extrair_nome_canal(canal_url)
    canal_nome_safe = sanitizar_nome(canal_nome_raw)
    prefixo = canal_nome_safe
    drive_folder_name = f"BrainIAc — {canal_nome_raw}"
    db_file = os.path.join(GESTAO_FOLDER, f'{prefixo}_base.csv')

    print("\n" + "=" * 70)
    print("🧠 BRAINIAC ENGINE — Intelligence Engine")
    print(f"   Canal: {canal_url}")
    print(f"   Prefixo de arquivos: {prefixo}")
    print("=" * 70 + "\n")

    for d in [LOCAL_TXT_DIR, GESTAO_FOLDER]:
        if not os.path.exists(d):
            os.makedirs(d)

    FONTES = gerar_fontes(canal_url)

    # --- 1. MAPEAMENTO ---
    all_videos = []
    ids_mapeados = set()

    print("📡 Mapeando conteúdo do canal no YouTube...\n")
    for fonte in FONTES:
        url = fonte['url']
        if fonte['is_playlist']:
            cmd_p = ['yt-dlp', '--flat-playlist', '--get-id', '--get-title', '--ignore-errors', url]
            stdout_p = executar_comando(cmd_p)
            p_lines = [l.strip() for l in stdout_p.split('\n') if l.strip()]
            for i in range(0, len(p_lines), 2):
                if i + 1 < len(p_lines):
                    cmd_v = [
                        'yt-dlp', '--flat-playlist', '--ignore-errors',
                        '--print', '%(id)s|||%(upload_date)s|||%(view_count)s|||%(title)s',
                        f"https://www.youtube.com/playlist?list={p_lines[i + 1]}"
                    ]
                    stdout_v = executar_comando(cmd_v)
                    for line in stdout_v.split('\n'):
                        parts = line.split('|||')
                        if len(parts) >= 4 and parts[0] not in ids_mapeados:
                            all_videos.append({
                                'id': parts[0], 'date': formatar_data(parts[1]),
                                'views': parts[2], 'title': parts[3],
                                'aba': f"Playlist: {p_lines[i]}"
                            })
                            ids_mapeados.add(parts[0])
        else:
            cmd = [
                'yt-dlp', '--flat-playlist', '--ignore-errors',
                '--print', '%(id)s|||%(upload_date)s|||%(view_count)s|||%(title)s', url
            ]
            stdout = executar_comando(cmd)
            for line in stdout.split('\n'):
                parts = line.split('|||')
                if len(parts) >= 4 and parts[0] not in ids_mapeados:
                    all_videos.append({
                        'id': parts[0], 'date': formatar_data(parts[1]),
                        'views': parts[2], 'title': parts[3],
                        'aba': fonte['aba']
                    })
                    ids_mapeados.add(parts[0])

    df_full = pd.DataFrame(all_videos)
    total_liquido = len(df_full)
    print(f"✅ {total_liquido} vídeos mapeados no canal.\n")

    # --- 2. BANCO DE DADOS LOCAL ---
    if os.path.exists(db_file):
        df_db = pd.read_csv(db_file, dtype=str)
        if 'Local' not in df_db.columns:
            df_db['Local'] = 'Desconhecido'
        if 'Playlist' in df_db.columns:
            df_db['Aba'] = df_db['Aba'].fillna("Playlist: " + df_db['Playlist'].astype(str))
            df_db = df_db.drop(columns=['Playlist'])
            df_db.to_csv(db_file, index=False, encoding='utf-8-sig')
        ids_ja_minerados = set(df_db['ID'].values)
    else:
        df_db = pd.DataFrame(columns=['ID', 'Data_Pub', 'Link', 'Titulo', 'Aba', 'Views', 'Local', 'Status'])
        ids_ja_minerados = set()

    # Retomar de onde parou
    parte_atual = 1
    palavras_atuais = 0
    arquivos_txt = [
        f for f in os.listdir(LOCAL_TXT_DIR)
        if f.startswith(f"{prefixo}_Parte_") and f.endswith(".txt")
    ]
    if arquivos_txt:
        numeros = [
            int(re.search(r'Parte_(\d+)', f).group(1))
            for f in arquivos_txt if re.search(r'Parte_(\d+)', f)
        ]
        if numeros:
            parte_atual = max(numeros)
            caminho_retomada = os.path.join(LOCAL_TXT_DIR, f"{prefixo}_Parte_{parte_atual}.txt")
            with open(caminho_retomada, 'r', encoding='utf-8-sig', errors='ignore') as f:
                palavras_atuais = len(f.read().split())

    nome_arquivo_base = f"{prefixo}_Parte_{parte_atual}"
    caminho_txt = os.path.join(LOCAL_TXT_DIR, f"{nome_arquivo_base}.txt")

    print("\n🚜 Iniciando extração de legendas...\n")

    # --- 3. EXTRAÇÃO LOCAL ---
    for idx, video in df_full.iterrows():
        # Controle de cancelamento
        if evento_cancelar and evento_cancelar.is_set():
            print("\n🛑 Cancelamento recebido. Encerrando extração com segurança...")
            break

        # Controle de pausa
        if evento_pausa and not evento_pausa.is_set():
            print("\n⏸️ Motor em pausa. Aguardando retomada...")
            evento_pausa.wait()
            if evento_cancelar and evento_cancelar.is_set():
                print("\n🛑 Cancelamento recebido durante a pausa. Abortando...")
                break
            print("\n▶️ Motor retomado!")

        v_id = video['id']
        v_title = video['title']
        v_link = f"https://www.youtube.com/watch?v={v_id}"

        if v_title in ['[Private video]', '[Deleted video]']:
            continue
        if v_id in ids_ja_minerados:
            continue

        print(f"[{idx + 1}/{total_liquido}] 🎬 Extraindo: {v_title[:50]}...")
        try:
            temp_out = f"temp_{v_id}"
            creationflags = getattr(subprocess, 'CREATE_NO_WINDOW', 0)
            subprocess.run(
                ['yt-dlp', '--skip-download', '--write-auto-sub',
                 '--sub-lang', 'pt', '--output', temp_out, v_link],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                creationflags=creationflags
            )

            vtt_files = [f for f in os.listdir('.') if f.startswith(temp_out) and f.endswith('.vtt')]
            if vtt_files:
                texto = limpar_vtt(vtt_files[0])
                if len(texto) > 150:
                    num_palavras = len(texto.split())

                    if palavras_atuais + num_palavras > MAX_WORDS_PER_FILE:
                        parte_atual += 1
                        palavras_atuais = 0
                        nome_arquivo_base = f"{prefixo}_Parte_{parte_atual}"
                        caminho_txt = os.path.join(LOCAL_TXT_DIR, f"{nome_arquivo_base}.txt")
                        print(f"      📂 NOVO ARQUIVO: Parte {parte_atual} iniciada.")

                    with open(caminho_txt, "a", encoding="utf-8-sig") as f:
                        f.write(
                            f"\n{'=' * 70}\n"
                            f"TITULO: {v_title}\n"
                            f"ABA: {video['aba']}\n"
                            f"DATA: {video['date']}\n"
                            f"LINK: {v_link}\n"
                            f"{'-' * 70}\n"
                            f"CONTEUDO:\n{texto}\n"
                            f"{'=' * 70}\n"
                        )

                    palavras_atuais += num_palavras
                    ids_ja_minerados.add(v_id)

                    nova_linha = {
                        'ID': v_id,
                        'Data_Pub': video['date'],
                        'Link': v_link,
                        'Titulo': v_title,
                        'Aba': video['aba'],
                        'Views': video['views'],
                        'Local': nome_arquivo_base,
                        'Status': 'Sucesso',
                        'Data_Extracao': datetime.now().strftime("%Y-%m-%d")
                    }
                    df_db = pd.concat([df_db, pd.DataFrame([nova_linha])], ignore_index=True)
                    df_db.to_csv(db_file, index=False, encoding='utf-8-sig')
                    print(f"      ✅ OK!")

                for f in vtt_files:
                    os.remove(f)

            time.sleep(1)

        except Exception as e:
            print(f"      ❌ Erro: {e}")

    # --- 4. UPLOAD PARA O DRIVE ---
    try:
        print("\n🔐 [CONECTANDO AO GOOGLE DRIVE PARA UPLOAD]...")
        service = get_drive_service()
        root_id = garantir_pasta_drive(service, drive_folder_name)
        id_docs = garantir_pasta_drive(service, "Cerebro_Docs", root_id)
        id_meta = garantir_pasta_drive(service, "Gestao_Metadados", root_id)
        print("      ✅ Conexão estabelecida e pastas verificadas!\n")

        print("\n☁️ [ENVIANDO DOCUMENTOS PARA O GOOGLE DRIVE]...")
        for f in os.listdir(LOCAL_TXT_DIR):
            if f.endswith(".txt") and f.startswith(prefixo):
                upload_txt_como_gdoc_seguro(service, os.path.join(LOCAL_TXT_DIR, f), id_docs)

        print("\n📊 Sincronizando metadados e relatório...")
        upload_arquivo_drive(service, db_file, id_meta)

        caminho_rel = gerar_relatorio_checkup(canal_nome_safe, db_file)
        if os.path.exists(caminho_rel):
            upload_arquivo_drive(service, caminho_rel, id_meta)

        if evento_cancelar and evento_cancelar.is_set():
            print("\n⚠️ PROCESSO INTERROMPIDO — Dados parciais salvos no Drive.")
        else:
            print("\n🏆 MISSÃO CUMPRIDA! Base de conhecimento atualizada no Drive.")
            print("\n🚀 PROCESSO BrainIAc FINALIZADO COM SUCESSO!")

    except Exception as e:
        print(f"❌ Erro crítico no ambiente de nuvem: {e}")


if __name__ == "__main__":
    canal = input("URL do canal YouTube (ex: https://www.youtube.com/@Canal): ").strip()
    brainiac_engine(canal)
