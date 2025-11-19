@echo off
setlocal

set ROOT=%~dp0
set NEXT_GEN=%ROOT%next-gen
set FRONTEND=%NEXT_GEN%\frontend\app
set DESKTOP=%NEXT_GEN%\desktop

echo.
echo === Building Vite frontend =================================================
if exist "%FRONTEND%\package.json" (
  pushd "%FRONTEND%"
  if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
    if errorlevel 1 goto :fail
  )
  echo Running npm run build...
  call npm run build
  if errorlevel 1 (
    popd
    goto :fail
  )
  popd
) else (
  echo Frontend workspace not found at %FRONTEND%
  goto :fail
)

echo.
echo === Building desktop host ===================================================
dotnet build "%DESKTOP%\PhillyRTSToolkit.csproj" -c Release
if errorlevel 1 goto :fail

set EXE=%DESKTOP%\bin\Release\net8.0-windows\PhillyRTSToolkit.exe
if not exist "%EXE%" (
  echo Desktop executable not found at %EXE%
  goto :fail
)

echo.
echo Launching Philly's RTS Toolkit (next-gen)...
start "" "%EXE%"
goto :eof

:fail
echo.
echo Build or launch failed. See messages above for details.
exit /b 1
