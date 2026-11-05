$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
# Exercise cmd/batch path resolution from a different working directory.
$launcher = Join-Path $repo 'Start-Studio.bat'
$process = Start-Process cmd.exe -ArgumentList "/d /c `"`"$launcher`" --no-open`"" -WorkingDirectory $env:TEMP -PassThru -RedirectStandardOutput "$repo/launcher-output.log" -RedirectStandardError "$repo/launcher-error.log"
try {
  $ready = $false
  for ($i = 0; $i -lt 90; $i++) {
    if ($process.HasExited) { throw 'Launcher exited before HTTP became ready.' }
    try {
      $response = Invoke-WebRequest 'http://localhost:5173/' -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -eq 200 -and $response.Content -match '<div id="root">') { $ready = $true; break }
    } catch { }
    Start-Sleep -Seconds 1
  }
  if (-not $ready) { throw 'Launcher HTTP readiness timed out.' }
  Write-Host 'PASS Windows batch launcher serves Studio on localhost:5173.'
} finally {
  taskkill /PID $process.Id /T /F 2>$null | Out-Null
  Get-Content "$repo/launcher-output.log"
  Get-Content "$repo/launcher-error.log"
}
