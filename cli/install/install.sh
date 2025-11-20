#!/bin/bash
#
# This script installs the clickr CLI from a GitHub Release.
#

set -e

# ==============================================================================
# Helper Functions
# ==============================================================================

log() {
  echo -e "[INFO] $1"
}

err() {
  echo -e "[ERROR] $1" >&2
  exit 1
}

check_cmd() {
  command -v "$1" >/dev/null 2>&1
}

# ==============================================================================
# Main Logic
# ==============================================================================

# Check for dependencies.
check_cmd "curl" || err "You need curl to run this script."

# The release to download from.
RELEASE_NAME="cli-v0.1.0"

# Determine the operating system and asset name.
OS="$(uname -s)"
case "$OS" in
Linux)
  ASSET_NAME="clickr-linux-x86_64"
  ;;
Darwin)
  ARCH="$(uname -m)"
  case "$ARCH" in
  arm64 | aarch64)
    ASSET_NAME="clickr-macos-arm64"
    ;;
  *)
    err "Unsupported macOS architecture: $ARCH"
    ;;
  esac
  ;;
*)
  err "Unsupported operating system: $OS"
  ;;
esac

# Construct the download URL.
DOWNLOAD_URL="https://github.com/clickrTeam/clickr-app/releases/download/${RELEASE_NAME}/${ASSET_NAME}"

# Set the installation directory.
INSTALL_DIR="/usr/local/bin"

# Set the binary name.
BINARY_NAME="clickr"

# Download the binary.
log "Downloading $BINARY_NAME from release $RELEASE_NAME..."
if ! curl -sSL "$DOWNLOAD_URL" -o "$INSTALL_DIR/$BINARY_NAME"; then
  err "Failed to download asset. Please check the release name and asset name."
fi

# Make the binary executable.
log "Making the binary executable..."
if ! chmod +x "$INSTALL_DIR/$BINARY_NAME"; then
  err "Failed to make the binary executable. You may need to run this script with sudo."
fi

log "$BINARY_NAME has been installed successfully!"
log "You can now run it by typing '$BINARY_NAME' in your terminal."
