import { create } from 'zustand'
import { AppSettings } from '@shared/types'
import { DEFAULT_SETTINGS } from '@shared/constants'
import toast from 'react-hot-toast'

interface SettingsStore {
  settings: AppSettings
  isLoading: boolean
  
  // Actions
  fetchSettings: () => Promise<void>
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>
  resetSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true })
    try {
      const settings = await window.electronAPI.settings.get()
      set({ settings, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Failed to load settings')
      set({ isLoading: false })
    }
  },

  updateSettings: async (newSettings: Partial<AppSettings>) => {
    try {
      await window.electronAPI.settings.update(newSettings)
      set({ settings: { ...get().settings, ...newSettings } })
      toast.success('Settings updated')
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast.error('Failed to update settings')
    }
  },

  resetSettings: async () => {
    try {
      await window.electronAPI.settings.update(DEFAULT_SETTINGS)
      set({ settings: DEFAULT_SETTINGS })
      toast.success('Settings reset to defaults')
    } catch (error) {
      console.error('Failed to reset settings:', error)
      toast.error('Failed to reset settings')
    }
  }
}))