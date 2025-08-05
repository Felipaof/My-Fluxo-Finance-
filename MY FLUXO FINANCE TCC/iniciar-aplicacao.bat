@echo off
title My Fluxo Finance - Iniciando...
color 0B

echo.
echo =========================================================
echo       🏦 MY FLUXO FINANCE - INICIALIZADOR 🏦
echo =========================================================
echo.
echo 🚀 Preparando para iniciar a aplicacao...
echo 📂 Diretorio: %~dp0
echo.

REM Muda para o diretório do script
cd /d "%~dp0"

REM Verifica se o arquivo PowerShell existe
if not exist "start-server.ps1" (
    echo ❌ ERRO: Arquivo start-server.ps1 nao encontrado!
    echo 📁 Verifique se o arquivo esta na mesma pasta que este .bat
    echo.
    pause
    exit /b 1
)

echo ✅ Arquivo start-server.ps1 encontrado
echo 🔄 Abrindo PowerShell e executando o servidor...
echo.
echo ⚠️  IMPORTANTE: Uma nova janela do PowerShell sera aberta
echo    Nao feche esta janela enquanto usar a aplicacao!
echo.

REM Pausa de 3 segundos para o usuário ler
timeout /t 3 /nobreak >nul

REM Executa o PowerShell com o script, mantendo a janela aberta
powershell.exe -NoExit -ExecutionPolicy Bypass -File "start-server.ps1"

REM Se chegou aqui, o PowerShell foi fechado
echo.
echo 📴 Servidor finalizado.
echo 👋 Obrigado por usar My Fluxo Finance!
echo.
pause
