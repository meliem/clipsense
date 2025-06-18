import { clipboard } from 'electron'
import { Database } from './database'
import { ContentAnalyzer } from './content-analyzer'
import { ClipboardItem } from '@shared/types'
import { ANALYSIS_DEBOUNCE_MS, MAX_CONTENT_LENGTH, SENSITIVE_PATTERNS } from '@shared/constants'
import CryptoJS from 'crypto-js'

export class ClipboardMonitor {
  private database: Database
  private contentAnalyzer: ContentAnalyzer
  private isMonitoring = false
  private lastClipboardContent = ''
  private monitorInterval: NodeJS.Timeout | null = null
  private analysisTimeout: NodeJS.Timeout | null = null
  private isProgrammaticChange = false

  constructor(database: Database, contentAnalyzer: ContentAnalyzer) {
    this.database = database
    this.contentAnalyzer = contentAnalyzer
  }

  start(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.lastClipboardContent = clipboard.readText()

    // Monitor clipboard changes every 500ms
    this.monitorInterval = setInterval(() => {
      this.checkClipboardChange()
    }, 500)

    console.log('Clipboard monitoring started')
  }

  stop(): void {
    if (!this.isMonitoring) return

    this.isMonitoring = false

    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
      this.monitorInterval = null
    }

    if (this.analysisTimeout) {
      clearTimeout(this.analysisTimeout)
      this.analysisTimeout = null
    }

    console.log('Clipboard monitoring stopped')
  }

  copyToClipboard(content: string): void {
    this.isProgrammaticChange = true
    clipboard.writeText(content)
    this.lastClipboardContent = content
    
    // Reset flag after a short delay
    setTimeout(() => {
      this.isProgrammaticChange = false
    }, 100)
  }

  private checkClipboardChange(): void {
    if (this.isProgrammaticChange) return

    try {
      const currentContent = clipboard.readText()
      
      if (currentContent !== this.lastClipboardContent && currentContent.trim() !== '') {
        this.lastClipboardContent = currentContent
        this.handleClipboardChange(currentContent)
      }
    } catch (error) {
      console.error('Error reading clipboard:', error)
    }
  }

  private handleClipboardChange(content: string): void {
    // Clear existing analysis timeout
    if (this.analysisTimeout) {
      clearTimeout(this.analysisTimeout)
    }

    // Debounce analysis to avoid excessive processing
    this.analysisTimeout = setTimeout(() => {
      this.analyzeAndStoreContent(content)
    }, ANALYSIS_DEBOUNCE_MS)
  }

  private async analyzeAndStoreContent(content: string): Promise<void> {
    try {
      // Truncate content if too long
      const truncatedContent = content.length > MAX_CONTENT_LENGTH 
        ? content.substring(0, MAX_CONTENT_LENGTH) + '...'
        : content

      // Determine content type
      const contentType = this.determineContentType(truncatedContent)

      // Analyze content
      const detectedTypes = await this.contentAnalyzer.analyzeContent(truncatedContent)

      // Check if content contains sensitive information
      const isSensitive = this.containsSensitiveData(truncatedContent)

      // Create clipboard item
      const clipboardItem: Omit<ClipboardItem, 'id' | 'createdAt' | 'updatedAt'> = {
        content: isSensitive ? this.maskSensitiveContent(truncatedContent) : truncatedContent,
        contentType,
        detectedTypes,
        metadata: {
          originalLength: content.length,
          isTruncated: content.length > MAX_CONTENT_LENGTH,
          isSensitive,
          hash: this.generateContentHash(content)
        },
        isFavorite: false,
        isDeleted: false,
        tags: []
      }

      // Save to database
      await this.database.saveClipboardItem(clipboardItem)

      console.log(`Clipboard item saved: ${contentType} (${detectedTypes.length} types detected)`)
    } catch (error) {
      console.error('Error analyzing and storing clipboard content:', error)
    }
  }

  private determineContentType(content: string): 'text' | 'image' | 'files' {
    // For now, we only handle text content
    // In the future, we can extend this to handle images and files
    return 'text'
  }

  private containsSensitiveData(content: string): boolean {
    return SENSITIVE_PATTERNS.some(pattern => pattern.test(content))
  }

  private maskSensitiveContent(content: string): string {
    let maskedContent = content

    SENSITIVE_PATTERNS.forEach(pattern => {
      maskedContent = maskedContent.replace(pattern, (match) => {
        // Keep first and last 2 characters, mask the rest
        if (match.length <= 4) return '*'.repeat(match.length)
        return match.slice(0, 2) + '*'.repeat(match.length - 4) + match.slice(-2)
      })
    })

    return maskedContent
  }

  private generateContentHash(content: string): string {
    return CryptoJS.SHA256(content).toString()
  }
}