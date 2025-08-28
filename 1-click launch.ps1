$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$port = 3001
$inUse = (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue)
if ($inUse) { Write-Host "Server on $port (PID $($inUse.OwningProcess)) - skip" }
else { Start-Process cmd -ArgumentList '/k',"pnpm -C packages\server dev" }
Start-Process cmd -ArgumentList '/k',"pnpm -C packages\client dev"
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
