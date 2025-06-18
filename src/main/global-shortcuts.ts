import { globalShortcut } from 'electron'
import { KEYBOARD_SHORTCUTS } from '@shared/constants'

export class GlobalShortcuts {
  private registeredShortcuts: Set<string> = new Set()
  private toggleWindow: () => void

  constructor(toggleWindow: () => void) {
    this.toggleWindow = toggleWindow
    this.registerDefaultShortcuts()
  }

  private registerDefaultShortcuts(): void {
    // Register main toggle shortcut
    this.registerShortcut(KEYBOARD_SHORTCUTS.TOGGLE_WINDOW, () => {
      this.toggleWindow()
    })

    console.log('Global shortcuts registered')
  }

  registerShortcut(accelerator: string, callback: () => void): boolean {
    try {
      // Unregister if already exists
      if (this.registeredShortcuts.has(accelerator)) {
        globalShortcut.unregister(accelerator)
      }

      // Register new shortcut
      const success = globalShortcut.register(accelerator, callback)
      
      if (success) {
        this.registeredShortcuts.add(accelerator)
        console.log(`Global shortcut registered: ${accelerator}`)
        return true
      } else {
        console.warn(`Failed to register global shortcut: ${accelerator}`)
        return false
      }
    } catch (error) {
      console.error(`Error registering global shortcut ${accelerator}:`, error)
      return false
    }
  }

  unregisterShortcut(accelerator: string): void {
    try {
      if (this.registeredShortcuts.has(accelerator)) {
        globalShortcut.unregister(accelerator)
        this.registeredShortcuts.delete(accelerator)
        console.log(`Global shortcut unregistered: ${accelerator}`)
      }
    } catch (error) {
      console.error(`Error unregistering global shortcut ${accelerator}:`, error)
    }
  }

  updateShortcut(oldAccelerator: string, newAccelerator: string, callback: () => void): boolean {
    this.unregisterShortcut(oldAccelerator)
    return this.registerShortcut(newAccelerator, callback)
  }

  unregisterAll(): void {
    try {
      globalShortcut.unregisterAll()
      this.registeredShortcuts.clear()
      console.log('All global shortcuts unregistered')
    } catch (error) {
      console.error('Error unregistering all global shortcuts:', error)
    }
  }

  isRegistered(accelerator: string): boolean {
    return globalShortcut.isRegistered(accelerator)
  }

  getRegisteredShortcuts(): string[] {
    return Array.from(this.registeredShortcuts)
  }
}