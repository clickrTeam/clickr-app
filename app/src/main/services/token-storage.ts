import { safeStorage } from 'electron'
import { app } from 'electron'
import log from 'electron-log'
import { join } from 'path'
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs'

interface TokenData {
  access_token: string
  refresh_token: string
  username: string
  expires_at?: number
}

class TokenStorage {
  private tokenFilePath: string
  private tokenCache: TokenData | null = null
  private cacheExpiry: number = 0
  private readonly CACHE_DURATION = 30 * 1000 // 30 seconds

  constructor() {
    // Store encrypted token file in user data directory
    this.tokenFilePath = join(app.getPath('userData'), 'auth_tokens.enc')
  }

  /**
   * Store tokens securely using Electron's safeStorage
   */
  async storeTokens(tokenData: TokenData): Promise<void> {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Encryption is not available on this system')
      }

      const tokenJson = JSON.stringify(tokenData)
      const encryptedData = safeStorage.encryptString(tokenJson)

      writeFileSync(this.tokenFilePath, encryptedData)

      // Update cache
      this.tokenCache = tokenData
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      log.info('Tokens stored securely')
    } catch (error) {
      log.error('Failed to store tokens:', error)
      throw new Error('Failed to store authentication tokens')
    }
  }

  /**
   * Retrieve tokens from secure storage
   */
  async getTokens(): Promise<TokenData | null> {
    try {
      // Check cache first
      if (this.tokenCache && Date.now() < this.cacheExpiry) {
        return this.tokenCache
      }

      if (!existsSync(this.tokenFilePath)) {
        log.info('No stored tokens found')
        this.tokenCache = null
        return null
      }

      if (!safeStorage.isEncryptionAvailable()) {
        log.warn('Encryption not available, clearing stored tokens')
        this.clearTokens()
        return null
      }

      const encryptedData = readFileSync(this.tokenFilePath)
      const decryptedJson = safeStorage.decryptString(encryptedData)
      const tokenData: TokenData = JSON.parse(decryptedJson)

      // Check if tokens are expired (if expiry is set)
      if (tokenData.expires_at && Date.now() > tokenData.expires_at) {
        log.info('Stored tokens have expired')
        this.clearTokens()
        return null
      }

      // Update cache
      this.tokenCache = tokenData
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      const daysUntilExpiry = tokenData.expires_at
        ? Math.ceil((tokenData.expires_at - Date.now()) / (24 * 60 * 60 * 1000))
        : 'unknown'
      log.info(`Tokens retrieved successfully. Days until expiry: ${daysUntilExpiry}`)
      return tokenData
    } catch (error) {
      log.error('Failed to retrieve tokens:', error)
      // If we can't decrypt, clear the corrupted data
      this.clearTokens()
      return null
    }
  }

  /**
   * Clear stored tokens
   */
  clearTokens(): void {
    try {
      if (existsSync(this.tokenFilePath)) {
        unlinkSync(this.tokenFilePath)
        log.info('Stored tokens cleared')
      }
      // Clear cache
      this.tokenCache = null
      this.cacheExpiry = 0
    } catch (error) {
      log.error('Failed to clear tokens:', error)
    }
  }

  /**
   * Check if tokens exist
   */
  hasTokens(): boolean {
    return existsSync(this.tokenFilePath)
  }

  /**
   * Update only the access token (for token refresh scenarios)
   */
  async updateAccessToken(accessToken: string): Promise<void> {
    const existingTokens = await this.getTokens()
    if (existingTokens) {
      existingTokens.access_token = accessToken
      await this.storeTokens(existingTokens)
    }
  }

  /**
   * Update both access and refresh tokens (for extended token refresh)
   */
  async updateTokens(accessToken: string, refreshToken?: string): Promise<void> {
    const existingTokens = await this.getTokens()
    if (existingTokens) {
      existingTokens.access_token = accessToken
      if (refreshToken) {
        existingTokens.refresh_token = refreshToken
        // Reset expiry to 30 days for extended tokens
        existingTokens.expires_at = Date.now() + 30 * 24 * 60 * 60 * 1000
      }
      await this.storeTokens(existingTokens)
    }
  }
}

// Export singleton instance
export const tokenStorage = new TokenStorage()
