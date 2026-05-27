import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Pause, Square, Activity, FileText, Video, Info, ChevronRight,
  Database, Zap, Terminal, Sun, Moon, Brain, Link2, CheckCircle2,
  AlertTriangle, XCircle, Loader2, BarChart3, Menu, X,
  ShieldCheck, ShieldOff, ShieldAlert, CloudOff, KeyRound,
  Trophy, Globe, MicOff, Scissors
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://localhost:8001";
const btnFocus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

// ── Helpers ────────────────────────────────────────────────────────────────

function StatusDot({ isRunning, isPaused }) {
  if (!isRunning) return <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" aria-hidden="true" />;
  if (isPaused)   return <span className="w-2 h-2 rounded-full bg-warning shrink-0" aria-hidden="true" />;
  return              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" aria-hidden="true" />;
}

function logMeta(msg) {
  if (msg.includes('✅') || msg.includes('OK!') || msg.includes('CUMPRIDA') || msg.includes('FINALIZADO') || msg.includes('LOCAL CONCLUÍDA'))
    return { color: 'text-secondary font-medium', label: 'sucesso' };
  if (msg.includes('❌') || msg.includes('Erro') || msg.includes('ERRO'))
    return { color: 'text-danger font-medium', label: 'erro' };
  if (msg.includes('⚠️') || msg.includes('Ignorado') || msg.includes('Inconsist') || msg.includes('PULADO'))
    return { color: 'text-warning', label: 'aviso' };
  if (msg.includes('⏸️') || msg.includes('Pausa'))
    return { color: 'text-warning', label: 'pausa' };
  if (msg.includes('🧠') || msg.includes('ENGINE') || msg.includes('==='))
    return { color: 'text-violet-300 font-semibold', label: 'sistema' };
  if (msg.includes('📡') || msg.includes('mapeado') || msg.includes('Mapeando'))
    return { color: 'text-cyan-300', label: 'mapeamento' };
  if (msg.includes('☁️') || msg.includes('Drive') || msg.includes('⬆️') || msg.includes('🔄'))
    return { color: 'text-violet-300', label: 'drive' };
  if (msg.includes('🛑') || msg.includes('Cancelamento'))
    return { color: 'text-danger font-medium', label: 'cancelado' };
  return { color: 'text-slate-300', label: 'info' };
}

// ── Painel de status do Drive (step 1 da sidebar) ─────────────────────────

