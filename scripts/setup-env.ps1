# =============================================================================
# BrainIAc — Setup do ambiente embarcado (roda uma vez antes do build)
# Prepara: Python embeddable + pip + dependências + yt-dlp.exe + node.exe
#
# Uso:  cd brainiac/scripts && .\setup-env.ps1
# =============================================================================

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ROOT       = Split-Path $PSScriptRoot -Parent
$ELECTRON   = Join-Path $ROOT 'electron'
$PYTHON_DIR = Join-Path $ELECTRON 'python_env'
$BIN_DIR    = Join-Path $ELECTRON 'bin'

$PY_VERSION  = '3.11.9'
$PY_URL      = "https://www.python.org/ftp/python/$PY_VERSION/python-$PY_VERSION-embed-amd64.zip"
$YTDLP_URL   = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
$NODE_VER    = '20.14.0'
$NODE_URL    = "https://nodejs.org/dist/v$NODE_VER/win-x64/node.exe"
$GETPIP_URL  = 'https://bootstrap.pypa.io/get-pip.py'

# ─── Helpers ──────────────────────────────────────────────────────────────
function Download($url, $dest) {
    if (Test-Path $dest) { Write-Host "  [ok] $(Split-Path $dest -Leaf) já existe" ; return }
    Write-Host "  [>>] Baixando $(Split-Path $dest -Leaf)..."
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
}

function Unzip($zip, $dest) {
    Write-Host "  [>>] Extraindo para $dest..."
    Expand-Archive -Path $zip -DestinationPath $dest -Force
}

# ─── 1. Python embeddable ──────────────────────────────────────────────────
Write-Host "`n=== 1/4  Python $PY_VERSION embeddable ==="
New-Item -ItemType Directory -Force -Path $PYTHON_DIR | Out-Null
$pyZip = Join-Path $env:TEMP "python-embed.zip"
Download $PY_URL $pyZip
Unzip $pyZip $PYTHON_DIR

# Habilita site-packages editando o ._pth (necessário para pip funcionar)
$pthFile = Get-ChildItem $PYTHON_DIR -Filter 'python3*._pth' | Select-Object -First 1
if ($pthFile) {
    $pth = Get-Content $pthFile.FullName -Raw
    if ($pth -notmatch 'import site') {
        $pth = $pth -replace '#import site', 'import site'
        Set-Content $pthFile.FullName $pth
        Write-Host "  [ok] site-packages habilitado em $($pthFile.Name)"
    }
}

# ─── 2. pip ───────────────────────────────────────────────────────────────
Write-Host "`n=== 2/4  pip ==="
$pyExe   = Join-Path $PYTHON_DIR 'python.exe'
$getPip  = Join-Path $env:TEMP 'get-pip.py'
Download $GETPIP_URL $getPip
& $pyExe $getPip --no-warn-script-location
Write-Host "  [ok] pip instalado"

# ─── 3. Dependências Python ───────────────────────────────────────────────
Write-Host "`n=== 3/4  Dependências ($ROOT\requirements.txt) ==="
$req = Join-Path $ROOT 'requirements.txt'
& $pyExe -m pip install -r $req --no-warn-script-location
Write-Host "  [ok] Dependências instaladas"

# ─── 4. Binários (yt-dlp + node) ──────────────────────────────────────────
Write-Host "`n=== 4/4  Binários ==="
New-Item -ItemType Directory -Force -Path $BIN_DIR | Out-Null
Download $YTDLP_URL  (Join-Path $BIN_DIR 'yt-dlp.exe')
Download $NODE_URL   (Join-Path $BIN_DIR 'node.exe')
Write-Host "  [ok] yt-dlp.exe e node.exe prontos"

# ─── Resumo ────────────────────────────────────────────────────────────────
Write-Host "`n=== Ambiente pronto! ==="
Write-Host "  python_env : $PYTHON_DIR"
Write-Host "  bin        : $BIN_DIR"
Write-Host ""
Write-Host "Próximos passos:"
Write-Host "  1. cd ..\web_interface && npm run build"
Write-Host "  2. cd ..\electron && npm install && npm run build"
