# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

# Mapeando o nosso único logo para dentro do .exe
arquivos_adicionais = [
    ('logo.png', '.'), 
]

a = Analysis(
    ['app_brainiac.py'],
    pathex=[],
    binaries=[],
    datas=arquivos_adicionais,
    hiddenimports=['customtkinter', 'yt_dlp', 'pandas', 'requests', 'PIL'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
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
    name='BrainIAC_Engine',
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
    icon='logo.png' 
)