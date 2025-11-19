# Android SDK Command Line Tools Installer
# This script installs Android SDK Command Line Tools

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Android SDK Command Line Tools Install" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Install directory
$installDir = "$env:LOCALAPPDATA\Android\Sdk"
$cmdlineToolsDir = "$installDir\cmdline-tools"

# Create directory if not exists
if (-not (Test-Path $installDir)) {
    Write-Host "Creating install directory: $installDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

# Download URL
$downloadUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$zipFile = "$env:TEMP\android-cmdline-tools.zip"

Write-Host "1. Downloading Android SDK Command Line Tools..." -ForegroundColor Green
Write-Host "   URL: $downloadUrl" -ForegroundColor Gray
Write-Host "   Save to: $zipFile" -ForegroundColor Gray

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile -UseBasicParsing
    Write-Host "   Download completed" -ForegroundColor Green
} catch {
    Write-Host "   Download error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Extracting..." -ForegroundColor Green

$extractDir = "$env:TEMP\android-cmdline-tools-extract"
if (Test-Path $extractDir) {
    Remove-Item -Path $extractDir -Recurse -Force
}
New-Item -ItemType Directory -Path $extractDir -Force | Out-Null

try {
    Expand-Archive -Path $zipFile -DestinationPath $extractDir -Force
    Write-Host "   Extraction completed" -ForegroundColor Green
} catch {
    Write-Host "   Extraction error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Installing..." -ForegroundColor Green

if (-not (Test-Path $cmdlineToolsDir)) {
    New-Item -ItemType Directory -Path $cmdlineToolsDir -Force | Out-Null
}

$latestDir = "$cmdlineToolsDir\latest"
if (Test-Path $latestDir) {
    Write-Host "   Removing existing installation..." -ForegroundColor Yellow
    Remove-Item -Path $latestDir -Recurse -Force
}

$extractedContent = Get-ChildItem -Path $extractDir | Select-Object -First 1
if ($extractedContent) {
    Move-Item -Path $extractedContent.FullName -Destination $latestDir -Force
    Write-Host "   Installation completed" -ForegroundColor Green
    Write-Host "   Installed to: $latestDir" -ForegroundColor Gray
} else {
    Write-Host "   Extracted files not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "4. Setting environment variables..." -ForegroundColor Green

$sdkManagerPath = "$latestDir\bin\sdkmanager.bat"
if (Test-Path $sdkManagerPath) {
    Write-Host "   sdkmanager found: $sdkManagerPath" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Please set the following environment variables:" -ForegroundColor Yellow
    Write-Host "  ANDROID_HOME = $installDir" -ForegroundColor Cyan
    Write-Host "  ANDROID_SDK_ROOT = $installDir" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Add to PATH:" -ForegroundColor Yellow
    Write-Host "  $latestDir\bin" -ForegroundColor Cyan
    Write-Host ""
    
    # Set temporarily for this session
    $env:ANDROID_HOME = $installDir
    $env:ANDROID_SDK_ROOT = $installDir
    $env:PATH += ";$latestDir\bin"
    
    Write-Host "5. Verifying..." -ForegroundColor Green
    $result = & "$sdkManagerPath" --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   sdkmanager is working correctly" -ForegroundColor Green
    } else {
        Write-Host "   Warning: Verification failed (environment variables may need to be set)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   sdkmanager not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Set environment variables (see above)" -ForegroundColor White
Write-Host "  2. Open a new PowerShell window" -ForegroundColor White
Write-Host "  3. Install required SDK packages:" -ForegroundColor White
Write-Host "     sdkmanager 'platform-tools' 'platforms;android-33' 'build-tools;33.0.0'" -ForegroundColor Cyan
Write-Host ""

# Cleanup
Write-Host "Cleaning up temporary files..." -ForegroundColor Gray
if (Test-Path $zipFile) {
    Remove-Item -Path $zipFile -Force
}
if (Test-Path $extractDir) {
    Remove-Item -Path $extractDir -Recurse -Force
}

Write-Host "Done!" -ForegroundColor Green
