@echo off
setlocal EnableExtensions EnableDelayedExpansion

set ROOT=%~dp0
set FRONTEND=%ROOT%frontend\app
set DESKTOP=%ROOT%desktop
set DESKTOP_OUT=%DESKTOP%\bin\Release\net8.0-windows
set DESKTOP_EXE=%DESKTOP_OUT%\PhillyRTSToolkit.exe
set ROOT_LAUNCHER=%ROOT%launcher\PhillyRTSToolkit.Launcher.csproj
set ROOT_EXE=%ROOT%PhillyRTSToolkit.exe
set LOG_DIR=%ROOT%build_logs
set LOG_FILE=%LOG_DIR%\last-run.log
set DESKTOP_LOG_DIR=%LOCALAPPDATA%\PhillyRTSToolkit\logs

if not exist "%LOG_DIR%" (
  mkdir "%LOG_DIR%" >nul 2>&1
)

echo [%date% %time%] Starting run_next_gen > "%LOG_FILE%"
set CURRENT_STEP=Startup

set FORCE_NPM=0
set SKIP_FRONTEND=0
set SKIP_DESKTOP=0
set SKIP_LAUNCH=0
set RUN_HEALTHCHECK=0
set USE_LAUNCHER=0

if "%~1"=="" goto :afterArgs

:parseArgs
if /I "%~1"=="--help" goto :usage
if /I "%~1"=="-h" goto :usage
if /I "%~1"=="--fresh" set FORCE_NPM=1
if /I "%~1"=="--skip-frontend" set SKIP_FRONTEND=1
if /I "%~1"=="--skip-desktop" set SKIP_DESKTOP=1
if /I "%~1"=="--no-launch" set SKIP_LAUNCH=1
if /I "%~1"=="--healthcheck" set RUN_HEALTHCHECK=1
if /I "%~1"=="--use-launcher" set USE_LAUNCHER=1
shift
if not "%~1"=="" goto :parseArgs

:afterArgs

echo.
echo Philly's RTS Toolkit build launcher
echo ------------------------------------
echo   Root:      %ROOT%
echo   Frontend:  %FRONTEND%
echo   Desktop:   %DESKTOP%
echo   Log file:  %LOG_FILE%
echo   Desktop logs: %DESKTOP_LOG_DIR%
if %FORCE_NPM%==1 echo   Frontend deps will be reinstalled.
if %SKIP_FRONTEND%==1 echo   Frontend build skipped.
if %SKIP_DESKTOP%==1 echo   Desktop build skipped.
if %SKIP_LAUNCH%==1 echo   Launcher will NOT be started.
if %RUN_HEALTHCHECK%==1 echo   Healthcheck will run after builds.
if %USE_LAUNCHER%==1 (
  echo   Launch mode: root launcher (PhillyRTSToolkit.exe)
) else (
  echo   Launch mode: desktop host (%DESKTOP_EXE%)
)
call :logmsg "Run configuration: fresh=%FORCE_NPM% skip_frontend=%SKIP_FRONTEND% skip_desktop=%SKIP_DESKTOP% no_launch=%SKIP_LAUNCH% healthcheck=%RUN_HEALTHCHECK% use_launcher=%USE_LAUNCHER%"

if %SKIP_FRONTEND%==0 (
  if exist "%FRONTEND%\package.json" (
    call :logmsg "Frontend workspace detected"
    set "NEED_INSTALL=0"
    if %FORCE_NPM%==1 set "NEED_INSTALL=1"
    if not exist "%FRONTEND%\node_modules" set "NEED_INSTALL=1"

    if %FORCE_NPM%==1 (
      if exist "%FRONTEND%\node_modules" (
        call :logmsg "Removing existing node_modules for clean install"
        rmdir /s /q "%FRONTEND%\node_modules"
        if errorlevel 1 (
          set LAST_ERROR_STEP=Frontend cleanup
          set LAST_ERROR_CODE=%ERRORLEVEL%
          goto :fail
        )
      )
    )

    if !NEED_INSTALL! EQU 1 (
      call :run_cmd "Frontend npm install" "%FRONTEND%" "npm install --no-fund --no-audit"
    ) else (
      call :logmsg "Frontend dependencies already installed"
    )

    call :run_cmd "Frontend build" "%FRONTEND%" "npm run build"
  ) else (
    call :logmsg "Frontend workspace not found at %FRONTEND%"
    set LAST_ERROR_STEP=Frontend workspace missing
    set LAST_ERROR_CODE=1
    goto :fail
  )
) else (
  call :logmsg "Skipping frontend build."
)

