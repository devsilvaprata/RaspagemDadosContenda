@echo off
chcp 65001 > nul
echo.
echo ========================================================
echo   Automação: Câmara vs Prefeitura de Contenda
echo ========================================================
echo.

set MES=%1
set ANO=%2

if "%MES%"=="" (
    set /p MES="Digite o número do mês que deseja analisar (ex: 11): "
)

if "%ANO%"=="" (
    set /p ANO="Digite o ano (ex: 2026): "
)

echo.
echo Iniciando raspagem para %MES%/%ANO%...
node contenda_sync.mjs %MES% %ANO%
pause

