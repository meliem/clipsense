import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { ClipboardList } from './components/ClipboardList'
import { Sidebar } from './components/Sidebar'
import { useClipboardStore } from './stores/clipboard-store'
import { useSettingsStore } from './stores/settings-store'
import { useTheme } from './hooks/useTheme'

function App() {
  const { fetchHistory, isLoading } = useClipboardStore()
  const { fetchSettings } = useSettingsStore()
  const { theme } = useTheme()

  useEffect(() => {
    // Initialize app data
    const initializeApp = async () => {
      try {
        await fetchSettings()
        await fetchHistory()
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }

    initializeApp()
  }, [fetchSettings, fetchHistory])

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex-1 flex overflow-hidden bg-white dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header />
          
          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <SearchBar />
          </div>
          
          {/* Clipboard List */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <ClipboardList />
            )}
          </div>
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#374151' : '#ffffff',
            color: theme === 'dark' ? '#f9fafb' : '#111827',
            border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`,
          },
        }}
      />
    </div>
  )
}

export default App