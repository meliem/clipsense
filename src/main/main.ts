import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { ClipboardMonitor } from './clipboard-monitor'
import { Database } from './database'
import { TrayManager } from './tray-manager'
import { GlobalShortcuts } from './global-shortcuts'
import { ContentAnalyzer } from './content-analyzer'
import { DEFAULT_SETTINGS } from '@shared/constants'

class ClipSenseApp {
  private mainWindow: BrowserWindow | null = null
  private clipboardMonitor: ClipboardMonitor | null = null
  private database: Database | null = null
  private trayManager: TrayManager | null = null
  private globalShortcuts: GlobalShortcuts | null = null
  private contentAnalyzer: ContentAnalyzer | null = null

  constructor() {
    this.setupApp()
  }

  private setupApp() {
    // Set app user model id for Windows
    electronApp.setAppUserModelId('com.clipsense.app')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    app.whenReady().then(() => {
      this.initialize()
    })

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow()
      }
    })

    app.on('before-quit', () => {
      this.cleanup()
    })
  }

  private async initialize() {
    try {
      // Initialize database
      this.database = new Database()
      await this.database.initialize()

      // Initialize content analyzer
      this.contentAnalyzer = new ContentAnalyzer()

      // Initialize clipboard monitor
      this.clipboardMonitor = new ClipboardMonitor(this.database, this.contentAnalyzer)
      this.clipboardMonitor.start()

      // Create main window
      this.createWindow()

      // Initialize system tray
      this.trayManager = new TrayManager(() => this.toggleWindow())

      // Initialize global shortcuts
      this.globalShortcuts = new GlobalShortcuts(() => this.toggleWindow())

      // Setup IPC handlers
      this.setupIpcHandlers()

      console.log('ClipSense initialized successfully')
    } catch (error) {
      console.error('Failed to initialize ClipSense:', error)
      app.quit()
    }
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      minWidth: 800,
      minHeight: 600,
      show: false,
      autoHideMenuBar: true,
      icon: icon,
      webPreferences: {
        preload: join(__dirname, '../preload/preload.js'),
        sandbox: false,
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false
      }
    })

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
    })

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }

  private setupIpcHandlers(): void {
    if (!this.database || !this.contentAnalyzer) return

    // Clipboard handlers
    ipcMain.handle('clipboard:getHistory', async () => {
      return await this.database!.getClipboardHistory()
    })

    ipcMain.handle('clipboard:getItem', async (_, id: string) => {
      return await this.database!.getClipboardItem(id)
    })

    ipcMain.handle('clipboard:deleteItem', async (_, id: string) => {
      await this.database!.deleteClipboardItem(id)
    })

    ipcMain.handle('clipboard:toggleFavorite', async (_, id: string) => {
      await this.database!.toggleFavorite(id)
    })

    ipcMain.handle('clipboard:addTags', async (_, id: string, tags: string[]) => {
      await this.database!.addTags(id, tags)
    })

    ipcMain.handle('clipboard:removeTags', async (_, id: string, tags: string[]) => {
      await this.database!.removeTags(id, tags)
    })

    ipcMain.handle('clipboard:search', async (_, query: string, filters: any) => {
      return await this.database!.searchClipboardItems(query, filters)
    })

    ipcMain.handle('clipboard:copyToClipboard', async (_, content: string) => {
      if (this.clipboardMonitor) {
        this.clipboardMonitor.copyToClipboard(content)
      }
    })

    // Settings handlers
    ipcMain.handle('settings:get', async () => {
      return await this.database!.getSettings()
    })

    ipcMain.handle('settings:update', async (_, settings: any) => {
      await this.database!.updateSettings(settings)
    })

    // Template handlers
    ipcMain.handle('templates:getAll', async () => {
      return await this.database!.getTemplates()
    })

    ipcMain.handle('templates:create', async (_, template: any) => {
      return await this.database!.createTemplate(template)
    })

    ipcMain.handle('templates:update', async (_, id: string, template: any) => {
      await this.database!.updateTemplate(id, template)
    })

    ipcMain.handle('templates:delete', async (_, id: string) => {
      await this.database!.deleteTemplate(id)
    })

    // Window handlers
    ipcMain.handle('window:show', () => {
      this.mainWindow?.show()
    })

    ipcMain.handle('window:hide', () => {
      this.mainWindow?.hide()
    })

    ipcMain.handle('window:minimize', () => {
      this.mainWindow?.minimize()
    })

    ipcMain.handle('window:close', () => {
      this.mainWindow?.close()
    })

    // App handlers
    ipcMain.handle('app:getVersion', () => {
      return app.getVersion()
    })

    ipcMain.handle('app:quit', () => {
      app.quit()
    })
  }

  private toggleWindow(): void {
    if (this.mainWindow) {
      if (this.mainWindow.isVisible()) {
        this.mainWindow.hide()
      } else {
        this.mainWindow.show()
        this.mainWindow.focus()
      }
    }
  }

  private cleanup(): void {
    this.clipboardMonitor?.stop()
    this.globalShortcuts?.unregisterAll()
    this.database?.close()
  }
}

// Initialize the app
new ClipSenseApp()