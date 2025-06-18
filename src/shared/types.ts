export interface ClipboardItem {
  id: string
  content: string
  contentType: 'text' | 'image' | 'files'
  detectedTypes: DetectedType[]
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
  isFavorite: boolean
  isDeleted: boolean
  tags: string[]
}

export interface DetectedType {
  type: string
  confidence: number
  metadata: Record<string, any>
  preview?: string
}

export interface ContentAnalyzer {
  type: string
  name: string
  detect: (content: string) => boolean
  analyze: (content: string) => AnalysisResult
  getSuggestions: (content: string, analysis: AnalysisResult) => Suggestion[]
}

export interface AnalysisResult {
  confidence: number
  metadata: Record<string, any>
  preview?: string
}

export interface Suggestion {
  id: string
  label: string
  action: string
  params?: Record<string, any>
  icon?: string
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  maxHistoryItems: number
  autoStart: boolean
  showNotifications: boolean
  globalShortcut: string
  encryptSensitiveData: boolean
  autoDeleteSensitive: boolean
  sensitiveDataTTL: number
  language: string
}

export interface Template {
  id: string
  name: string
  template: string
  variables: string[]
  createdAt: Date
}

export interface SearchFilters {
  contentType?: string[]
  detectedTypes?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
  isFavorite?: boolean
}

export interface ElectronAPI {
  clipboard: {
    getHistory: () => Promise<ClipboardItem[]>
    getItem: (id: string) => Promise<ClipboardItem | null>
    deleteItem: (id: string) => Promise<void>
    toggleFavorite: (id: string) => Promise<void>
    addTags: (id: string, tags: string[]) => Promise<void>
    removeTags: (id: string, tags: string[]) => Promise<void>
    search: (query: string, filters?: SearchFilters) => Promise<ClipboardItem[]>
    copyToClipboard: (content: string) => Promise<void>
  }
  settings: {
    get: () => Promise<AppSettings>
    update: (settings: Partial<AppSettings>) => Promise<void>
  }
  templates: {
    getAll: () => Promise<Template[]>
    create: (template: Omit<Template, 'id' | 'createdAt'>) => Promise<Template>
    update: (id: string, template: Partial<Template>) => Promise<void>
    delete: (id: string) => Promise<void>
  }
  window: {
    show: () => void
    hide: () => void
    minimize: () => void
    close: () => void
  }
  app: {
    getVersion: () => Promise<string>
    quit: () => void
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}