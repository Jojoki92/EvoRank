param(
  [int]$Port = 8123,
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "EvoRank X5.7"

$WebsiteRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "website"))
if (-not [System.IO.Directory]::Exists($WebsiteRoot)) {
  Write-Host "FEHLER: Der Ordner 'website' wurde nicht gefunden." -ForegroundColor Red
  Write-Host "Bitte die ZIP-Datei vollstaendig entpacken und erneut starten."
  Read-Host "Enter druecken zum Beenden"
  exit 1
}

$MimeTypes = @{
  ".html"        = "text/html; charset=utf-8"
  ".htm"         = "text/html; charset=utf-8"
  ".js"          = "text/javascript; charset=utf-8"
  ".mjs"         = "text/javascript; charset=utf-8"
  ".css"         = "text/css; charset=utf-8"
  ".json"        = "application/json; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
  ".xml"         = "application/xml; charset=utf-8"
  ".txt"         = "text/plain; charset=utf-8"
  ".csv"         = "text/csv; charset=utf-8"
  ".png"         = "image/png"
  ".jpg"         = "image/jpeg"
  ".jpeg"        = "image/jpeg"
  ".webp"        = "image/webp"
  ".gif"         = "image/gif"
  ".svg"         = "image/svg+xml"
  ".ico"         = "image/x-icon"
  ".woff"        = "font/woff"
  ".woff2"       = "font/woff2"
  ".ttf"         = "font/ttf"
  ".wasm"        = "application/wasm"
  ".pdf"         = "application/pdf"
  ".zip"         = "application/zip"
  ".mp4"         = "video/mp4"
}

$Utf8 = [System.Text.UTF8Encoding]::new($false)
$Ascii = [System.Text.Encoding]::ASCII

