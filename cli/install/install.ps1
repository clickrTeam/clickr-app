#
# This script installs the clickr CLI from a GitHub Release on Windows.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -Command "iwr -useb https://raw.githubusercontent.com/clickrTeam/clickr-app/main/install/install.ps1 | iex"

# ==============================================================================
# Helper Functions
# ==============================================================================

function Log {
    param ([string]$message)
    Write-Host "[INFO] $message"
}

function Err {
    param ([string]$message)
    Write-Host "[ERROR] $message" -ForegroundColor Red
    exit 1
}

# ==============================================================================
# Main Logic
# ==============================================================================

# The release to download from.
$releaseName = "cli-v0.2.0"

# The asset name for Windows.
$assetName = "clickr-windows-x86_64.exe"

# Construct the download URL.
$downloadUrl = "https://github.com/clickrTeam/clickr-app/releases/download/${releaseName}/${assetName}"

# Set the installation directory.
$installDir = "$env:USERPROFILE\.clickr\bin"
$binaryName = "clickr.exe"
$binaryPath = Join-Path $installDir $binaryName

# Create the installation directory if it doesn't exist.
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Force -Path $installDir
}

# Download the binary.
Log "Downloading $binaryName from release $releaseName..."
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $binaryPath
} catch {
    Err "Failed to download asset. Please check the release name and asset name."
}

# Add the installation directory to the user's PATH if it's not already there.
$userPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
if ($userPath -notlike "*$installDir*") {
    Log "Adding $installDir to your PATH."
    $newPath = "$userPath;$installDir"
    [System.Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
    Log "Please restart your terminal for the PATH changes to take effect."
}

Log "$binaryName has been installed successfully!"
Log "You can now run it by typing '$binaryName' in your terminal (you may need to restart your terminal)."
