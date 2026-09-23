param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$project = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$delivery = Join-Path $project 'delivery'
$stageBase = Join-Path $delivery '.ready'
$config = Get-Content -LiteralPath (Join-Path $project 'packaging/release-targets.json') -Raw | ConvertFrom-Json
$releaseBase = [IO.Path]::GetFullPath($config.extractedRoot)
$planned = [Collections.Generic.List[object]]::new()

function Checked-Child([string]$root,[string]$candidate) {
  $resolved = [IO.Path]::GetFullPath($candidate)
  if (-not $resolved.StartsWith($root.TrimEnd('\') + '\',[StringComparison]::OrdinalIgnoreCase)) { throw "Path outside expected root: $resolved" }
  $current = $resolved
  while ($current.Length -gt $root.Length) {
    if (Test-Path -LiteralPath $current) {
      if ((Get-Item -LiteralPath $current -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Redirected path: $current" }
    }
    $current = [IO.Path]::GetDirectoryName($current)
  }
  return $resolved
}
function File-Sha256([string]$file) {
  # npm can start Windows PowerShell with a PSModulePath inherited from pwsh.
  # Use .NET directly so verification does not depend on module autoloading.
  $stream = [IO.File]::OpenRead($file)
  $hasher = [Security.Cryptography.SHA256]::Create()
  try { return [BitConverter]::ToString($hasher.ComputeHash($stream)).Replace('-','').ToLowerInvariant() }
  finally { $hasher.Dispose(); $stream.Dispose() }
}
function Same-File([string]$source,[string]$copy) {
  if (-not (Test-Path -LiteralPath $copy -PathType Leaf)) { return $false }
  return ((File-Sha256 $source) -eq (File-Sha256 $copy))
}

# Only verified, delivered staging copies. Never infer that a failed preparation is disposable.
foreach ($receiptFile in Get-ChildItem -LiteralPath $delivery -Filter 'EVORANK-*-SAVED.json' -File) {
  $receipt = Get-Content -LiteralPath $receiptFile.FullName -Raw | ConvertFrom-Json
  if ($receipt.Format -ne 'extracted' -or $receipt.Release -notmatch '^X\d+\.\d+$') { continue }
  $readyFile = Join-Path $delivery ('EVORANK-' + $receipt.Release + '-READY.json')
  if (-not (Test-Path -LiteralPath $readyFile)) { continue }
  $ready = Get-Content -LiteralPath $readyFile -Raw | ConvertFrom-Json
  $stage = Checked-Child $stageBase $ready.StageRoot
  $destination = Checked-Child $releaseBase $receipt.Destination
  if ($ready.Destination -ne $destination -or $ready.Release -ne $receipt.Release) { throw 'Manifest/receipt mismatch' }
  if (-not (Test-Path -LiteralPath $stage)) { continue }
  $files = @(Get-ChildItem -LiteralPath $stage -Recurse -File -Force)
  if ($files.Count -ne $ready.Files.Count -or $files.Count -ne $receipt.VerifiedFiles) { continue }
  $valid = $true
  foreach ($file in $ready.Files) {
    $source = Checked-Child $stage (Join-Path $stage $file.Path)
    $copy = Checked-Child $destination (Join-Path $destination $file.Path)
    if (-not (Test-Path -LiteralPath $source -PathType Leaf) -or -not (Test-Path -LiteralPath $copy -PathType Leaf)) { $valid = $false; break }
    if ((File-Sha256 $source) -ne $file.SHA256 -or -not (Same-File $source $copy)) { $valid = $false; break }
  }
  if ($valid) { $planned.Add([pscustomobject]@{Path=$stage; Kind='Verified staging copy'; Bytes=($files | Measure-Object Length -Sum).Sum; Recursive=$true}) }
}

# The screenshot refers to X4.8's Windows folder. The complete source keeps the originals.
$versionRoot = Checked-Child $releaseBase (Join-Path $releaseBase 'x4\X4.8')
$windows = Join-Path $versionRoot 'EVORANK-X4.8-WINDOWS'
$sourceRoot = Join-Path $versionRoot 'EVORANK-X4.8-CODEX-PROJEKT'
if (Test-Path -LiteralPath $windows) {
  $candidates = @(Get-ChildItem -LiteralPath $windows -File | Where-Object {
    $_.Name -match '^CONTINUE-HERE-X\d+\.\d+\.md$' -or
    ($_.Name -match '^EVORANK-X\d+\.\d+-ANLEITUNG\.md$' -and $_.Name -ne 'EVORANK-X4.8-ANLEITUNG.md')
  })
  $docPath = Join-Path $windows 'docs'
  if (Test-Path -LiteralPath $docPath) { $candidates += @(Get-ChildItem -LiteralPath $docPath -File | Where-Object { $_.Name -match '^EVORANK-X\d+\.\d+-' }) }
  foreach ($file in $candidates) {
    $target = Checked-Child $windows $file.FullName
    $relative = $target.Substring($windows.Length + 1)
    $copy = Checked-Child $sourceRoot (Join-Path $sourceRoot $relative)
    if (Same-File $target $copy) { $planned.Add([pscustomobject]@{Path=$target;Kind='Duplicate Windows documentation';Bytes=$file.Length;Recursive=$false}) }
  }
}

$report = [pscustomobject]@{Apply=[bool]$Apply;Count=$planned.Count;Bytes=($planned | Measure-Object Bytes -Sum).Sum;Items=@($planned.ToArray());At=[DateTime]::UtcNow.ToString('o')}
if ($Apply) {
  # All hashes and resolved paths above are checked before the first deletion.
  foreach ($item in $planned) {
    if ($item.Recursive) { $checked = Checked-Child $stageBase $item.Path; Remove-Item -LiteralPath $checked -Recurse -Force }
    else { $checked = Checked-Child $windows $item.Path; Remove-Item -LiteralPath $checked -Force }
  }
  $reportFile = Join-Path $delivery ('CLEANUP-' + [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss') + '.json')
  $report | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $reportFile -Encoding utf8
}
$report | Select-Object Apply,Count,Bytes,At | ConvertTo-Json
