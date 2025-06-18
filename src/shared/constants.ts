export const APP_NAME = 'ClipSense'
export const APP_VERSION = '1.0.0'

export const DEFAULT_SETTINGS = {
  theme: 'system' as const,
  maxHistoryItems: 1000,
  autoStart: true,
  showNotifications: true,
  globalShortcut: 'CommandOrControl+Shift+V',
  encryptSensitiveData: true,
  autoDeleteSensitive: true,
  sensitiveDataTTL: 300000, // 5 minutes
  language: 'en'
}

export const SENSITIVE_PATTERNS = [
  /\b[A-Za-z0-9]{32,}\b/, // API keys
  /\bpassword\s*[:=]\s*[^\s]+/i,
  /\btoken\s*[:=]\s*[^\s]+/i,
  /\bsecret\s*[:=]\s*[^\s]+/i,
  /\bkey\s*[:=]\s*[^\s]+/i,
  /-----BEGIN [A-Z ]+-----[\s\S]*?-----END [A-Z ]+-----/, // Private keys
  /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/ // Credit cards
]

export const CONTENT_TYPES = {
  URL: 'url',
  EMAIL: 'email',
  PHONE: 'phone',
  COLOR: 'color',
  JSON: 'json',
  XML: 'xml',
  CODE: 'code',
  IP_ADDRESS: 'ip_address',
  CRYPTO_ADDRESS: 'crypto_address',
  FILE_PATH: 'file_path',
  COORDINATES: 'coordinates',
  DATE: 'date',
  UUID: 'uuid',
  BASE64: 'base64',
  MARKDOWN: 'markdown',
  SQL: 'sql',
  SENSITIVE: 'sensitive'
} as const

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_WINDOW: 'CommandOrControl+Shift+V',
  QUICK_PASTE: 'CommandOrControl+Shift+P',
  SEARCH: 'CommandOrControl+F',
  CLEAR_HISTORY: 'CommandOrControl+Shift+Delete'
} as const

export const TRAY_MENU_ITEMS = {
  SHOW: 'Show ClipSense',
  HIDE: 'Hide ClipSense',
  SETTINGS: 'Settings',
  QUIT: 'Quit'
} as const

export const DATABASE_VERSION = 1
export const MAX_CONTENT_LENGTH = 10000
export const ANALYSIS_DEBOUNCE_MS = 500
export const UI_DEBOUNCE_MS = 300