param(
  [int]$Port = 8765
)

$root = $PSScriptRoot
$prefix = "http://localhost:$Port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
} catch {
  Write-Host ""
  Write-Host "==========================================" -ForegroundColor Red
  Write-Host " サーバーを起動できませんでした。" -ForegroundColor Red
  Write-Host " ポート $Port が既に使われているか、権限が足りない可能性があります。" -ForegroundColor Red
  Write-Host ""
  Write-Host " もし権限エラーの場合は、管理者権限のコマンドプロンプトで" -ForegroundColor Yellow
  Write-Host " 一度だけ次のコマンドを実行してから、もう一度試してください：" -ForegroundColor Yellow
  Write-Host "   netsh http add urlacl url=$prefix user=$env:USERNAME" -ForegroundColor Yellow
  Write-Host "==========================================" -ForegroundColor Red
  Write-Host $_.Exception.Message
  Read-Host "Enterキーで終了します"
  exit 1
}

Write-Host "=========================================="
Write-Host " Meas local server (PowerShell / no install needed)"
Write-Host " Serving: $root"
Write-Host " URL:     $prefix"
Write-Host " このウィンドウを閉じると終了します。"
Write-Host "=========================================="
Write-Host ""

$mime = @{
  ".html"        = "text/html; charset=utf-8"
  ".htm"         = "text/html; charset=utf-8"
  ".js"          = "application/javascript; charset=utf-8"
  ".css"         = "text/css; charset=utf-8"
  ".json"        = "application/json; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
  ".png"         = "image/png"
  ".jpg"         = "image/jpeg"
  ".jpeg"        = "image/jpeg"
  ".gif"         = "image/gif"
  ".svg"         = "image/svg+xml"
  ".ico"         = "image/x-icon"
  ".txt"         = "text/plain; charset=utf-8"
}

$fullRoot = (Resolve-Path $root).Path

while ($listener.IsListening) {
  $context = $null
  try {
    $context = $listener.GetContext()
  } catch {
    break
  }

  $request  = $context.Request
  $response = $context.Response

  try {
    $relPath = [Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrEmpty($relPath)) { $relPath = "meas.html" }

    $filePath = Join-Path $fullRoot $relPath
    $fullFile = [System.IO.Path]::GetFullPath($filePath)

    if (-not $fullFile.StartsWith($fullRoot, [StringComparison]::OrdinalIgnoreCase)) {
      $response.StatusCode = 403
    } elseif (Test-Path $fullFile -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($fullFile).ToLower()
      $ct = $mime[$ext]
      if (-not $ct) { $ct = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($fullFile)
      $response.ContentType = $ct
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $relPath")
      $response.OutputStream.Write($msg, 0, $msg.Length)
    }
  } catch {
    try { $response.StatusCode = 500 } catch {}
  } finally {
    $response.Close()
  }
}
