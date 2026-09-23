param([switch]$Publish)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$project = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$versionLine = (Get-Content -LiteralPath (Join-Path $project 'public/rankforge/version.txt') -First 1)
if ($versionLine -notmatch '^EvoRank (X\d+\.\d+)$') { throw 'Invalid version' }
$release = $Matches[1]
$delivery = Join-Path $project 'delivery'
$receipt = Get-Content -LiteralPath (Join-Path $delivery "EVORANK-$release-SAVED.json") -Raw | ConvertFrom-Json
$ready = Get-Content -LiteralPath (Join-Path $delivery "EVORANK-$release-READY.json") -Raw | ConvertFrom-Json
$config = Get-Content -LiteralPath (Join-Path $project 'packaging/release-targets.json') -Raw | ConvertFrom-Json
function Child([string]$root,[string]$relative) {
  $base = [IO.Path]::GetFullPath($root).TrimEnd('\')
  $full = [IO.Path]::GetFullPath((Join-Path $base $relative))
  if (-not $full.StartsWith($base+'\',[StringComparison]::OrdinalIgnoreCase)) { throw "Path outside root: $full" }
  $current = $full
  while ($current) {
    # OneDrive cloud placeholders also carry ReparsePoint; reject actual links/junctions.
    if (Test-Path -LiteralPath $current) {
      $entry=Get-Item -LiteralPath $current -Force
      if ($entry.LinkType -in @('SymbolicLink','Junction')) { throw "Redirected path: $current" }
    }
    $parent = [IO.Path]::GetDirectoryName($current)
    if ($parent -eq $current) { break }
    $current = $parent
  }
  return $full
}
function Sha([IO.Stream]$stream) { $hash=[Security.Cryptography.SHA256]::Create();try{return [BitConverter]::ToString($hash.ComputeHash($stream)).Replace('-','').ToLowerInvariant()}finally{$hash.Dispose()} }
function FileSha([string]$file) { $stream=[IO.File]::OpenRead($file);try{return Sha $stream}finally{$stream.Dispose()} }
$relative = $release.Split('.')[0].ToLowerInvariant()+'\'+$release
$source = Child $config.extractedRoot $relative
if ($receipt.Destination -ne $source -or $ready.Destination -ne $source -or $receipt.Release -ne $release) { throw 'Saved release mismatch' }
$zipPath = Child $delivery "EVORANK-$release.zip"
if (-not $Publish) {
  if (Test-Path -LiteralPath $zipPath) { throw "Archive already exists: $zipPath" }
  foreach ($item in $ready.Files) {
    $file = Child $source $item.Path
    if ((FileSha $file) -ne $item.SHA256) { throw "Changed release file: $file" }
  }
  $archive=[IO.Compression.ZipFile]::Open($zipPath,[IO.Compression.ZipArchiveMode]::Create)
  try { foreach($item in $ready.Files){[IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,(Child $source $item.Path),$item.Path.Replace('\','/'),[IO.Compression.CompressionLevel]::Optimal) | Out-Null} }
  finally {$archive.Dispose()}
}
# Verify every archived byte against the saved manifest before distribution.
$archive=[IO.Compression.ZipFile]::OpenRead($zipPath)
try {
  if ($archive.Entries.Count -ne $ready.Files.Count) { throw 'Archive count mismatch' }
  foreach($item in $ready.Files){
    $entry=$archive.GetEntry($item.Path.Replace('\','/'));if(-not $entry){throw 'Missing archive entry'}
    $stream=$entry.Open();try{if((Sha $stream) -ne $item.SHA256){throw "Archive mismatch: $($item.Path)"}}finally{$stream.Dispose()}
  }
} finally {$archive.Dispose()}
if ($Publish) {
  $destination=Child $config.zipRoot ($release.Split('.')[0].ToLowerInvariant()+"\EVORANK-$release.zip")
  if (Test-Path -LiteralPath $destination) { if ((FileSha $destination) -ne (FileSha $zipPath)) { throw 'Refusing to overwrite a different archive' } }
  else { [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($destination)) | Out-Null; [IO.File]::Copy($zipPath,$destination,$false) }
  if ((FileSha $destination) -ne (FileSha $zipPath)) { throw 'Copy mismatch' }
  [pscustomobject]@{Path=$destination;SHA256=(FileSha $destination);VerifiedFiles=$ready.Files.Count;Bytes=(Get-Item -LiteralPath $destination).Length} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $delivery "EVORANK-$release-ZIP-SAVED.json") -Encoding utf8
  Write-Output "Saved and verified: $destination"
} else { Write-Output "Prepared and verified: $zipPath" }
