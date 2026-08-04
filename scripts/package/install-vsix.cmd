@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%..\.."

set "VSIX_FILE=%~1"
if "%VSIX_FILE%"=="" (
    for %%F in (*.vsix) do (
        set "VSIX_FILE=%%~fF"
        goto :found_vsix
    )
    echo Error: No .vsix file found in project root.
    echo Usage: %~nx0 [^<vsix-file^>]
    exit /b 1
)

:found_vsix
if not exist "%VSIX_FILE%" (
    echo Error: File not found: %VSIX_FILE%
    exit /b 1
)

echo === Installing extension: %VSIX_FILE% ===
call code --install-extension "%VSIX_FILE%" --force

echo === Done ===
