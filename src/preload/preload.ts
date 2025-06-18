import { contextBridge, ipcRenderer } from 'electron'
import { ElectronAPI } from '@shared/types'

const electronAPI: ElectronAPI = {
  clipboard: {
    getHistory: () => ipcRenderer.invoke('clipboard:getHistory'),
    getItem: (id: string) => ipcRenderer.invoke('clipboard:getItem', id),
    deleteItem: (id: string) => ipcRenderer.invoke('clipboard:deleteItem', id),
    toggleFavorite: (id: string) => ipcRenderer.invoke('clipboard:toggleFavorite', id),
    addTags: (id: string, tags: string[]) => ipcRenderer.invoke('clipboard:addTags', id, tags),
    removeTags: (id: string, tags: string[]) => ipcRenderer.invoke('clipboard:removeTags', id, tags),
    search: (query: string, filters?: any) => ipcRenderer.invoke('clipboard:search', query, filters),
    copyToClipboard: (content: string) => ipcRenderer.invoke('clipboard:copyToClipboard', content)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (settings: any) => ipcRenderer.invoke('settings:update', settings)
  },
  templates: {
    getAll: () => ipcRenderer.invoke('templates:getAll'),
    create: (template: any) => ipcRenderer.invoke('templates:create', template),
    update: (id: string, template: any) => ipcRenderer.invoke('templates:update', id, template),
    delete: (id: string) => ipcRenderer.invoke('templates:delete', id)
  },
  window: {
    show: () => ipcRenderer.invoke('window:show'),
    hide: () => ipcRenderer.invoke('window:hide'),
    minimize: () => ipcRenderer.invoke('window:minimize'),
    close: () => ipcRenderer.invoke('window:close')
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    quit: () => ipcRenderer.invoke('app:quit')
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)