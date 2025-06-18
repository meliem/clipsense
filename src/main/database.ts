import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { ClipboardItem, AppSettings, Template, SearchFilters } from '@shared/types'
import { DEFAULT_SETTINGS, DATABASE_VERSION } from '@shared/constants'

export class Database {
  private db: Database.Database | null = null
  private dbPath: string

  constructor() {
    const userDataPath = app.getPath('userData')
    this.dbPath = join(userDataPath, 'clipsense.db')
  }

  async initialize(): Promise<void> {
    try {
      this.db = new (Database as any)(this.dbPath)
      this.db!.pragma('journal_mode = WAL')
      this.db!.pragma('foreign_keys = ON')
      
      await this.createTables()
      await this.runMigrations()
      
      console.log('Database initialized successfully')
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw error
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const createClipsTable = `
      CREATE TABLE IF NOT EXISTS clips (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        content_type TEXT NOT NULL,
        detected_types TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_favorite BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE,
        tags TEXT
      )
    `

    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `

    const createTemplatesTable = `
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        template TEXT NOT NULL,
        variables TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `

    const createVersionTable = `
      CREATE TABLE IF NOT EXISTS version (
        version INTEGER PRIMARY KEY
      )
    `

    this.db.exec(createClipsTable)
    this.db.exec(createSettingsTable)
    this.db.exec(createTemplatesTable)
    this.db.exec(createVersionTable)

    // Create indexes for better performance
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_clips_created_at ON clips(created_at)')
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_clips_content_type ON clips(content_type)')
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_clips_is_favorite ON clips(is_favorite)')
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_clips_is_deleted ON clips(is_deleted)')

    // Initialize default settings
    await this.initializeDefaultSettings()
  }

  private async initializeDefaultSettings(): Promise<void> {
    if (!this.db) return

    const existingSettings = this.db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number }
    
    if (existingSettings.count === 0) {
      const insertSetting = this.db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
      
      Object.entries(DEFAULT_SETTINGS).forEach(([key, value]) => {
        insertSetting.run(key, JSON.stringify(value))
      })
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) return

    const versionResult = this.db.prepare('SELECT version FROM version LIMIT 1').get() as { version: number } | undefined
    const currentVersion = versionResult?.version || 0

    if (currentVersion < DATABASE_VERSION) {
      // Run migrations here
      console.log(`Migrating database from version ${currentVersion} to ${DATABASE_VERSION}`)
      
      if (currentVersion === 0) {
        this.db.prepare('INSERT OR REPLACE INTO version (version) VALUES (?)').run(DATABASE_VERSION)
      }
    }
  }

  async saveClipboardItem(item: Omit<ClipboardItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized')

    const id = uuidv4()
    const now = new Date().toISOString()

    const insertClip = this.db.prepare(`
      INSERT INTO clips (id, content, content_type, detected_types, metadata, created_at, updated_at, is_favorite, is_deleted, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insertClip.run(
      id,
      item.content,
      item.contentType,
      JSON.stringify(item.detectedTypes),
      JSON.stringify(item.metadata),
      now,
      now,
      item.isFavorite,
      item.isDeleted,
      JSON.stringify(item.tags)
    )

    return id
  }

  async getClipboardHistory(limit: number = 100): Promise<ClipboardItem[]> {
    if (!this.db) throw new Error('Database not initialized')

    const query = this.db.prepare(`
      SELECT * FROM clips 
      WHERE is_deleted = FALSE 
      ORDER BY created_at DESC 
      LIMIT ?
    `)

    const rows = query.all(limit) as any[]
    return rows.map(this.mapRowToClipboardItem)
  }

  async getClipboardItem(id: string): Promise<ClipboardItem | null> {
    if (!this.db) throw new Error('Database not initialized')

    const query = this.db.prepare('SELECT * FROM clips WHERE id = ? AND is_deleted = FALSE')
    const row = query.get(id) as any

    return row ? this.mapRowToClipboardItem(row) : null
  }

  async deleteClipboardItem(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const query = this.db.prepare('UPDATE clips SET is_deleted = TRUE, updated_at = ? WHERE id = ?')
    query.run(new Date().toISOString(), id)
  }

  async toggleFavorite(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const query = this.db.prepare('UPDATE clips SET is_favorite = NOT is_favorite, updated_at = ? WHERE id = ?')
    query.run(new Date().toISOString(), id)
  }

  async addTags(id: string, tags: string[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const item = await this.getClipboardItem(id)
    if (!item) return

    const existingTags = item.tags || []
    const newTags = [...new Set([...existingTags, ...tags])]

    const query = this.db.prepare('UPDATE clips SET tags = ?, updated_at = ? WHERE id = ?')
    query.run(JSON.stringify(newTags), new Date().toISOString(), id)
  }

  async removeTags(id: string, tags: string[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const item = await this.getClipboardItem(id)
    if (!item) return

    const existingTags = item.tags || []
    const newTags = existingTags.filter(tag => !tags.includes(tag))

    const query = this.db.prepare('UPDATE clips SET tags = ?, updated_at = ? WHERE id = ?')
    query.run(JSON.stringify(newTags), new Date().toISOString(), id)
  }

  async searchClipboardItems(searchQuery: string, filters?: SearchFilters): Promise<ClipboardItem[]> {
    if (!this.db) throw new Error('Database not initialized')

    let query = 'SELECT * FROM clips WHERE is_deleted = FALSE'
    const params: any[] = []

    if (searchQuery) {
      query += ' AND content LIKE ?'
      params.push(`%${searchQuery}%`)
    }

    if (filters?.contentType?.length) {
      query += ` AND content_type IN (${filters.contentType.map(() => '?').join(', ')})`
      params.push(...filters.contentType)
    }

    if (filters?.isFavorite !== undefined) {
      query += ' AND is_favorite = ?'
      params.push(filters.isFavorite)
    }

    if (filters?.dateRange) {
      query += ' AND created_at BETWEEN ? AND ?'
      params.push(filters.dateRange.start.toISOString(), filters.dateRange.end.toISOString())
    }

    query += ' ORDER BY created_at DESC LIMIT 100'

    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params) as any[]
    
    return rows.map(this.mapRowToClipboardItem)
  }

  async getSettings(): Promise<AppSettings> {
    if (!this.db) throw new Error('Database not initialized')

    const query = this.db.prepare('SELECT key, value FROM settings')
    const rows = query.all() as { key: string; value: string }[]

    const settings: any = {}
    rows.forEach(row => {
      settings[row.key] = JSON.parse(row.value)
    })

    return { ...DEFAULT_SETTINGS, ...settings }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const updateSetting = this.db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)')
    const now = new Date().toISOString()

    Object.entries(settings).forEach(([key, value]) => {
      updateSetting.run(key, JSON.stringify(value), now)
    })
  }

  async getTemplates(): Promise<Template[]> {
    if (!this.db) throw new Error('Database not initialized')

    const query = this.db.prepare('SELECT * FROM templates ORDER BY created_at DESC')
    const rows = query.all() as any[]

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      template: row.template,
      variables: JSON.parse(row.variables || '[]'),
      createdAt: new Date(row.created_at)
    }))
  }

  async createTemplate(template: Omit<Template, 'id' | 'createdAt'>): Promise<Template> {
    if (!this.db) throw new Error('Database not initialized')

    const id = uuidv4()
    const now = new Date().toISOString()

    const insertTemplate = this.db.prepare(`
      INSERT INTO templates (id, name, template, variables, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)

    insertTemplate.run(
      id,
      template.name,
      template.template,
      JSON.stringify(template.variables),
      now
    )

    return {
      id,
      name: template.name,
      template: template.template,
      variables: template.variables,
      createdAt: new Date(now)
    }
  }

  async updateTemplate(id: string, template: Partial<Template>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const updates: string[] = []
    const params: any[] = []

    if (template.name) {
      updates.push('name = ?')
      params.push(template.name)
    }

    if (template.template) {
      updates.push('template = ?')
      params.push(template.template)
    }

    if (template.variables) {
      updates.push('variables = ?')
      params.push(JSON.stringify(template.variables))
    }

    if (updates.length === 0) return

    const query = `UPDATE templates SET ${updates.join(', ')} WHERE id = ?`
    params.push(id)

    const stmt = this.db.prepare(query)
    stmt.run(...params)
  }

  async deleteTemplate(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const query = this.db.prepare('DELETE FROM templates WHERE id = ?')
    query.run(id)
  }

  private mapRowToClipboardItem(row: any): ClipboardItem {
    return {
      id: row.id,
      content: row.content,
      contentType: row.content_type,
      detectedTypes: JSON.parse(row.detected_types || '[]'),
      metadata: JSON.parse(row.metadata || '{}'),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      isFavorite: Boolean(row.is_favorite),
      isDeleted: Boolean(row.is_deleted),
      tags: JSON.parse(row.tags || '[]')
    }
  }

  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}