if %SKIP_DESKTOP%==0 (
  call :stop_running_toolkit
  call :run_cmd "Desktop build" "%DESKTOP%" "dotnet build PhillyRTSToolkit.csproj -c Release"
  call :verify_path "Desktop artifact" "%DESKTOP_EXE%"
  call :run_cmd "Launcher build" "%ROOT%launcher" "dotnet build PhillyRTSToolkit.Launcher.csproj -c Release"
  call :verify_path "Launcher artifact" "%ROOT_EXE%"
  call :sync_file "Copy launcher runtimeconfig" "%DESKTOP_OUT%\PhillyRTSToolkit.runtimeconfig.json" "%ROOT%PhillyRTSToolkit.runtimeconfig.json"
  call :sync_file "Copy launcher deps" "%DESKTOP_OUT%\PhillyRTSToolkit.deps.json" "%ROOT%PhillyRTSToolkit.deps.json"
  call :sync_dir "Copy WebView2 assets" "%DESKTOP_OUT%\PhillyRTSToolkit.exe.WebView2" "%ROOT%PhillyRTSToolkit.exe.WebView2"
  call :sync_dir "Copy runtimes" "%DESKTOP_OUT%\runtimes" "%ROOT%runtimes"
  call :sync_dir "Copy data" "%DESKTOP_OUT%\data" "%ROOT%data"
) else (
  call :logmsg "Skipping desktop build."
)

if %RUN_HEALTHCHECK%==1 (
  call :run_cmd "Repository healthcheck" "%ROOT%" "powershell -NoProfile -ExecutionPolicy Bypass -File tools\run-healthcheck.ps1 -SkipDiagnostics:$false"
)

if %SKIP_LAUNCH%==0 (
  if %USE_LAUNCHER%==1 (
    if exist "%ROOT_EXE%" (
      call :logmsg "Launching Philly's RTS Toolkit (root launcher)"
      start "Toolkit Launcher" "%ROOT_EXE%"
      call :launch_desktop_log_console
    ) else (
      call :logmsg "Launcher path unavailable; skipping start"
    )
  ) else (
    if exist "%DESKTOP_EXE%" (
      call :logmsg "Launching Philly's RTS Toolkit desktop host"
      start "Toolkit Desktop" "%DESKTOP_EXE%"
      call :launch_desktop_log_console
    ) else (
      call :logmsg "Desktop executable missing; cannot launch"
    )
  )
) else (
    call :logmsg "Launch step skipped (--no-launch)"
  )

call :launch_log_console
goto :eof

:stop_running_toolkit
call :logmsg "Ensuring no running Toolkit processes before build"
powershell -NoProfile -Command "Get-Process -Name 'PhillyRTSToolkit','PhillyRTSToolkit.Launcher' -ErrorAction SilentlyContinue | ForEach-Object { Write-Host ('Stopping ' + $_.ProcessName + ' (PID ' + $_.Id + ')'); Stop-Process -Id $_.Id -Force }" >nul 2>&1
goto :eof

:usage
echo Usage: run_next_gen.bat [options]
echo.
echo   --fresh           Force npm reinstall for the frontend before building.
echo   --skip-frontend   Do not build the Vite frontend bundle.
echo   --skip-desktop    Do not build the desktop host or launcher.
echo   --no-launch       Build artifacts but do not auto-start the launcher.
echo   --healthcheck     Run tools\run-healthcheck.ps1 after successful builds.
echo   --use-launcher    Launch the packaged root PhillyRTSToolkit.exe instead of the desktop host.
echo   -h, --help        Show this help text.
exit /b 0

:fail
echo.
if defined LAST_ERROR_STEP echo Last step: %LAST_ERROR_STEP%
if defined LAST_ERROR_CODE echo Exit code: %LAST_ERROR_CODE%
echo Detailed log: %LOG_FILE%
call :launch_log_console
exit /b 1

