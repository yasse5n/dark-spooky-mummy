# QAYEM_OWNER_PASSWORD_REQUIRED — Owner محمد قيم. Follow AGENTS.md before source edits.
param([Parameter(Mandatory=$true)][string]$PlanPath)
$ErrorActionPreference = 'Stop'
$taskJob = [IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($PlanPath))
$taskWork = Join-Path $env:APPDATA 'QAYEM\Updater'
$taskValidated = $false
try {
    if ([IO.Path]::GetDirectoryName($taskJob) -ne [IO.Path]::GetFullPath($taskWork) -or [IO.Path]::GetFileName($taskJob) -notmatch '^job-[a-f0-9]{32}$' -or [IO.Path]::GetFileName($PlanPath) -ne 'plan.json') { throw 'Invalid update job location.' }
    $taskCursor = $taskJob
    while ($taskCursor) {
        if ((Get-Item -LiteralPath $taskCursor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Unsafe update location.' }
        $taskParent = [IO.Path]::GetDirectoryName($taskCursor)
        if (!$taskParent -or $taskParent -eq $taskCursor) { break }
        $taskCursor = $taskParent
    }
    $taskValidated = $true
    $taskPlan = Get-Content -LiteralPath $PlanPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($taskPlan.protocol -ne 1 -or $taskPlan.bundleId -ne 'com.qayem.style-studio.legacy' -or $taskPlan.version -notmatch '^\d{1,4}\.\d{1,4}\.\d{1,4}$') { throw 'Invalid update plan.' }
    if (Test-Path -LiteralPath (Join-Path $taskJob 'cancel.request')) { exit 1 }
    # The worker is independent from the short-lived CEP launcher. No console is required.
    $taskExecutable = Join-Path ([Environment]::GetFolderPath('Windows')) 'System32\WindowsPowerShell\v1.0\powershell.exe'
    $taskNative = Join-Path ([Environment]::GetFolderPath('Windows')) 'Sysnative\WindowsPowerShell\v1.0\powershell.exe'
    if (Test-Path -LiteralPath $taskNative) { $taskExecutable = $taskNative }
    $taskScript = Join-Path $taskJob 'apply-windows.ps1'
    if ((Get-Item -LiteralPath $taskScript -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Unsafe worker path.' }
    $taskArguments = @('-NoProfile', '-NonInteractive', '-STA', '-ExecutionPolicy', 'Bypass', '-File', ('"' + $taskScript + '"'), '-PlanPath', ('"' + [IO.Path]::GetFullPath($PlanPath) + '"'))
    $taskChild = Start-Process -FilePath $taskExecutable -ArgumentList $taskArguments -WorkingDirectory $taskJob -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskJob 'worker.log') -RedirectStandardError (Join-Path $taskJob 'worker-error.log') -PassThru
    $taskInfo = @{protocol=1; pid=$taskChild.Id; version=$taskPlan.version; at=[DateTime]::UtcNow.ToString('o')}
    [IO.File]::WriteAllText((Join-Path $taskJob 'launch.json'), ($taskInfo | ConvertTo-Json -Compress), (New-Object Text.UTF8Encoding($false)))
    # Keep the bootstrap alive until the worker confirms startup. Early syntax,
    # policy or runtime failures now retain their actual stderr in worker-error.log.
    $taskStartupDeadline = [DateTime]::UtcNow.AddSeconds(30)
    while ([DateTime]::UtcNow -lt $taskStartupDeadline) {
        if (Test-Path -LiteralPath (Join-Path $taskJob 'result.json')) { exit 0 }
        $taskChild.Refresh()
        if ($taskChild.HasExited) { throw ('Update worker exited during startup, code ' + $taskChild.ExitCode) }
        Start-Sleep -Milliseconds 250
    }
    if ($taskChild.HasExited) { throw 'Update worker stopped before reporting readiness.' }
    exit 0
} catch {
    if ($taskValidated) {
        [IO.File]::WriteAllText((Join-Path $taskJob 'launcher-error.log'), $_.Exception.Message, (New-Object Text.UTF8Encoding($false)))
        $taskResultPath = Join-Path $taskJob 'result.json'
        if (!(Test-Path -LiteralPath $taskResultPath)) {
            $taskVersion = ''
            if ($taskPlan -and $taskPlan.version) { $taskVersion = [string]$taskPlan.version }
            $taskResult = @{protocol=1; status='failed'; version=$taskVersion; code='WINDOWS_START'; message=$_.Exception.Message; at=[DateTime]::UtcNow.ToString('o')}
            [IO.File]::WriteAllText($taskResultPath, ($taskResult | ConvertTo-Json -Compress), (New-Object Text.UTF8Encoding($false)))
        }
    }
    exit 1
}
