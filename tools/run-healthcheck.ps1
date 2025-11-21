param(
    [switch]$SkipDiagnostics
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

function Invoke-Step {
    param(
        [string]$Name,
        [ScriptBlock]$Action
    )

    Write-Host "== $Name ==" -ForegroundColor Cyan
    & $Action
    Write-Host "== Completed $Name ==" -ForegroundColor Green
}

try {
    Invoke-Step "Install frontend dependencies" {
        Push-Location (Join-Path $repoRoot "frontend/app")
        if (-not (Test-Path "node_modules")) {
            npm install | Out-Host
        }
        Pop-Location
    }

    Invoke-Step "Run ESLint" {
        Push-Location (Join-Path $repoRoot "frontend/app")
        npm run lint | Out-Host
        Pop-Location
    }

    Invoke-Step "Run Vitest" {
        Push-Location (Join-Path $repoRoot "frontend/app")
        npm run test | Out-Host
        Pop-Location
    }

    Invoke-Step "Build desktop host with analyzers" {
        Push-Location $repoRoot
        dotnet build "desktop/PhillyRTSToolkit.csproj" -c Release /warnaserror | Out-Host
        Pop-Location
    }

    if (-not $SkipDiagnostics) {
        Invoke-Step "Gather diagnostics snapshot" {
            Push-Location $repoRoot
            dotnet run --project "tools/DiagnosticsCli/DiagnosticsCli.csproj" -- --output (Join-Path $repoRoot "analysis-report.json") | Out-Host
            Pop-Location
        }
    }

    Write-Host "Health check completed." -ForegroundColor Green
}
catch {
    Write-Error "Health check failed: $($_.Exception.Message)"
    exit 1
}