function Send-HttpResponse {
  param(
    [System.IO.Stream]$Stream,
    [int]$StatusCode,
    [string]$Reason,
    [string]$ContentType,
    [byte[]]$Body,
    [bool]$HeadOnly = $false
  )

  if ($null -eq $Body) { $Body = [byte[]]::new(0) }
  $Header = "HTTP/1.1 $StatusCode $Reason`r`n" +
            "Content-Type: $ContentType`r`n" +
            "Content-Length: $($Body.Length)`r`n" +
            "Cache-Control: no-store`r`n" +
            "X-Content-Type-Options: nosniff`r`n" +
            "Referrer-Policy: strict-origin-when-cross-origin`r`n" +
            "Connection: close`r`n`r`n"
  $HeaderBytes = $Ascii.GetBytes($Header)
  $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
  if (-not $HeadOnly -and $Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
  $Stream.Flush()
}

function Send-TextError {
  param(
    [System.IO.Stream]$Stream,
    [int]$StatusCode,
    [string]$Reason,
    [string]$Message,
    [bool]$HeadOnly = $false
  )
  Send-HttpResponse -Stream $Stream -StatusCode $StatusCode -Reason $Reason `
    -ContentType "text/plain; charset=utf-8" -Body $Utf8.GetBytes($Message) `
    -HeadOnly $HeadOnly
}

$Listener = $null
$SelectedPort = $Port
$LastPort = $Port + 20

while ($SelectedPort -le $LastPort) {
  try {
    $Listener = [System.Net.Sockets.TcpListener]::new(
      [System.Net.IPAddress]::Loopback,
      $SelectedPort
    )
    $Listener.Start()
    break
  }
  catch {
    if ($null -ne $Listener) {
      try { $Listener.Stop() } catch { }
    }
    $Listener = $null
    $SelectedPort++
  }
}

if ($null -eq $Listener) {
  Write-Host "FEHLER: Kein freier lokaler Port gefunden." -ForegroundColor Red
  Read-Host "Enter druecken zum Beenden"
  exit 2
}

$Url = "http://127.0.0.1:$SelectedPort/"
Write-Host ""
Write-Host "  EvoRank X5.7 ist bereit" -ForegroundColor Cyan
Write-Host "  $Url" -ForegroundColor White
Write-Host ""
Write-Host "  Dieses Fenster waehrend der Nutzung offen lassen."
Write-Host "  Zum Beenden: Fenster schliessen oder Strg+C druecken."
Write-Host ""

try {
  if (-not $NoBrowser) { Start-Process $Url }
}
catch {
  Write-Host "Browser konnte nicht automatisch geoeffnet werden."
  Write-Host "Bitte diese Adresse manuell oeffnen: $Url"
}

$RootPrefix = $WebsiteRoot.TrimEnd(
  [System.IO.Path]::DirectorySeparatorChar,
  [System.IO.Path]::AltDirectorySeparatorChar
) + [System.IO.Path]::DirectorySeparatorChar

try {
  while ($true) {
    $Client = $null
    $Stream = $null
    $Reader = $null
    try {
      $Client = $Listener.AcceptTcpClient()
      $Client.NoDelay = $true
      $Stream = $Client.GetStream()
      $Stream.ReadTimeout = 5000
      $Stream.WriteTimeout = 5000
      $Reader = [System.IO.StreamReader]::new(
        $Stream,
        $Ascii,
        $false,
        8192,
        $true
      )

      $RequestLine = $Reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($RequestLine)) { continue }

      $HeaderCount = 0
      do {
        $HeaderLine = $Reader.ReadLine()
        $HeaderCount++
      } while ($null -ne $HeaderLine -and $HeaderLine.Length -gt 0 -and $HeaderCount -lt 100)

      $Parts = $RequestLine.Split(' ')
      if ($Parts.Length -lt 3) {
        Send-TextError $Stream 400 "Bad Request" "Ungueltige Anfrage."
        continue
      }

      $Method = $Parts[0].ToUpperInvariant()
      $HeadOnly = $Method -eq "HEAD"
      if ($Method -ne "GET" -and -not $HeadOnly) {
        Send-TextError $Stream 405 "Method Not Allowed" "Nur GET und HEAD sind erlaubt."
        continue
      }

      $RawPath = $Parts[1].Split('?')[0].Split('#')[0]
      try {
        $DecodedPath = [System.Uri]::UnescapeDataString($RawPath)
      }
      catch {
        Send-TextError $Stream 400 "Bad Request" "Ungueltiger Pfad." $HeadOnly
        continue
      }

      $RelativePath = $DecodedPath.Replace('\', '/').TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($RelativePath)) {
        $RelativePath = "index.html"
      }
      elseif ($RelativePath.EndsWith('/')) {
        $RelativePath += "index.html"
      }

      $Segments = $RelativePath.Split('/')
      if ($Segments -contains ".." -or $Segments -contains "." -or
          $RelativePath -match '(?i)(^|/)internal(/|$)' -or
          $RelativePath -match '(?i)\.sql$' -or
          $RelativePath -match '(?i)(^|/)(APPROVED-EMAILS|ADD-APPROVED-EMAIL)') {
        Send-TextError $Stream 403 "Forbidden" "Zugriff verweigert." $HeadOnly
        continue
      }

      $PlatformPath = $RelativePath.Replace(
        '/',
        [System.IO.Path]::DirectorySeparatorChar
      )
      try {
        $FullPath = [System.IO.Path]::GetFullPath(
          [System.IO.Path]::Combine($WebsiteRoot, $PlatformPath)
        )
      }
      catch {
        Send-TextError $Stream 400 "Bad Request" "Ungueltiger Pfad." $HeadOnly
        continue
      }

      if (-not $FullPath.StartsWith(
          $RootPrefix,
          [System.StringComparison]::OrdinalIgnoreCase
        )) {
        Send-TextError $Stream 403 "Forbidden" "Zugriff verweigert." $HeadOnly
        continue
      }

      if (-not [System.IO.File]::Exists($FullPath)) {
        if ([string]::IsNullOrEmpty([System.IO.Path]::GetExtension($RelativePath))) {
          $FullPath = Join-Path $WebsiteRoot "index.html"
        }
        else {
          Send-TextError $Stream 404 "Not Found" "Datei nicht gefunden." $HeadOnly
          continue
        }
      }

      $Extension = [System.IO.Path]::GetExtension($FullPath).ToLowerInvariant()
      $ContentType = $MimeTypes[$Extension]
      if ([string]::IsNullOrWhiteSpace($ContentType)) {
        $ContentType = "application/octet-stream"
      }

      $Bytes = [System.IO.File]::ReadAllBytes($FullPath)
      Send-HttpResponse -Stream $Stream -StatusCode 200 -Reason "OK" `
        -ContentType $ContentType -Body $Bytes -HeadOnly $HeadOnly
    }
    catch {
      if ($null -ne $Stream -and $Stream.CanWrite) {
        try {
          Send-TextError $Stream 500 "Internal Server Error" "Lokaler Serverfehler."
        }
        catch { }
      }
    }
    finally {
      if ($null -ne $Reader) { try { $Reader.Dispose() } catch { } }
      if ($null -ne $Stream) { try { $Stream.Dispose() } catch { } }
      if ($null -ne $Client) { try { $Client.Close() } catch { } }
    }
  }
}
finally {
  if ($null -ne $Listener) { $Listener.Stop() }
}
