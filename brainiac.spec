# -*- mode: python ; coding: utf-8 -*-
import os

block_cipher = None

# Arquivos a embutir no executável
arquivos_adicionais = [
    # Frontend compilado
    ('web_interface/dist', 'web_interface/dist'),
    # Logos
    ('web_interface/public/logo_dark.png',  'web_interface/public'),
    ('web_interface/public/logo_light.png', 'web_interface/public'),
]

# Inclui credentials.json se existir na raiz do projeto
if os.path.exists('credentials.json'):
    arquivos_adicionais.append(('credentials.json', '.'))

a = Analysis(
    ['api_brainiac.py'],
    pathex=[],
    binaries=[],
    datas=arquivos_adicionais,
    hiddenimports=[
        'uvicorn', 'uvicorn.logging', 'uvicorn.loops', 'uvicorn.loops.auto',
        'uvicorn.protocols', 'uvicorn.protocols.http', 'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets', 'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan', 'uvicorn.lifespan.on',
        'fastapi', 'starlette',
        'yt_dlp', 'pandas',
        'google.auth', 'google.auth.transport.requests',
        'google.oauth2.credentials',
        'google_auth_oauthlib.flow',
        'googleapiclient.discovery',
        'googleapiclient.http',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['customtkinter', 'tkinter'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='BrainIAc_Engine',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='web_interface/public/logo_dark.png',
)