function DrivePanel({ driveStatus, driveAuthError, onAuth, onCancel, isRunning, darkMode }) {
  const base = `p-3 rounded-xl border text-xs font-medium`;

  if (driveStatus === 'autenticado') {
    return (
      <div className={`${base} flex items-center gap-2.5 font-bold text-secondary bg-secondary/8 border-secondary/25`}
        role="status" aria-label="Google Drive conectado">
        <ShieldCheck size={15} aria-hidden="true" />
        Google Drive Conectado
      </div>
    );
  }

  if (driveStatus === 'em_progresso') {
    return (
      <div className="space-y-2">
        <div className={`${base} flex items-center gap-2.5 font-bold text-primary bg-primary/8 border-primary/25`}
          role="status" aria-live="polite" aria-label="Aguardando autenticação no navegador">
          <Loader2 size={15} className="animate-spin shrink-0" aria-hidden="true" />
          <span>Aguardando login no navegador...</span>
        </div>
        <button onClick={onCancel}
          className={`w-full py-2 rounded-xl text-xs font-bold border transition-colors ${darkMode ? 'border-white/15 text-slate-300 hover:bg-white/8' : 'border-slate-200 text-slate-600 hover:bg-slate-100'} ${btnFocus}`}>
          Cancelar autenticação
        </button>
      </div>
    );
  }

  if (driveStatus === 'sem_credenciais') {
    return (
      <div className={`${base} space-y-2 text-warning bg-warning/8 border-warning/25`}
        role="status" aria-label="Credenciais do Drive não encontradas">
        <p className="flex items-center gap-1.5 font-bold">
          <ShieldAlert size={14} aria-hidden="true" /> credentials.json ausente
        </p>
        <p className={`text-[11px] leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Sem este arquivo a extração roda em <strong>modo local</strong> — os dados
          não serão sincronizados com o Google Drive.
        </p>
        <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer"
          className={`inline-flex items-center gap-1 text-[11px] underline underline-offset-2 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
          Saiba como obter o arquivo →
        </a>
      </div>
    );
  }

  // nao_autenticado | erro
  return (
    <div className="space-y-2">
      {driveStatus === 'erro' && (
        <div className={`${base} flex items-start gap-2 text-danger bg-danger/8 border-danger/25`} role="alert">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span className="text-[11px] leading-snug">{driveAuthError || "Falha na autenticação. Tente novamente."}</span>
        </div>
      )}

      {driveStatus === 'nao_autenticado' && (
        <div className={`${base} flex items-center gap-2.5 ${darkMode ? 'text-slate-300 bg-white/5 border-white/15' : 'text-slate-600 bg-slate-50 border-slate-200'}`}
          role="status" aria-label="Google Drive não autenticado">
          <ShieldOff size={14} aria-hidden="true" />
          Drive não autenticado
        </div>
      )}

      <button onClick={onAuth} disabled={isRunning}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-colors
          disabled:opacity-40 disabled:cursor-not-allowed
          bg-primary/20 text-primary hover:bg-primary/30 ${btnFocus}`}
        aria-label="Autenticar Google Drive — abre o navegador para login">
        <KeyRound size={13} aria-hidden="true" />
        Autenticar Google Drive
      </button>

      <p className={`text-[10px] text-center ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        Ou inicie sem Drive para salvar só localmente
      </p>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────

function App() {
  const [status, setStatus] = useState({
    is_running: false, is_paused: false, canal_url: "",
    drive_status: "nao_autenticado", drive_auth_error: null,
    stats: { videos_processed: 0, videos_total: 0, videos_sem_legenda: 0, videos_legenda_curta: 0, files_generated: 0, status: "Ocioso", progress: 0, canal_nome: "", idioma_detectado: "" },
    logs: []
  });
  const [darkMode,         setDarkMode]         = useState(true);
  const [showGuide,        setShowGuide]        = useState(false);
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [canalInput,       setCanalInput]       = useState("");
  const [canalConfigurado, setCanalConfigurado] = useState("");
  const [canalError,       setCanalError]       = useState("");
  const [configurando,     setConfigurando]     = useState(false);
  const logContainerRef = useRef(null);
  const errorId = "canal-error";

  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/status`);
        setStatus(prev => JSON.stringify(prev) === JSON.stringify(res.data) ? prev : res.data);
        if (res.data.stats?.canal_nome && !canalConfigurado) setCanalConfigurado(res.data.stats.canal_nome);
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [canalConfigurado]);

  useEffect(() => {
    if (status.is_running && status.logs.length > 0 && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [status.logs.length, status.is_running]);

  const handleConfigurarCanal = async () => {
    if (!canalInput.trim()) { setCanalError("Informe a URL do canal."); return; }
    if (!canalInput.includes("youtube.com") && !canalInput.includes("@")) {
      setCanalError("URL inválida. Use o formato youtube.com/@Canal"); return;
    }
    setConfigurando(true); setCanalError("");
    try {
      const res = await axios.post(`${API_BASE}/set-channel`, { canal_url: canalInput.trim() });
      if (res.data.error) { setCanalError(res.data.message); }
      else { setCanalConfigurado(res.data.canal_nome || canalInput); setCanalInput(""); }
    } catch { setCanalError("Erro ao configurar canal. Servidor offline?"); }
    setConfigurando(false);
  };

  const handleStart      = () => { if (!canalConfigurado) { setCanalError("Configure um canal antes de iniciar."); return; } axios.post(`${API_BASE}/start`).then(r => { if (r.data.error) setCanalError(r.data.message); }); };
  const handlePause      = () => axios.post(`${API_BASE}/pause`);
  const handleCancel     = () => axios.post(`${API_BASE}/cancel`);
  const handleDriveAuth  = () => axios.post(`${API_BASE}/drive-auth`);
  const handleDriveCancel = () => axios.post(`${API_BASE}/drive-auth-cancel`);

  const progress        = status.stats.progress || 0;
  const isRunning       = status.is_running;
  const isPaused        = status.is_paused;
  const totalVideos     = status.stats.videos_total;
  const processedVideos = status.stats.videos_processed;
  const driveStatus     = status.drive_status || "nao_autenticado";

  const statusTextColor = () => {
    const s = status.stats.status;
    if (s.includes("Finalizado"))                        return "text-secondary";
    if (s.includes("Erro") || s.includes("Interrompido")) return "text-danger";
    if (s.includes("Pausa"))                             return "text-warning";
    if (isRunning)                                       return "text-primary";
    return darkMode ? "text-slate-200" : "text-slate-700";
  };

  const StatCard = ({ icon: Icon, label, value, color, sub }) => (
    <div role="status" aria-label={`${label}: ${value}`}
      className={`p-4 lg:p-5 rounded-2xl flex items-center gap-4 border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:border-primary/40' : 'bg-white border-slate-200 shadow-md hover:border-primary/40'}`}>
      <div className={`p-3 rounded-xl shrink-0 bg-${color}/15 text-${color}`} aria-hidden="true"><Icon size={22} /></div>
      <div className="min-w-0">
        <p className={`text-[11px] font-bold uppercase tracking-widest truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        <p className={`text-xl lg:text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</p>
        {sub && <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{sub}</p>}
      </div>
    </div>
  );

  const LogLine = ({ log }) => {
    const { color, label } = logMeta(log.message);
    return (
      <div className="flex gap-3 group hover:bg-white/5 px-1 py-0.5 rounded" role="listitem">
        <span className={`font-mono font-bold shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>[{log.timestamp}]</span>
        <span className={`font-mono text-xs break-all ${color}`}>
          <span className="sr-only">[{label}] </span>{log.message}
        </span>
      </div>
    );
  };

  // ── Conteúdo da Sidebar ────────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex flex-col items-center mb-3">
        <div className="w-full overflow-hidden flex justify-center" style={{ height: '130px' }}>
          <img
            src={darkMode ? "/logo_dark.png" : "/logo_light.png"}
            alt="BrainIAc — Intelligence Engine"
            style={{ width: '220px', height: '220px', objectFit: 'contain', marginTop: '-45px' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
        <div className="flex items-center gap-1.5 mt-1" aria-hidden="true">
          <Brain size={11} className="text-primary" />
          <p className={`text-[9px] font-bold tracking-[0.25em] uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Intelligence Engine</p>
        </div>
      </div>

      <div className={`border-t mb-4 ${darkMode ? 'border-white/10' : 'border-slate-200'}`} role="separator" />

      {/* ── PASSO 1: Google Drive ── */}
      <section aria-labelledby="drive-heading" className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2 px-1">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0
            ${driveStatus === 'autenticado' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}
            aria-hidden="true">1</span>
          <p id="drive-heading" className={`text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Google Drive
          </p>
        </div>
        <DrivePanel
          driveStatus={driveStatus}
          driveAuthError={status.drive_auth_error}
          onAuth={handleDriveAuth}
          onCancel={handleDriveCancel}
          isRunning={isRunning}
          darkMode={darkMode}
        />
      </section>

      <div className={`border-t mb-4 ${darkMode ? 'border-white/10' : 'border-slate-200'}`} role="separator" />

      {/* ── PASSO 2: Canal YouTube ── */}
      <section aria-labelledby="canal-heading" className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2 px-1">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0
            ${canalConfigurado ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}
            aria-hidden="true">2</span>
          <p id="canal-heading" className={`text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Canal YouTube
          </p>
        </div>

        {canalConfigurado ? (
          <div role="status" aria-label={`Canal configurado: @${canalConfigurado}`}
            className={`p-3 rounded-xl flex items-center gap-2 border ${darkMode ? 'bg-primary/10 border-primary/25' : 'bg-primary/5 border-primary/25'}`}>
            <CheckCircle2 size={14} className="text-primary shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Configurado</p>
              <p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>@{canalConfigurado}</p>
            </div>
            {!isRunning && (
              <button onClick={() => { setCanalConfigurado(""); setCanalInput(""); }}
                aria-label="Remover canal configurado"
                className={`ml-auto rounded-md p-0.5 transition-colors hover:text-danger ${darkMode ? 'text-slate-400' : 'text-slate-500'} ${btnFocus}`}>
                <XCircle size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor="canal-url" className="sr-only">URL do canal YouTube</label>
            <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40 transition-all ${darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-slate-300'}`}>
              <Link2 size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
              <input id="canal-url" type="url" placeholder="youtube.com/@Canal" value={canalInput}
                onChange={e => { setCanalInput(e.target.value); setCanalError(""); }}
                onKeyDown={e => e.key === 'Enter' && handleConfigurarCanal()}
                aria-describedby={canalError ? errorId : undefined} aria-invalid={!!canalError}
                className={`flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400 ${darkMode ? 'text-white' : 'text-slate-800'}`} />
            </div>
            {canalError && (
              <p id={errorId} role="alert" className="text-[11px] text-danger flex items-center gap-1 font-medium">
                <AlertTriangle size={11} aria-hidden="true" /> {canalError}
              </p>
            )}
            <button onClick={handleConfigurarCanal} disabled={configurando || !canalInput.trim()}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${btnFocus}`}>
              {configurando ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : <CheckCircle2 size={12} aria-hidden="true" />}
              {configurando ? "Configurando..." : "Confirmar Canal"}
            </button>
          </div>
        )}
      </section>

      <div className={`border-t mb-4 ${darkMode ? 'border-white/10' : 'border-slate-200'}`} role="separator" />

      {/* ── PASSO 3: Operações ── */}
      <section aria-labelledby="ops-heading" className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2 px-1">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0
            ${isRunning && !isPaused ? 'bg-primary/20 text-primary animate-pulse' : 'bg-primary/20 text-primary'}`}
            aria-hidden="true">3</span>
          <p id="ops-heading" className={`text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Operações
          </p>
        </div>
        <div className="space-y-1" role="group" aria-label="Controles do motor">
          <button onClick={handleStart} disabled={isRunning || !canalConfigurado}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${darkMode ? 'text-slate-100 hover:bg-white/8' : 'text-slate-800 hover:bg-slate-100'} ${btnFocus}`}>
            <div className="p-1.5 rounded-lg bg-primary/15" aria-hidden="true"><Zap size={16} className="text-primary" /></div>
            Iniciar Extração
          </button>
          <button onClick={handlePause} disabled={!isRunning} aria-pressed={isPaused}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 ${darkMode ? 'text-slate-100 hover:bg-white/8' : 'text-slate-800 hover:bg-slate-100'} ${btnFocus}`}>
            <div className="p-1.5 rounded-lg bg-warning/15" aria-hidden="true"><Pause size={16} className="text-warning" /></div>
            {isPaused ? "Retomar Motor" : "Pausar Motor"}
          </button>
          <button onClick={handleCancel} disabled={!isRunning}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 ${darkMode ? 'text-slate-100 hover:bg-white/8' : 'text-slate-800 hover:bg-slate-100'} ${btnFocus}`}>
            <div className="p-1.5 rounded-lg bg-danger/15" aria-hidden="true"><Square size={16} className="text-danger" /></div>
            Cancelar
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <div className={`mt-auto pt-4 border-t flex flex-col items-center gap-3 ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <button onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"} aria-pressed={darkMode}
          className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-white/8 text-white hover:bg-white/15' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} ${btnFocus}`}>
          {darkMode ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
        </button>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Versão 2.0 Web</p>
      </div>
    </>
  );

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${darkMode ? 'bg-[#080C18] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      {/* Overlay mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}
      </AnimatePresence>

      {/* Sidebar desktop */}
      <aside aria-label="Painel de controle"
        className={`hidden lg:flex w-72 shrink-0 border-r flex-col px-5 pt-3 pb-5 overflow-y-auto custom-scrollbar ${darkMode ? 'bg-[#0C1122] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
        <SidebarContent />
      </aside>

      {/* Sidebar mobile (drawer) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside aria-label="Painel de controle"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className={`fixed top-0 left-0 h-full w-72 z-30 flex flex-col px-5 pt-3 pb-5 overflow-y-auto custom-scrollbar lg:hidden ${darkMode ? 'bg-[#0C1122] border-r border-white/10' : 'bg-white border-r border-slate-200 shadow-xl'}`}>
            <div className="flex justify-end mb-1">
              <button onClick={() => setSidebarOpen(false)} aria-label="Fechar menu"
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'} ${btnFocus}`}>
                <X size={18} />
              </button>
            </div>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <main id="main-content" aria-label="Área principal" className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] blur-[140px] -z-10 rounded-full pointer-events-none ${darkMode ? 'bg-primary/8' : 'bg-primary/4'}`} aria-hidden="true" />
        <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] blur-[120px] -z-10 rounded-full pointer-events-none ${darkMode ? 'bg-accent/5' : 'bg-accent/3'}`} aria-hidden="true" />

        {/* Header */}
        <header className="px-4 lg:px-8 py-4 lg:py-6 flex justify-between items-center lg:items-end shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} aria-label="Abrir menu de controle"
              className={`lg:hidden p-2 rounded-xl transition-colors ${darkMode ? 'bg-white/8 text-white hover:bg-white/15' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} ${btnFocus}`}>
              <Menu size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <StatusDot isRunning={isRunning} isPaused={isPaused} />
                <span className={`text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status</span>
              </div>
              <h2 aria-live="polite" aria-atomic="true" className={`text-xl lg:text-3xl font-bold leading-tight ${statusTextColor()}`}>
                {status.stats.status}
              </h2>
              {canalConfigurado && (
                <p className={`text-xs lg:text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Canal: <span className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>@{canalConfigurado}</span>
                </p>
              )}
            </div>
          </div>
          <div className="text-right hidden sm:block" aria-hidden="true">
            <p className={`text-[11px] font-bold uppercase tracking-widest mb-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>BrainIAc</p>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Motor Universal</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-6 space-y-4 custom-scrollbar">

          {/* Banner aviso Drive local */}
          <AnimatePresence>
            {(driveStatus === 'sem_credenciais' || driveStatus === 'nao_autenticado') && !isRunning && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                role="note" aria-label="Modo local ativo"
                className={`rounded-2xl px-4 py-3 border flex items-center gap-3 text-xs ${darkMode ? 'bg-warning/8 border-warning/20 text-warning' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                <CloudOff size={16} className="shrink-0" aria-hidden="true" />
                <span>
                  <strong>Modo local:</strong> sem autenticação do Drive, os dados serão salvos apenas na pasta <code className="font-mono">cerebro_txt/</code>.
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Barra de Progresso */}
          <AnimatePresence>
            {(isRunning || progress > 0) && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                role="region" aria-label="Progresso da extração"
                className={`rounded-2xl p-4 lg:p-5 border ${darkMode ? 'bg-white/4 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={15} className="text-primary" aria-hidden="true" />
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Progresso</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {totalVideos > 0 && (
                      <span className={`text-xs font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{processedVideos} / {totalVideos}</span>
                    )}
                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{progress}%</span>
                  </div>
                </div>
                <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}
                  aria-label={`Progresso: ${progress}%`}
                  className={`h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
                </div>
                {isRunning && !isPaused && (
                  <p aria-live="polite" className={`text-[11px] mt-2 flex items-center gap-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Loader2 size={10} className="animate-spin" aria-hidden="true" /> Processando legendas...
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Painel de Resumo Pós-Extração */}
          <AnimatePresence>
            {(status.stats.status === 'Finalizado ✓' || status.stats.status === 'Interrompido') && status.stats.videos_total > 0 && (
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                aria-labelledby="summary-heading"
                className={`rounded-2xl border overflow-hidden ${status.stats.status === 'Finalizado ✓'
                  ? darkMode ? 'bg-secondary/8 border-secondary/25' : 'bg-emerald-50 border-emerald-200'
                  : darkMode ? 'bg-warning/8 border-warning/25' : 'bg-amber-50 border-amber-200'}`}>
                <div className={`px-5 py-3.5 border-b flex items-center gap-2 ${status.stats.status === 'Finalizado ✓'
                  ? darkMode ? 'border-secondary/20' : 'border-emerald-200'
                  : darkMode ? 'border-warning/20' : 'border-amber-200'}`}>
                  {status.stats.status === 'Finalizado ✓'
                    ? <Trophy size={15} className="text-secondary" aria-hidden="true" />
                    : <AlertTriangle size={15} className="text-warning" aria-hidden="true" />}
                  <h3 id="summary-heading" className={`text-xs font-bold uppercase tracking-wider ${status.stats.status === 'Finalizado ✓'
                    ? darkMode ? 'text-secondary' : 'text-emerald-700'
                    : darkMode ? 'text-warning' : 'text-amber-700'}`}>
                    {status.stats.status === 'Finalizado ✓' ? 'Extração Concluída' : 'Extração Interrompida'}
                  </h3>
                  {status.stats.idioma_detectado && (
                    <span className={`ml-auto flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${darkMode ? 'bg-white/10 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'}`}>
                      <Globe size={10} aria-hidden="true" /> {status.stats.idioma_detectado}
                    </span>
                  )}
                </div>
                <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: CheckCircle2, label: "Extraídos",     value: status.stats.videos_processed,    color: "text-secondary", bg: darkMode ? "bg-secondary/10" : "bg-emerald-100" },
                    { icon: MicOff,       label: "Sem legenda",   value: status.stats.videos_sem_legenda,  color: "text-slate-400",  bg: darkMode ? "bg-white/5"       : "bg-slate-100" },
                    { icon: Scissors,     label: "Leg. curta",    value: status.stats.videos_legenda_curta,color: "text-slate-400",  bg: darkMode ? "bg-white/5"       : "bg-slate-100" },
                    { icon: FileText,     label: "Arquivos",      value: status.stats.files_generated,     color: "text-primary",    bg: darkMode ? "bg-primary/10"    : "bg-violet-100" },
                  ].map(({ icon: Icon, label, value, color, bg }) => (
                    <div key={label} className={`rounded-xl p-3 flex flex-col items-center gap-1 ${bg}`} role="status" aria-label={`${label}: ${value}`}>
                      <Icon size={16} className={color} aria-hidden="true" />
                      <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{value}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
                    </div>
                  ))}
                </div>
                {status.stats.videos_total > 0 && (
                  <div className={`px-5 pb-4`}>
                    <div className={`rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-bold ${darkMode ? 'bg-black/20' : 'bg-white border border-slate-200'}`}>
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Cobertura total</span>
                      <span className={status.stats.videos_processed / status.stats.videos_total >= 0.8
                        ? 'text-secondary' : 'text-warning'}>
                        {Math.round(status.stats.videos_processed / status.stats.videos_total * 100)}%
                        <span className={`ml-1 font-normal text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          ({status.stats.videos_processed} de {status.stats.videos_total} vídeos)
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {/* Guia Acordeão */}
          <div className={`rounded-2xl border-l-4 border-l-primary overflow-hidden ${darkMode ? 'bg-white/4 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <button onClick={() => setShowGuide(!showGuide)} aria-expanded={showGuide} aria-controls="guide-content"
              className={`w-full p-4 lg:p-5 flex gap-4 items-center text-left transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'} ${btnFocus}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary/15 text-primary" aria-hidden="true">
                <Info size={18} />
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-sm lg:text-base ${darkMode ? 'text-white' : 'text-slate-800'}`}>Como usar o BrainIAc?</h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Guia passo a passo</p>
              </div>
              <ChevronRight className={`transition-transform duration-300 shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-500'} ${showGuide ? 'rotate-90' : ''}`} size={16} aria-hidden="true" />
            </button>
            <AnimatePresence>
              {showGuide && (
                <motion.div id="guide-content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                  className={`border-t overflow-hidden ${darkMode ? 'border-white/10' : 'border-slate-100'}`}>
                  <div className={`px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {[
                      ["primary",   "Autentique o Google Drive (passo 1) para sincronizar os arquivos na nuvem. Opcional — sem ele os dados ficam só locais."],
                      ["primary",   "Cole a URL de qualquer canal YouTube no passo 2 e clique em Confirmar Canal."],
                      ["secondary", "Clique em Iniciar Extração. O motor mapeia e extrai legendas de vídeos, shorts, lives, podcasts e playlists."],
                      ["secondary", "Ao finalizar, os arquivos são enviados ao Drive e ficam prontos para importar no NotebookLM."],
                    ].map(([c, text], i) => (
                      <div key={i} className="flex gap-3">
                        <div className={`w-5 h-5 rounded-full bg-${c}/20 text-${c} flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5`} aria-hidden="true">{i + 1}</div>
                        <p>{text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
            <StatCard icon={Video}    label="Vídeos Processados" value={processedVideos}                          color="primary"   sub={totalVideos > 0 ? `de ${totalVideos} mapeados` : "aguardando início"} />
            <StatCard icon={FileText} label="Arquivos Gerados"   value={status.stats.files_generated}             color="accent"    sub="partes do cérebro" />
            <StatCard icon={Database} label="Base de Dados"      value={canalConfigurado ? "Ativa" : "Aguardando"} color="secondary" sub={canalConfigurado ? `@${canalConfigurado}` : "sem canal configurado"} />
          </div>

          {/* Log de Atividade */}
          <section aria-labelledby="log-heading"
            className={`rounded-2xl overflow-hidden flex flex-col border ${darkMode ? 'bg-white/4 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`px-4 lg:px-5 py-3.5 border-b flex items-center justify-between shrink-0 ${darkMode ? 'bg-white/4 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-primary" aria-hidden="true" />
                <h3 id="log-heading" className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-700'}`}>Log em Tempo Real</h3>
              </div>
              {isRunning && (
                <div className="flex items-center gap-1.5" aria-label="Transmissão ao vivo">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider" aria-hidden="true">Ao vivo</span>
                </div>
              )}
            </div>
            <div ref={logContainerRef} role="log" aria-label="Log de atividade do motor"
              aria-live="polite" aria-relevant="additions"
              className={`h-72 lg:h-96 overflow-y-auto p-4 lg:p-5 space-y-1 custom-scrollbar text-xs ${darkMode ? 'bg-black/30 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
              {status.logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3">
                  <Activity size={28} className={darkMode ? 'text-slate-500' : 'text-slate-400'} aria-hidden="true" />
                  <p className={`text-xs opacity-60 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {canalConfigurado ? "Motor pronto. Clique em Iniciar Extração." : "Complete os passos ao lado para começar."}
                  </p>
                </div>
              ) : (
                <div role="list" aria-label="Entradas do log">
                  {status.logs.map((log, i) => <LogLine key={i} log={log} />)}
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default App;
