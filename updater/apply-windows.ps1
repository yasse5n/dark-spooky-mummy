# QAYEM_OWNER_PASSWORD_REQUIRED — Owner محمد قيم. Follow AGENTS.md before source edits.
param([Parameter(Mandatory=$true)][string]$PlanPath)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2
$taskJob = [IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($PlanPath))
$taskWork = Join-Path $env:APPDATA 'QAYEM\Updater'
$taskTarget = Join-Path $env:APPDATA 'Adobe\CEP\extensions\com.qayem.style-studio.legacy'
$taskStage = Join-Path $taskJob 'extracted'
$taskLock = Join-Path $taskWork 'apply.lock'
$taskBackup = $null
$taskMoved = $false
$taskHasLock = $false
$taskValidatedJob = $false
$taskVersion = ''
$script:taskState = ''
$script:taskStateMessage = ''
$script:taskLastPulse = [DateTime]::MinValue
function Write-Status([string]$Status, [string]$Message) {
    $taskResult = @{protocol=1; status=$Status; version=$taskVersion; message=$Message; code=$(if ($Status -eq 'failed') {'WINDOWS_WORKER'} else {''}); pid=$PID; heartbeat=1; at=[DateTime]::UtcNow.ToString('o')}
    $taskTemporary = Join-Path $taskJob 'result.json.tmp'
    [IO.File]::WriteAllText($taskTemporary, ($taskResult | ConvertTo-Json -Compress), (New-Object Text.UTF8Encoding($false)))
    Move-Item -LiteralPath $taskTemporary -Destination (Join-Path $taskJob 'result.json') -Force
    $script:taskState = $Status
    $script:taskStateMessage = $Message
    $script:taskLastPulse = [DateTime]::UtcNow
}
function Pulse-Status {
    if ($script:taskState -and ([DateTime]::UtcNow - $script:taskLastPulse).TotalSeconds -ge 2) { Write-Status $script:taskState $script:taskStateMessage }
}
function Assert-NotCancelled {
    if (Test-Path -LiteralPath (Join-Path $taskJob 'cancel.request')) { throw 'Update cancelled before installation; current version retained.' }
}
function Assert-PlainPath([string]$Location) {
    $taskCursor = [IO.Path]::GetFullPath($Location)
    while ($taskCursor) {
        if (Test-Path -LiteralPath $taskCursor) {
            if ((Get-Item -LiteralPath $taskCursor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Symbolic links and junctions are not allowed in update paths.' }
        }
        $taskParent = [IO.Path]::GetDirectoryName($taskCursor)
        if (!$taskParent -or $taskParent -eq $taskCursor) { break }
        $taskCursor = $taskParent
    }
}
function Is-SafeName([string]$Name) {
    if (!$Name -or $Name.Length -gt 220 -or $Name.StartsWith('/') -or $Name -match '[\\\x00-\x1f\x7f:*?"<>|]') { return $false }
    foreach ($taskPart in $Name.Split('/')) {
        if (!$taskPart -or $taskPart -eq '.' -or $taskPart -eq '..' -or $taskPart -match '[. ]$' -or $taskPart -match '^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)') { return $false }
    }
    return $true
}
function Verify-Tree([string]$Directory, $Files) {
    Assert-PlainPath $Directory
    $taskActual = @(Get-ChildItem -LiteralPath $Directory -Recurse -File -Force)
    if ($taskActual.Count -ne $Files.Count) { throw 'The extracted file count does not match the release.' }
    foreach ($taskEntry in $Files) {
        Pulse-Status
        $taskFile = Join-Path $Directory ($taskEntry.path.Replace('/', '\'))
        Assert-PlainPath $taskFile
        if (!(Test-Path -LiteralPath $taskFile -PathType Leaf) -or (Get-Item -LiteralPath $taskFile).Length -ne $taskEntry.size -or (Get-FileHash -LiteralPath $taskFile -Algorithm SHA256).Hash.ToLowerInvariant() -ne $taskEntry.sha256) { throw 'The update file integrity check failed.' }
    }
}
try {
    if ([IO.Path]::GetDirectoryName($taskJob) -ne [IO.Path]::GetFullPath($taskWork) -or [IO.Path]::GetFileName($taskJob) -notmatch '^job-[a-f0-9]{32}$' -or [IO.Path]::GetFileName($PlanPath) -ne 'plan.json') { throw 'Invalid update job location.' }
    Assert-PlainPath $taskJob
    $taskValidatedJob = $true
    Assert-NotCancelled
    Assert-PlainPath $taskTarget
    $taskPlan = Get-Content -LiteralPath $PlanPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $taskVersion = [string]$taskPlan.version
    if ($taskPlan.protocol -ne 1 -or $taskPlan.bundleId -ne 'com.qayem.style-studio.legacy' -or [IO.Path]::GetFullPath($taskPlan.target) -ne [IO.Path]::GetFullPath($taskTarget) -or [IO.Path]::GetFullPath($taskPlan.job) -ne $taskJob -or $taskVersion -notmatch '^\d{1,4}\.\d{1,4}\.\d{1,4}$' -or [version]$taskVersion -le [version]$taskPlan.fromVersion) { throw 'Invalid update plan.' }
    if ($taskPlan.sha256 -notmatch '^[a-f0-9]{64}$' -or $taskPlan.bytes -lt 22 -or $taskPlan.bytes -gt 94371840 -or $taskPlan.files.Count -lt 15 -or $taskPlan.files.Count -gt 1800) { throw 'Invalid update size or checksum.' }
    $taskExpected = @{}; $taskTotal = 0
    foreach ($taskEntry in $taskPlan.files) {
        if (!(Is-SafeName $taskEntry.path) -or $taskExpected.ContainsKey($taskEntry.path) -or $taskEntry.sha256 -notmatch '^[a-f0-9]{64}$' -or $taskEntry.size -lt 0 -or $taskEntry.size -gt 94371840) { throw 'Unsafe update inventory.' }
        $taskExpected[$taskEntry.path] = $taskEntry; $taskTotal += $taskEntry.size
    }
    if ($taskTotal -gt 419430400) { throw 'Expanded update is too large.' }
    $taskOldConfig = Get-Content -LiteralPath (Join-Path $taskTarget 'updater-config.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($taskOldConfig.bundleId -ne $taskPlan.bundleId -or $taskOldConfig.version -ne $taskPlan.fromVersion) { throw 'The installed version changed. Check for updates again.' }
    # Exclusive FileShare.None prevents competing workers and tolerates a stale lock file.
    Assert-PlainPath $taskLock
    $taskLockStream = [IO.File]::Open($taskLock, [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::Write, [IO.FileShare]::None)
    $taskHasLock = $true
    Write-Status 'preparing' 'Checking update files.'
    $taskArchive = Join-Path $taskJob 'package.zip'
    Assert-PlainPath $taskArchive
    if ((Get-Item -LiteralPath $taskArchive).Length -ne $taskPlan.bytes -or (Get-FileHash -LiteralPath $taskArchive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $taskPlan.sha256) { throw 'Downloaded update failed its integrity check.' }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $taskZip = [IO.Compression.ZipFile]::OpenRead($taskArchive)
    try {
        if ($taskZip.Entries.Count -ne $taskPlan.files.Count) { throw 'ZIP inventory mismatch.' }
        $taskSeen = @{}
        foreach ($taskEntry in $taskZip.Entries) {
            Pulse-Status
            $taskRelative = $taskEntry.FullName
            if (!$taskRelative.StartsWith('plugin/')) { throw 'Unexpected ZIP root.' }
            $taskRelative = $taskRelative.Substring(7)
            $taskAttributeProperty = $taskEntry.GetType().GetProperty('ExternalAttributes')
            $taskIsLink = $false
            if ($taskAttributeProperty) { $taskIsLink = (($taskAttributeProperty.GetValue($taskEntry, $null) -shr 16) -band 0xF000) -eq 0xA000 }
            if (!(Is-SafeName $taskRelative) -or $taskSeen.ContainsKey($taskRelative) -or !$taskExpected.ContainsKey($taskRelative) -or $taskEntry.Length -ne $taskExpected[$taskRelative].size -or $taskIsLink) { throw 'Unsafe ZIP entry.' }
            $taskSeen[$taskRelative] = $true
        }
        [void][IO.Directory]::CreateDirectory($taskStage)
        foreach ($taskEntry in $taskZip.Entries) {
            Pulse-Status
            $taskFile = Join-Path $taskStage ($taskEntry.FullName.Substring(7).Replace('/', '\'))
            [void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($taskFile))
            $taskInput = $taskEntry.Open(); $taskOutput = [IO.File]::Open($taskFile, [IO.FileMode]::CreateNew)
            try { $taskInput.CopyTo($taskOutput) } finally { $taskOutput.Dispose(); $taskInput.Dispose() }
        }
    } finally { $taskZip.Dispose() }
    Verify-Tree $taskStage $taskPlan.files
    Assert-NotCancelled
    $taskNewConfig = Get-Content -LiteralPath (Join-Path $taskStage 'updater-config.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($taskNewConfig.version -ne $taskVersion -or $taskNewConfig.bundleId -ne $taskPlan.bundleId) { throw 'Release identity mismatch.' }
    Write-Status 'waiting' 'Save your work and close Photoshop. Wait for the completion message before reopening it.'
    $taskDeadline = [DateTime]::UtcNow.AddMinutes(20)
    $taskQuietSince = $null
    while ($true) {
        Pulse-Status
        Assert-NotCancelled
        if ([DateTime]::UtcNow -gt $taskDeadline) { throw 'Photoshop is still open. Update cancelled; current version retained.' }
        if (Get-Process Photoshop -ErrorAction SilentlyContinue) { $taskQuietSince = $null }
        elseif (!$taskQuietSince) { $taskQuietSince = [DateTime]::UtcNow }
        elseif (([DateTime]::UtcNow - $taskQuietSince).TotalSeconds -ge 3) { break }
        Start-Sleep -Milliseconds 500
    }
    Write-Status 'installing' 'Installing and verifying update. Keep Photoshop closed until completion.'
    Verify-Tree $taskStage $taskPlan.files
    Assert-PlainPath $taskTarget
    $taskOldConfig = Get-Content -LiteralPath (Join-Path $taskTarget 'updater-config.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($taskOldConfig.version -ne $taskPlan.fromVersion) { throw 'The installed version changed while waiting.' }
    if (Get-Process Photoshop -ErrorAction SilentlyContinue) { throw 'Photoshop reopened. Current version retained.' }
    Assert-NotCancelled
    $taskBackupBase = Join-Path $env:APPDATA 'QAYEM\Backups'
    Assert-PlainPath $taskBackupBase
    [void][IO.Directory]::CreateDirectory($taskBackupBase)
    $taskBackup = Join-Path $taskBackupBase ('auto-' + $taskPlan.fromVersion + '-' + [IO.Path]::GetFileName($taskJob))
    Move-Item -LiteralPath $taskTarget -Destination $taskBackup
    Move-Item -LiteralPath $taskStage -Destination $taskTarget
    $taskMoved = $true
    Verify-Tree $taskTarget $taskPlan.files
    Write-Status 'installed' 'Update installed and verified. Open Photoshop to continue.'
    $taskLockStream.Dispose(); $taskHasLock = $false
    try {
        $taskNotifier = New-Object -ComObject WScript.Shell
        [void]$taskNotifier.Popup('تم تحديث QAYEM Style Studio بنجاح. تقدر تفتح فوتوشوب دلوقتي.', 0, 'QAYEM Style Studio', 64)
    } catch { }
} catch {
    $taskMessage = $_.Exception.Message
    try {
        if ($taskMoved -and (Test-Path -LiteralPath $taskTarget)) { Remove-Item -LiteralPath $taskTarget -Recurse -Force }
        if ($taskBackup -and (Test-Path -LiteralPath $taskBackup) -and !(Test-Path -LiteralPath $taskTarget)) { Move-Item -LiteralPath $taskBackup -Destination $taskTarget }
    } catch { $taskMessage += ' Backup restoration needs attention.' }
    if ($taskValidatedJob -and (Test-Path -LiteralPath $taskJob -PathType Container)) { Write-Status 'failed' $taskMessage }
    if ($taskHasLock) { $taskLockStream.Dispose(); $taskHasLock = $false }
    try { [void](New-Object -ComObject WScript.Shell).Popup('التحديث لم يكتمل. افتح فوتوشوب لمراجعة الحالة، وتواصل مع الدعم لو تكرر العطل.', 0, 'QAYEM Style Studio', 16) } catch { }
    exit 1
} finally {
    if ($taskHasLock) { $taskLockStream.Dispose() }
}
