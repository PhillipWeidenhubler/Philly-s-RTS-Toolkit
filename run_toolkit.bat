@echo off
setlocal

set ROOT=%~dp0
set DESKTOP_DIR=%ROOT%desktop

echo Building desktop host...
for /l %%i in (1,1,3) do (
  taskkill /IM PhillyRTSToolkit.exe /F /T >nul 2>&1
  timeout /t 1 >nul 2>&1
)
dotnet build "%DESKTOP_DIR%\PhillyRTSToolkit.csproj" -c Release
if errorlevel 1 (
  echo Build failed.
  exit /b 1
)

set EXE=%DESKTOP_DIR%\bin\Release\net8.0-windows\PhillyRTSToolkit.exe
if not exist "%EXE%" (
  echo EXE not found at %EXE%
  exit /b 1
)

echo Launching Philly's RTS Toolkit...
start "" "%EXE%"

endlocal
