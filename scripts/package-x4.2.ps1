param([ValidatePattern('^X[0-9]+\.[0-9]+$')][string]$Release = 'X4.2')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$deliveryRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot 'delivery'))
if (-not $deliveryRoot.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid output directory' }
[IO.Directory]::CreateDirectory($deliveryRoot) | Out-Null
$webRoot = Join-Path $projectRoot 'public\rankforge'
$webFiles = @(Get-ChildItem -LiteralPath $webRoot -Recurse -File)
$launcherRoot = Join-Path $projectRoot 'packaging\windows'
$launchers = @(Get-ChildItem -LiteralPath $launcherRoot -File)
function Entry($file, $name) { return @{ Path = $file; Name = $name.Replace('\', '/') } }
function Write-Package($name, $entries) {
    $target = Join-Path $deliveryRoot $name
    $stream = [IO.File]::Open($target, [IO.FileMode]::Create, [IO.FileAccess]::Write)
    $zip = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Create, $false)
    try {
        foreach ($entry in $entries) {
            if ($entry.Name.StartsWith('/') -or $entry.Name -match '(^|/)\.\.(/|$)') { throw 'Unsafe archive entry' }
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $entry.Path, $entry.Name, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    } finally { $zip.Dispose(); $stream.Dispose() }
    $check = [IO.Compression.ZipFile]::OpenRead($target)
    try { if ($check.Entries.Count -ne $entries.Count) { throw 'Archive entry count mismatch' } }
    finally { $check.Dispose() }
    $info = Get-Item -LiteralPath $target
    [PSCustomObject]@{ File=$name; Files=$entries.Count; Bytes=$info.Length; SHA256=(Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash }
}
$netlify = @($webFiles | ForEach-Object { Entry $_.FullName $_.FullName.Substring($webRoot.Length+1) })
$windows = @($webFiles | ForEach-Object { Entry $_.FullName ('website/' + $_.FullName.Substring($webRoot.Length+1)) })
$windows += @($launchers | ForEach-Object { Entry $_.FullName $_.Name })
$windows += Entry (Join-Path $projectRoot "EVORANK-$Release-ANLEITUNG.md") "EVORANK-$Release-ANLEITUNG.md"
if ($Release -eq 'X4.3') {
    foreach ($relative in @('EVORANK-X4.2-ANLEITUNG.md','CONTINUE-HERE-X4.2.md','CONTINUE-HERE-X4.3.md','docs/EVORANK-X4.3-MUSKELRAENGE.md','docs/EVORANK-X4.3-VALIDATION.json','docs/EVORANK-X4.2-RANGPRUEFUNG.md','docs/EVORANK-X4.2-EXERCISE-AUDIT.json','docs/EVORANK-X4.2-VALIDATION.json')) {
        $windows += Entry (Join-Path $projectRoot $relative) $relative
    }
}
Push-Location -LiteralPath $projectRoot
try { $sourcePaths = @(git -c core.quotepath=false ls-files --cached --others --exclude-standard); if ($LASTEXITCODE -ne 0) { throw 'Source inventory failed' } }
finally { Pop-Location }
$source = @($sourcePaths | Sort-Object -Unique | ForEach-Object { Entry (Join-Path $projectRoot $_) $_ })
$results = @(
    Write-Package "EVORANK-$Release-NETLIFY.zip" $netlify
    Write-Package "EVORANK-$Release-WINDOWS.zip" $windows
    Write-Package "EVORANK-$Release-CODEX-PROJEKT.zip" $source
)
$results | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $deliveryRoot "EVORANK-$Release-PAKETE.json") -Encoding UTF8
$results | Format-Table File, Files, Bytes
