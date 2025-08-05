Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       🏦 MY FLUXO FINANCE - TCC 2025 🏦" -ForegroundColor Cyan  
Write-Host "    Sistema de Gestão Financeira Pessoal" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Define o diretório do projeto
$currentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $currentDir

# Verifica se o Python está instalado
Write-Host "🔍 Verificando requisitos do sistema..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python") {
        Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
    } else {
        throw "Python não encontrado"
    }
} catch {
    Write-Host "❌ ERRO: Python não está instalado ou não está no PATH" -ForegroundColor Red
    Write-Host "💡 Para instalar Python:" -ForegroundColor Yellow
    Write-Host "   1. Acesse: https://python.org/downloads/" -ForegroundColor White
    Write-Host "   2. Baixe e instale a versão mais recente" -ForegroundColor White
    Write-Host "   3. Marque a opção 'Add Python to PATH' durante a instalação" -ForegroundColor White
    Write-Host ""
    Read-Host "⏸️  Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "🚀 Iniciando My Fluxo Finance..." -ForegroundColor Green
Write-Host "📡 Servidor HTTP local sendo iniciado na porta 8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 URLs de acesso:" -ForegroundColor Cyan
Write-Host "   • Página inicial: http://localhost:8000/html/index.html" -ForegroundColor White
Write-Host "   • Login direto:   http://localhost:8000/html/Login.html" -ForegroundColor White
Write-Host "   • Dashboard:      http://localhost:8000/html/dashboard.html" -ForegroundColor White
Write-Host ""
Write-Host "📱 Funcionalidades disponíveis:" -ForegroundColor Cyan
Write-Host "   • 💰 Controle de receitas e despesas" -ForegroundColor White
Write-Host "   • 🎯 Gerenciamento de metas financeiras" -ForegroundColor White
Write-Host "   • 📊 Relatórios e gráficos detalhados" -ForegroundColor White
Write-Host "   • ⚙️  Configurações personalizáveis" -ForegroundColor White
Write-Host "   • 🔐 Autenticação segura via Firebase" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Red
Write-Host "   • Configure as regras do Firebase antes do primeiro uso" -ForegroundColor Yellow
Write-Host "   • Consulte o arquivo INSTRUCOES-USO.md para mais detalhes" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔄 Para parar o servidor: Pressione Ctrl+C" -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Aguarda alguns segundos antes de abrir o navegador
Start-Sleep -Seconds 2

# Abre a página inicial do projeto no navegador
Write-Host "🌐 Abrindo My Fluxo Finance no navegador..." -ForegroundColor Green
Start-Process "http://localhost:8000/html/index.html"

# Inicia o servidor HTTP Python
Write-Host "🔥 Servidor em execução! Não feche esta janela." -ForegroundColor Green
Write-Host ""
try {
    python -m http.server 8000
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao iniciar o servidor HTTP" -ForegroundColor Red
    Write-Host "💡 Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "   1. Verifique se a porta 8000 não está em uso" -ForegroundColor White
    Write-Host "   2. Execute como administrador" -ForegroundColor White
    Write-Host "   3. Reinstale o Python" -ForegroundColor White
    Write-Host ""
    Read-Host "⏸️  Pressione Enter para sair"
}