:logmsg
echo %~1
echo [%date% %time%] %~1>>"%LOG_FILE%"
goto :eof

:run_cmd
set CURRENT_STEP=%~1
set WORKDIR=%~2
set COMMAND=%~3
call :logmsg "[%CURRENT_STEP%] Starting"
if not "%WORKDIR%"=="" pushd "%WORKDIR%"
cmd /d /c "%COMMAND%"
set ERR=%ERRORLEVEL%
if not "%WORKDIR%"=="" popd
if not %ERR%==0 (
  set LAST_ERROR_STEP=%CURRENT_STEP%
  set LAST_ERROR_CODE=%ERR%
  call :logmsg "[%CURRENT_STEP%] FAILED (exit %ERR%)"
  goto :fail
)
call :logmsg "[%CURRENT_STEP%] Completed"
goto :eof

:verify_path
set CURRENT_STEP=%~1
set TARGET=%~2
if not exist "%TARGET%" (
  set LAST_ERROR_STEP=%CURRENT_STEP%
  set LAST_ERROR_CODE=1
  call :logmsg "[%CURRENT_STEP%] Missing expected path: %TARGET%"
  goto :fail
)
call :logmsg "[%CURRENT_STEP%] Verified %TARGET%"
goto :eof

:sync_file
set CURRENT_STEP=%~1
set SOURCE=%~2
set DEST=%~3
if not exist "%SOURCE%" (
  set LAST_ERROR_STEP=%CURRENT_STEP%
  set LAST_ERROR_CODE=1
  call :logmsg "[%CURRENT_STEP%] Source missing: %SOURCE%"
  goto :fail
)
call :logmsg "[%CURRENT_STEP%] Copying %SOURCE% -> %DEST%"
copy /y "%SOURCE%" "%DEST%" >nul
if errorlevel 1 (
  set LAST_ERROR_STEP=%CURRENT_STEP%
  set LAST_ERROR_CODE=%ERRORLEVEL%
  call :logmsg "[%CURRENT_STEP%] FAILED to copy file"
  goto :fail
)
goto :eof

:sync_dir
set CURRENT_STEP=%~1
set SOURCE=%~2
set DEST=%~3
if not exist "%SOURCE%" (
  set LAST_ERROR_STEP=%CURRENT_STEP%
  set LAST_ERROR_CODE=1
  call :logmsg "[%CURRENT_STEP%] Source directory missing: %SOURCE%"
  goto :fail
)
call :logmsg "[%CURRENT_STEP%] Mirroring %SOURCE% -> %DEST%"
robocopy "%SOURCE%" "%DEST%" /MIR >nul
set ERR=%ERRORLEVEL%
if %ERR% GEQ 8 (
  set LAST_ERROR_STEP=%CURRENT_STEP%
  set LAST_ERROR_CODE=%ERR%
  call :logmsg "[%CURRENT_STEP%] FAILED to mirror directory (code %ERR%)"
  goto :fail
)
goto :eof

:launch_log_console
if exist "%LOG_FILE%" (
  start "Toolkit Build Log" powershell -NoProfile -NoExit -Command "Write-Host 'Toolkit build log (' + (Get-Date).ToString('u') + ')' -ForegroundColor Cyan; if (Test-Path \"%LOG_FILE%\") { Get-Content -Path \"%LOG_FILE%\" -Tail 200 -Wait } else { Write-Host 'No log file present.' }"
)
goto :eof

:launch_desktop_log_console
if not exist "%DESKTOP_LOG_DIR%" (
  goto :eof
)
for /f "delims=" %%L in ('powershell -NoProfile -Command "Get-ChildItem -Path \"%DESKTOP_LOG_DIR%\" -Filter 'desktop-*.log' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | ForEach-Object { $_.FullName }"') do set "LATEST_DESKTOP_LOG=%%L"
if not defined LATEST_DESKTOP_LOG goto :eof
start "Toolkit Desktop Log" powershell -NoProfile -NoExit -Command "Write-Host \"Desktop host log: %LATEST_DESKTOP_LOG%\" -ForegroundColor Yellow; Get-Content -Path \"%LATEST_DESKTOP_LOG%\" -Tail 200 -Wait"
set LATEST_DESKTOP_LOG=
goto :eof
