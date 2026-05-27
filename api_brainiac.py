import threading
import sys
import time
import os
import re
import motor_brainiac
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import logging
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_base_path():
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))

BASE_PATH = get_base_path()

frontend_dist = os.path.join(BASE_PATH, "web_interface", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")


# ==========================================
# --- ESTADO GLOBAL ---
# ==========================================

class AppState:
    def __init__(self):
        # Motor
        self.is_running          = False
        self.is_paused           = False
        self.canal_url           = ""
        self.logs                = []
        self.stats               = {
            "videos_processed":    0,
            "videos_total":        0,
            "videos_sem_legenda":  0,
            "videos_legenda_curta":0,
            "files_generated":     0,
            "status":              "Ocioso",
            "progress":            0,
            "canal_nome":          "",
            "idioma_detectado":    ""
        }
        self.evento_pausa        = threading.Event()
        self.evento_pausa.set()
        self.evento_cancelar     = threading.Event()

        # Drive auth
        self.drive_auth_running  = False
        self.drive_auth_error    = None
        self.drive_cancel_event  = threading.Event()

state = AppState()


# ==========================================
# --- REDIRECIONADOR DE LOG ---
# ==========================================

class LogRedirector:
    def write(self, text):
        if not text.strip():
            return
        clean = text.strip()
        noise = ["GET /", "POST /", "HTTP/1.1", "127.0.0.1", "INFO:", "WARNING:", "uvicorn"]
        if any(k in clean for k in noise):
            return

        state.logs.append({"timestamp": time.strftime("%H:%M:%S"), "message": clean})

        if "✅" in text or "OK!" in text:
            state.stats["videos_processed"] += 1
            if state.stats["videos_total"] > 0:
                pct = int(state.stats["videos_processed"] / state.stats["videos_total"] * 100)
                state.stats["progress"] = min(pct, 99)

        if "📂" in text or "NOVO ARQUIVO" in text:
            state.stats["files_generated"] += 1

        if "Sem legenda" in clean:
            state.stats["videos_sem_legenda"] += 1

        if "Legenda muito curta" in clean or "Legenda Curta" in clean:
            state.stats["videos_legenda_curta"] += 1

        m_lang = re.search(r'Idiomas configurados:\s*(.+)', clean)
        if m_lang:
            state.stats["idioma_detectado"] = m_lang.group(1).strip()

        m = re.search(r'(\d+)\s+v[íi]deos?\s+mapeados?', clean, re.IGNORECASE)
        if m:
            state.stats["videos_total"] = int(m.group(1))
            state.stats["status"] = "Extraindo legendas"

        if len(state.logs) > 500:
            state.logs.pop(0)

    def flush(self): pass
    def isatty(self): return False

sys.stdout = LogRedirector()
sys.stderr = sys.stdout


# ==========================================
# --- MOTOR DE EXTRAÇÃO ---
# ==========================================

def run_motor():
    try:
        state.is_running = True
        state.stats["status"] = "Mapeando YouTube"

        motor_brainiac.brainiac_engine(
            canal_url=state.canal_url,
            evento_pausa=state.evento_pausa,
            evento_cancelar=state.evento_cancelar
        )

        if state.evento_cancelar.is_set():
            state.stats["status"] = "Interrompido"
        else:
            state.stats["status"] = "Finalizado ✓"
            state.stats["progress"] = 100
    except Exception as e:
        print(f"❌ ERRO NO MOTOR: {e}")
        state.stats["status"] = "Erro"
    finally:
        state.is_running = False
        state.is_paused  = False


# ==========================================
# --- AUTENTICAÇÃO DO DRIVE ---
# ==========================================

def run_drive_auth():
    try:
        state.drive_cancel_event.clear()
        motor_brainiac.get_drive_service(stop_event=state.drive_cancel_event)

        if state.drive_cancel_event.is_set():
            print("⚠️ Autenticação do Drive cancelada pelo usuário.")
        else:
            state.drive_auth_error = None
            print("✅ Google Drive autenticado com sucesso!")
    except TimeoutError:
        print("⚠️ Autenticação do Drive cancelada.")
    except Exception as e:
        if not state.drive_cancel_event.is_set():
            state.drive_auth_error = str(e)
            print(f"❌ Falha na autenticação do Drive: {e}")
    finally:
        state.drive_auth_running = False


# ==========================================
# --- ENDPOINTS ---
# ==========================================

class ChannelRequest(BaseModel):
    canal_url: str


@app.get("/status")
def get_status():
    # Determina drive_status combinando estado dinâmico (auth em progresso) com estado do arquivo
    if state.drive_auth_running:
        drive_status = "em_progresso"
    elif state.drive_auth_error:
        drive_status = "erro"
    else:
        drive_status = motor_brainiac.get_drive_status()

    return {
        "is_running":       state.is_running,
        "is_paused":        state.is_paused,
        "canal_url":        state.canal_url,
        "drive_status":     drive_status,
        "drive_auth_error": state.drive_auth_error,
        "stats":            state.stats,
        "logs":             state.logs[-50:]
    }


@app.post("/drive-auth")
def start_drive_auth(background_tasks: BackgroundTasks):
    if state.drive_auth_running:
        return {"message": "Autenticação já está em progresso"}
    if state.is_running:
        return {"message": "Não é possível autenticar durante uma extração", "error": True}

    state.drive_auth_running = True
    state.drive_auth_error   = None
    background_tasks.add_task(run_drive_auth)
    return {"message": "Autenticação iniciada. Conclua o login no navegador que foi aberto."}


@app.post("/drive-auth-cancel")
def cancel_drive_auth():
    state.drive_cancel_event.set()
    state.drive_auth_running = False
    return {"message": "Autenticação cancelada"}


@app.post("/set-channel")
def set_channel(req: ChannelRequest):
    if state.is_running:
        return {"message": "Não é possível alterar o canal durante a execução", "error": True}
    url = req.canal_url.strip()
    state.canal_url = url
    match = re.search(r'@([^/?\s]+)', url)
    state.stats["canal_nome"] = match.group(1) if match else url.rstrip('/').split('/')[-1]
    return {"message": "Canal configurado", "canal_nome": state.stats["canal_nome"]}


@app.post("/start")
def start_engine(background_tasks: BackgroundTasks):
    if not state.canal_url:
        return {"message": "Configure a URL do canal antes de iniciar", "error": True}
    if not state.is_running:
        state.logs                             = []
        state.stats["videos_processed"]       = 0
        state.stats["videos_total"]           = 0
        state.stats["videos_sem_legenda"]     = 0
        state.stats["videos_legenda_curta"]   = 0
        state.stats["files_generated"]        = 0
        state.stats["progress"]               = 0
        state.stats["status"]                 = "Iniciando"
        state.stats["idioma_detectado"]       = ""
        state.evento_cancelar.clear()
        state.evento_pausa.set()
        state.is_paused = False
        background_tasks.add_task(run_motor)
        return {"message": "Motor iniciado"}
    return {"message": "Motor já está rodando"}


@app.post("/pause")
def pause_engine():
    if state.is_running:
        if state.evento_pausa.is_set():
            state.evento_pausa.clear()
            state.is_paused          = True
            state.stats["status"]    = "Em Pausa"
            return {"message": "Pausado"}
        else:
            state.evento_pausa.set()
            state.is_paused          = False
            state.stats["status"]    = "Minerando YouTube"
            return {"message": "Retomado"}
    return {"message": "Motor não está rodando"}


@app.post("/cancel")
def cancel_engine():
    if state.is_running:
        state.evento_cancelar.set()
        state.evento_pausa.set()
        state.stats["status"] = "Cancelando..."
        return {"message": "Cancelando"}
    return {"message": "Motor não está rodando"}


# ==========================================
# --- SERVIR FRONTEND ESTÁTICO ---
# ==========================================

@app.get("/{file_path:path}")
async def serve_static(file_path: str):
    if os.path.exists(frontend_dist):
        full_path = os.path.join(frontend_dist, file_path)
        if os.path.isfile(full_path):
            return FileResponse(full_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
    return {"error": "Frontend não compilado. Execute: cd web_interface && npm run build"}


if __name__ == "__main__":
    import uvicorn
    import subprocess
    from threading import Timer

    def open_app_window():
        url = "http://127.0.0.1:8001"
        try:
            edge_path = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
            if os.path.exists(edge_path):
                subprocess.Popen([edge_path, f"--app={url}"])
            else:
                import webbrowser
                webbrowser.open(url)
        except Exception:
            import webbrowser
            webbrowser.open(url)

    Timer(2.0, open_app_window).start()
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="warning")
