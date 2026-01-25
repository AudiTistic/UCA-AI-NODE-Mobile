$projRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$proj     = Join-Path $projRoot ".src"

bun install --cwd $proj
Start-Process pwsh -ArgumentList '-NoExit', "-Command", "cd `"$proj`"; bun dev"
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
