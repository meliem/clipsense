import { Tray, Menu, app, nativeImage } from 'electron'
import { join } from 'path'
import { TRAY_MENU_ITEMS } from '@shared/constants'

export class TrayManager {
  private tray: Tray | null = null
  private toggleWindow: () => void

  constructor(toggleWindow: () => void) {
    this.toggleWindow = toggleWindow
    this.createTray()
  }

  private createTray(): void {
    try {
      // Create tray icon
      const iconPath = this.getTrayIconPath()
      const icon = nativeImage.createFromPath(iconPath)
      
      // Resize icon for tray
      const trayIcon = icon.resize({ width: 16, height: 16 })
      trayIcon.setTemplateImage(true)

      this.tray = new Tray(trayIcon)
      this.tray.setToolTip('ClipSense - Intelligent Clipboard Manager')
      
      // Set up tray menu
      this.updateTrayMenu()

      // Handle tray click
      this.tray.on('click', () => {
        this.toggleWindow()
      })

      console.log('System tray initialized')
    } catch (error) {
      console.error('Failed to create system tray:', error)
    }
  }

  private getTrayIconPath(): string {
    // Return appropriate icon path based on platform
    const platform = process.platform
    
    if (platform === 'darwin') {
      return join(__dirname, '../../resources/tray-icon-mac.png')
    } else if (platform === 'win32') {
      return join(__dirname, '../../resources/tray-icon-win.ico')
    } else {
      return join(__dirname, '../../resources/tray-icon-linux.png')
    }
  }

  private updateTrayMenu(): void {
    if (!this.tray) return

    const contextMenu = Menu.buildFromTemplate([
      {
        label: TRAY_MENU_ITEMS.SHOW,
        click: () => {
          this.toggleWindow()
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Recent Items',
        submenu: [
          {
            label: 'No recent items',
            enabled: false
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        label: TRAY_MENU_ITEMS.SETTINGS,
        click: () => {
          // Open settings - will be implemented when settings window is ready
          this.toggleWindow()
        }
      },
      {
        type: 'separator'
      },
      {
        label: TRAY_MENU_ITEMS.QUIT,
        click: () => {
          app.quit()
        }
      }
    ])

    this.tray.setContextMenu(contextMenu)
  }

  updateRecentItems(items: Array<{ id: string; content: string; preview: string }>): void {
    if (!this.tray) return

    const recentItemsMenu = items.slice(0, 5).map(item => ({
      label: item.preview.length > 50 ? item.preview.substring(0, 50) + '...' : item.preview,
      click: () => {
        // Copy item to clipboard
        // This will be implemented when clipboard functionality is ready
        console.log('Copy item to clipboard:', item.id)
      }
    }))

    if (recentItemsMenu.length === 0) {
      recentItemsMenu.push({
        label: 'No recent items',
        enabled: false
      })
    }

    const contextMenu = Menu.buildFromTemplate([
      {
        label: TRAY_MENU_ITEMS.SHOW,
        click: () => {
          this.toggleWindow()
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Recent Items',
        submenu: recentItemsMenu
      },
      {
        type: 'separator'
      },
      {
        label: TRAY_MENU_ITEMS.SETTINGS,
        click: () => {
          this.toggleWindow()
        }
      },
      {
        type: 'separator'
      },
      {
        label: TRAY_MENU_ITEMS.QUIT,
        click: () => {
          app.quit()
        }
      }
    ])

    this.tray.setContextMenu(contextMenu)
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }
}