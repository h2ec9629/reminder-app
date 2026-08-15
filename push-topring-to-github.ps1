# =======================================================
# push-topring-to-github.ps1
# Push index.html, style.css, ui.js, main.js, sync.js, sw.js, VDEK-main/index.html
# to H2EC9629/reminder-app (main) via GitHub Contents API. No git command used.
# English messages only (avoids console mojibake on Windows PowerShell 5.1 default codepage).
# =======================================================

$RepoOwner = "H2EC9629"
$RepoName  = "reminder-app"
$Branch    = "main"
$LocalDir  = "C:\Users\mmtm9\Desktop\dev\reminder-app-main"
$PatFile   = "C:\Users\mmtm9\OneDrive\app\_local\github_pat.txt"

$Files = @("index.html", "style.css", "ui.js", "main.js", "sync.js", "sw.js", "VDEK-main/index.html")

function Fail($msg) {
    Write-Host ""
    Write-Host "[FAILED] $msg" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}

try {
    if (-not (Test-Path $PatFile)) { Fail "PAT file not found: $PatFile" }
    $Token = (Get-Content $PatFile -Raw).Trim()
    if ([string]::IsNullOrWhiteSpace($Token)) { Fail "PAT file is empty: $PatFile" }

    $Headers = @{
        "Authorization" = "token $Token"
        "Accept"        = "application/vnd.github.v3+json"
        "User-Agent"    = "reminder-app-push-script"
    }

    $okCount = 0

    foreach ($FilePath in $Files) {
        $LocalFile = Join-Path $LocalDir $FilePath
        Write-Host ""
        Write-Host "=== $FilePath ===" -ForegroundColor Cyan

        if (-not (Test-Path $LocalFile)) { Fail "Local file not found: $LocalFile" }

        $ApiBase = "https://api.github.com/repos/$RepoOwner/$RepoName/contents/$FilePath"

        Write-Host "Step 1/3: Getting current file SHA..."
        $current = Invoke-RestMethod -Uri "$ApiBase`?ref=$Branch" -Headers $Headers -Method Get
        $sha = $current.sha
        Write-Host "  SHA: $sha"

        Write-Host "Step 2/3: Reading local file and encoding..."
        $bytes = [System.IO.File]::ReadAllBytes($LocalFile)
        $base64Content = [System.Convert]::ToBase64String($bytes)
        Write-Host "  Size: $($bytes.Length) bytes"

        $body = @{
            message = "$FilePath: ring menu redesign + VDECK wake lock + reload quiet-restore fix"
            content = $base64Content
            sha     = $sha
            branch  = $Branch
        } | ConvertTo-Json

        Write-Host "Step 3/3: Pushing to GitHub..."
        $result = Invoke-RestMethod -Uri $ApiBase -Headers $Headers -Method Put -Body $body -ContentType "application/json; charset=utf-8"

        Write-Host "  [OK] Commit: $($result.commit.sha)" -ForegroundColor Green
        $okCount++
    }

    Write-Host ""
    Write-Host "[SUCCESS] Pushed $okCount / $($Files.Count) files." -ForegroundColor Green
    Write-Host "  URL: https://github.com/$RepoOwner/$RepoName"
    Write-Host ""
    Read-Host "Press Enter to close"
}
catch {
    Write-Host ""
    Write-Host "[ERROR] An exception occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
        Write-Host "Response body:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}
