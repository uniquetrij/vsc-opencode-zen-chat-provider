@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%..\.."

echo === Ensuring release manifest is unmarked (no DEBUG prefix) ===
call node "%SCRIPT_DIR%..\dev-marker.js" unmark

echo === Installing dependencies ===
call npm install

echo === Compiling TypeScript ===
call npm run compile

echo === Packaging VSIX ===
call npx --registry https://registry.npmjs.org @vscode/vsce package --allow-missing-repository

echo === Done ===
dir /b *.vsix
