import { Settings, Minimize2, X } from 'lucide-react'
import { useState } from 'react'
import { useSettingsStore } from '../stores/settings-store'
import { SettingsModal } from './SettingsModal'

export function Header() {
  const [showSettings, setShowSettings] = useState(false)
  const { settings } = useSettingsStore()

  const handleMinimize = () => {
    window.electronAPI.window.minimize()
  }

  const handleClose = () => {
    window.electronAPI.window.hide()
  }

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            ClipSense
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Intelligent Clipboard Manager
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
          
          <button
            onClick={handleMinimize}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Minimize"
          >
            <Minimize2 size={18} />
          </button>
          
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {showSettings && (
        <SettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </>
  )
}