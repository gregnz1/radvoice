$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$nodePath = "C:\Users\PC\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$pythonPath = "C:\Users\PC\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$apiPort = 8787
$webPort = 5173

function Stop-PortProcess {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($connection in $connections) {
        Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

function Read-DotEnv {
    param([string]$Path)

    $values = @{}
    if (!(Test-Path $Path)) {
        return $values
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (!$line -or $line.StartsWith("#") -or !$line.Contains("=")) {
            return
        }

        $parts = $line.Split("=", 2)
        $values[$parts[0].Trim()] = $parts[1].Trim()
    }

    return $values
}

Stop-PortProcess -Port $apiPort
Stop-PortProcess -Port $webPort

$envPath = Join-Path $repoRoot ".env"
$envValues = Read-DotEnv -Path $envPath
$llmEnabled = if ($envValues.ContainsKey("LLM_ENABLED")) { $envValues["LLM_ENABLED"] } else { $env:LLM_ENABLED }
$hasOpenAIKey = ($envValues.ContainsKey("OPENAI_API_KEY") -and $envValues["OPENAI_API_KEY"]) -or $env:OPENAI_API_KEY
$providerMode = if ($llmEnabled -eq "true" -and $hasOpenAIKey) { "OpenAI enabled" } else { "Local fallback" }
$apiHost = if ($envValues.ContainsKey("API_HOST") -and $envValues["API_HOST"]) { $envValues["API_HOST"] } elseif ($env:API_HOST) { $env:API_HOST } else { "127.0.0.1" }
$corsOrigins = if ($envValues.ContainsKey("CORS_ORIGINS") -and $envValues["CORS_ORIGINS"]) { $envValues["CORS_ORIGINS"] } elseif ($env:CORS_ORIGINS) { $env:CORS_ORIGINS } else { "http://localhost:5173" }
$sessionTtl = if ($envValues.ContainsKey("SESSION_TTL_MS") -and $envValues["SESSION_TTL_MS"]) { $envValues["SESSION_TTL_MS"] } elseif ($env:SESSION_TTL_MS) { $env:SESSION_TTL_MS } else { "3600000" }
$logLevel = if ($envValues.ContainsKey("LOG_LEVEL") -and $envValues["LOG_LEVEL"]) { $envValues["LOG_LEVEL"] } elseif ($env:LOG_LEVEL) { $env:LOG_LEVEL } else { "minimal" }

Start-Process -WindowStyle Hidden -FilePath $nodePath -ArgumentList "$repoRoot\services\api\src\server.js" -WorkingDirectory "$repoRoot\services\api"
Start-Process -WindowStyle Hidden -FilePath $pythonPath -ArgumentList "-m","http.server",$webPort,"--directory","$repoRoot\apps\web" -WorkingDirectory "$repoRoot\apps\web"

Start-Sleep -Seconds 1

Write-Host ""
Write-Host "RadVoice demo started"
Write-Host "Web:     http://localhost:$webPort"
Write-Host "API:     http://localhost:$apiPort ($apiHost)"
Write-Host "Provider mode: $providerMode"
Write-Host "OpenAI enabled flag: $llmEnabled"
Write-Host "CORS origins: $corsOrigins"
Write-Host "Session TTL ms: $sessionTtl"
Write-Host "Log level: $logLevel"
Write-Host ".env path: $envPath"
if ($apiHost -eq "0.0.0.0") {
    Write-Host "WARNING: LAN API exposure is enabled. Use only on a trusted network and stop the server after the demo."
}
Write-Host ""
Write-Host "Run smoke test:"
Write-Host "  & '$nodePath' scripts\smoke-demo.mjs"
